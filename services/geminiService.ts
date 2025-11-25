
import { GoogleGenAI } from "@google/genai";
import { AppMode, BackgroundColor, GenerationConfig, Outfit, PhotoSize, LightingStyle, BgPoseMode, TrendStyle, MockupStyle, ImageQuality } from "../types";

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * GET API KEY (AI Studio Style)
 * Priority:
 * 1. User Input (LocalStorage)
 * 2. Environment Variable (Render/Vite)
 */
export const getEffectiveApiKey = (userKey?: string): string | undefined => {
    // 1. Check User Input (Highest Priority)
    if (userKey && userKey.trim().length > 0) {
        return userKey.trim();
    }
    
    let sysKey = '';

    // 2. Check Vite Env (Standard)
    if ((import.meta as any).env && (import.meta as any).env.VITE_API_KEY) {
        sysKey = (import.meta as any).env.VITE_API_KEY;
    }

    // 3. Check Process Env (Render Injection via vite.config.ts)
    if (!sysKey && process.env.API_KEY && process.env.API_KEY.length > 0) {
        sysKey = process.env.API_KEY;
    }

    // Cleanup quotes if present
    if (sysKey) {
        return sysKey.replace(/^['"]|['"]$/g, '').trim();
    }

    return undefined;
};

// DIAGNOSIS TOOL
export interface DiagnosticResult {
    step: 'network' | 'auth' | 'image_model';
    status: 'ok' | 'error';
    message: string;
    details?: string;
    actionUrl?: string;
}

export const diagnoseConnection = async (userKey?: string): Promise<DiagnosticResult[]> => {
    const results: DiagnosticResult[] = [];
    const apiKey = getEffectiveApiKey(userKey);
    
    if (!apiKey) {
        return [{ step: 'auth', status: 'error', message: "Chưa có API Key. Vui lòng nhập Key hoặc cấu hình trên Render." }];
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Step 1: Network
    if (!navigator.onLine) {
        return [{ step: 'network', status: 'error', message: "Không có kết nối Internet." }];
    }
    results.push({ step: 'network', status: 'ok', message: "Kết nối mạng ổn định." });

    // Step 2: Simple Auth Check (Text Model)
    try {
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: 'Hi' }] },
        });
        results.push({ step: 'auth', status: 'ok', message: "API Key hợp lệ." });
    } catch (error: any) {
        return [...results, { step: 'auth', status: 'error', message: "API Key không hoạt động.", details: error.message }];
    }

    // Step 3: Image Model Check (With relaxed handling)
    try {
         await ai.models.generateContent({
             model: 'gemini-2.5-flash-image',
             contents: { parts: [{ text: "Red dot" }] },
             config: { 
                 imageConfig: { aspectRatio: "1:1" },
                 // IMPORTANT: Add safety settings to diagnosis to avoid false negatives
                 safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
                 ]
             }
         });
         results.push({ step: 'image_model', status: 'ok', message: "Tạo ảnh OK." });
    } catch (error: any) {
         const msg = (error.message || '').toLowerCase();
         const status = error.status || error.response?.status;
         
         // If it's just a 429 (Quota), we warn but don't mark as fatal error because Retries might fix it later
         if (status === 429 || msg.includes('quota')) {
             results.push({ 
                 step: 'image_model', 
                 status: 'error', 
                 message: "⚠️ Hết lượt miễn phí (429). Đợi một lát rồi thử lại.", 
                 details: "Đây là lỗi tạm thời do dùng bản Free." 
             });
         } else if (status === 403 || msg.includes('billing')) {
             results.push({ 
                 step: 'image_model', 
                 status: 'error', 
                 message: "❌ Cần bật Billing (Thanh toán) cho Key này.", 
                 actionUrl: "https://console.cloud.google.com/billing" 
             });
         } else {
             results.push({ step: 'image_model', status: 'error', message: "Lỗi model ảnh.", details: error.message });
         }
    }

    return results;
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    const ai = new GoogleGenAI({ apiKey });
    try {
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: 'test' }] },
        });
        return true;
    } catch {
        return false;
    }
};

// HELPER: Retry Logic (Exponential Backoff)
async function generateWithRetry(ai: GoogleGenAI, params: any, retries = 3, initialDelay = 2000): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent(params);
        } catch (error: any) {
            const status = error.status || error.response?.status;
            // Only retry on 429 (Too Many Requests) or 503 (Service Unavailable)
            if ((status === 429 || status === 503) && i < retries - 1) {
                const delay = initialDelay * Math.pow(2, i); // 2s, 4s, 8s
                console.log(`⚠️ Server busy (429). Retrying in ${delay/1000}s... (Attempt ${i+1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

const getOutfitDescription = (outfit: Outfit, custom?: string): string => {
    if (outfit === Outfit.Custom) return custom || "High fashion outfit";
    
    const mapping: Record<string, string> = {
        [Outfit.WhiteShirt]: "Formal white dress shirt, crisp collar, professional business attire, high-quality cotton fabric",
        [Outfit.BlackSuit]: "Bespoke black Italian business suit, silk tie, sharp tailoring, executive look",
        [Outfit.BlueSuit]: "Navy blue premium wool suit, modern slim fit, luxury texture, professional",
        [Outfit.Turtleneck]: "Black luxury cashmere turtleneck, minimalist intellectual look, high-end fashion",
        
        [Outfit.AoDaiWhite]: "Traditional Vietnamese Ao Dai in pure white silk, translucent layers, elegant school uniform style",
        [Outfit.AoDaiRed]: "Festive Red Vietnamese Ao Dai with golden embroidery, Tet holiday celebration style, premium silk",
        [Outfit.AoDaiModern]: "Modern stylized Ao Dai, contemporary cut, pastel colors, fashion forward design",
        
        [Outfit.WeddingDress]: "Haute Couture white wedding gown, intricate lace details, long veil, romantic bridal style",
        [Outfit.GroomSuit]: "Black tuxedo with satin lapels, bow tie, formal wedding groom attire",
        [Outfit.EveningGown]: "Sparkling sequins evening gown, floor-length, red carpet gala aesthetics",
        [Outfit.CocktailDress]: "Chic cocktail dress, sophisticated party wear, high fashion",
        
        [Outfit.StreetwearHype]: "High-end Streetwear: Oversized hoodie, tactical cargo pants, layered accessories, hypebeast aesthetic",
        [Outfit.KoreanCasual]: "Korean Minimalist Fashion: Beige trench coat, soft knit sweater, neutral tones, clean look",
        [Outfit.VintageRetro]: "90s Vintage Aesthetic: Denim jacket, colorful windbreaker, retro vibes, film grain feel",
        [Outfit.LeatherJacket]: "Black leather biker jacket, textured leather, rebellious rock-chic style",
        [Outfit.SummerVibe]: "Summer resort wear, linen shirt or floral dress, bright and airy, vacation vibe",
        
        [Outfit.CyberpunkFashion]: "Futuristic Cyberpunk Techwear: Neon accents, matte black tactical gear, dystopian fashion",
        [Outfit.HanfuChinese]: "Traditional Chinese Hanfu, flowing silk robes, historical embroidery, ethereal style"
    };
    return mapping[outfit] || "Appropriate high-quality outfit";
};

// --- CORE PROCESSING FUNCTION ---
export const processImage = async (
  imageBase64: string,
  config: GenerationConfig,
  mimeType: string = 'image/jpeg',
  userApiKey?: string,
  secondImageBase64?: string
): Promise<string> => {
  
  const apiKey = getEffectiveApiKey(userApiKey);
  if (!apiKey) throw new Error("⛔ CHƯA CÓ API KEY. Vui lòng vào Cài đặt -> Nhập API Key từ Google AI Studio.");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    // --- ULTIMATE CLEAN & FIDELITY ENGINE (UPDATED) ---
    // Focus: Natural Skin, Dodge & Burn, Clean Lines.
    const ULTIMATE_REALISM_PROMPT = `
      OUTPUT QUALITY: CRYSTAL CLEAR, HIGH FIDELITY, STUDIO MASTERPIECE.
      SOURCE GEAR: Hasselblad X2D 100C with 80mm f/1.9 Lens.
      
      [CRITICAL QUALITY RULES - DIGITAL CLEAN]:
      - TEXTURE: Skin must look ALIVE. Retain micropores and vellus hair. NO PLASTIC/WAXY SKIN.
      - LIGHTING: Use "Dodge & Burn" technique to sculpt the face. Highlights on T-zone, gentle contour on cheekbones.
      - NOISE: Zero ISO noise. Clean, smooth gradients.
      - SHARPNESS: Eyes and eyelashes must be razor sharp.
      
      [IDENTITY PRESERVATION - STRICT]:
      - DO NOT change the person's facial structure, bone structure, or key features.
      - Only enhance the presentation (lighting, skin clarity).
      - The output must look like the input person, just professionally retouched.
    `;

    // 1. THE PERSONA - Expert High-End Retoucher
    const persona = `
      [SYSTEM ROLE]: You are a World-Class Photo Retoucher (Vogue/Harper's Bazaar standard).
      Your specialty is "Invisible Retouching" - making people look their best without looking edited.
      [QUALITY STANDARD]: ${ULTIMATE_REALISM_PROMPT}
    `;
    
    // 2. LOGIC BRANCHING - SPECIFIC INSTRUCTIONS PER MODE
    let specificInstructions = "";

    switch (config.mode) {
      // --- 1. ID PHOTO PRO ---
      case AppMode.IDPhoto:
        let bgInstruction = "";
        if (config.bgColor === BackgroundColor.Custom && config.bgColorCustom) bgInstruction = `Solid Color #${config.bgColorCustom}`;
        else if (config.bgColor === BackgroundColor.Blue) bgInstruction = "Standard Visa Blue (#2b75f6)";
        else if (config.bgColor === BackgroundColor.Cyan) bgInstruction = "Professional Gradient Cyan-to-White";
        else if (config.bgColor === BackgroundColor.Luxury) bgInstruction = "Dark Grey Studio Backdrop (Smooth, no noise)";
        else bgInstruction = "Pure White (#FFFFFF), completely clean, no shadows";

        const idOutfit = getOutfitDescription(config.outfit, config.outfitCustom);

        specificInstructions = `
          [TASK: BIOMETRIC ID PHOTO]
          1. **SUBJECT**: Center the person. Keep facial features EXACTLY as they are.
          2. **OUTFIT**: Change clothing to: '${idOutfit}'. Fabric must look clean and pressed.
          3. **BACKGROUND**: ${bgInstruction}. Clean separation from subject.
          4. **RETOUCH**: Apply subtle 'Dodge & Burn' to define the nose and jawline. Remove temporary acne/blemishes ONLY.
          5. **OUTPUT**: Crisp, clean, professional lighting.
        `;
        break;

      // --- 2. LIGHTING / RELIGHTING ---
      case AppMode.Lighting:
        specificInstructions = `
          [TASK: STUDIO RELIGHTING]
          1. **LIGHTING**: Apply '${config.lightingStyle}' style gently.
          2. **DEPTH**: Use shadows to create 3D volume (Dodge & Burn).
          3. **SMOOTHNESS**: Ensure light gradients on skin are smooth, not banded or pixelated.
          4. **USER PROMPT**: ${config.lightingPrompt || ''}
        `;
        break;
        
      // --- 3. CHANGE BACKGROUND ---
      case AppMode.ChangeBackground:
        specificInstructions = `
          [TASK: CLEAN COMPOSITE]
          1. **CUTOUT**: Extract subject with perfect edges (no white halo).
          2. **MERGE**: Place subject into the new background naturally. Match lighting temperature.
          3. **FIDELITY**: Do not change the subject's face or body shape.
          4. **OUTFIT**: ${config.outfit !== Outfit.Original ? `Change outfit to: ${getOutfitDescription(config.outfit)}` : "Keep original outfit."}
        `;
        break;

      // --- 4. REMOVE BACKGROUND ---
      case AppMode.RemoveBackground:
        specificInstructions = `
          [TASK: BACKGROUND REMOVAL]
          1. **ISOLATE**: Keep the subject exactly as is.
          2. **BACKGROUND**: ${config.removeBg.evenBackground ? "Solid Color" : "White/Transparent"}.
          3. **NO CHANGE**: Do not retouch the face or body. Just remove background.
        `;
        break;
      
      // --- 5. TREND ART ---
      case AppMode.Trend:
        specificInstructions = `
           [TASK: STYLIZED ART]
           1. **STYLE**: ${config.trendStyle}
           2. **QUALITY**: Clean lines, smooth colors, high resolution.
           3. **IDENTITY**: Subject must remain recognizable even in art style.
        `;
        break;

      // --- 6. MOCKUP ---
      case AppMode.Mockup:
        specificInstructions = `
            [TASK: PRODUCT PHOTOGRAPHY]
            1. **PRODUCT**: Keep the input object exactly as is (Logo/Text must remain readable).
            2. **SCENE**: ${config.mockup.style}.
            3. **QUALITY**: Sharp, commercial advertising quality. No noise.
        `;
        break;

      // --- 7. RESTORATION ---
      case AppMode.Restoration:
         specificInstructions = `
           [TASK: PHOTO RESTORATION]
           1. **DENOISE**: Aggressively remove grain, noise, and scratches.
           2. **SHARPEN**: Fix blur but do not add fake details.
           3. **FACE**: Recover facial details faithfully. Use 'Healing Brush' logic to fix damaged spots.
           4. **COLOR**: ${config.restoreColorize ? "Natural, muted colors. No oversaturation." : "Keep B&W."}
         `;
         break;

      // --- 8. FACE BALANCE ---
      case AppMode.Balance:
         specificInstructions = `
            [TASK: FACIAL SYMMETRY]
            1. **ADJUST**: Subtle adjustments to symmetry.
            2. **CONTOUR**: Use lighting (Dodge & Burn) to make the face look balanced without warping.
         `;
         break;

      // --- 9. RETOUCH PRO (ENHANCED) ---
      case AppMode.Retouch:
         const smoothLevel = config.retouch.skinSmoothing > 70 ? "Polished" : "Natural Micro-Smoothing";
         const dbLevel = config.retouch.dodgeAndBurn > 50 ? "Strong Contouring" : "Subtle Depth";
         
         specificInstructions = `
            [TASK: HIGH-END BEAUTY RETOUCH]
            1. **BLEMISH REMOVAL (Nhặt mụn)**:
               - Detect and remove: Acne, pimples, small scars, stray hairs on face, and dark spots.
               - DO NOT remove: Moles (beauty marks) or key facial features unless they look temporary.
               - Technique: "Spot Healing Brush" style - clean replacement texture.
            
            2. **SKIN SMOOTHING (Làm mịn nhẹ)**:
               - Level: ${smoothLevel}.
               - Technique: "Frequency Separation". Smooth the color layer but KEEP the texture layer (pores).
               - Result: Skin looks soft and even, but NOT plastic or blurry.
            
            3. **DODGE & BURN (Tạo khối/D&B)**:
               - Level: ${dbLevel}.
               - Action: Brighten the T-zone (forehead, nose bridge, chin). Darken slightly under cheekbones and jawline.
               - Goal: Give the face a 3D sculpted look, reducing flatness.
            
            4. **EYES & LIPS**:
               - Sharpen irises. Add catchlights to eyes.
               - Hydrate lips (slight sheen).
         `;
         break;

      // --- 10. CAMERA RAW ---
      case AppMode.CameraRaw:
         specificInstructions = `
            [TASK: COLOR CORRECTION]
            1. **ADJUST**: Temp ${config.cameraRaw.temperature}, Exposure ${config.cameraRaw.exposure}.
            2. **CLEAN**: Remove any compression artifacts.
            3. **QUALITY**: Save as high-quality JPEG/PNG look.
         `;
         break;

      default:
        specificInstructions = "Clean up the image, remove noise, improve sharpness.";
    }

    // --- CONSTRUCTING THE PAYLOAD ---
    const parts: any[] = [
      { inlineData: { mimeType: mimeType, data: imageBase64 } }
    ];

    if (secondImageBase64) {
        parts.push({ inlineData: { mimeType: mimeType, data: secondImageBase64 } });
        specificInstructions += "\n[INPUT DATA]: Image 1 is the REFERENCE. Image 2 is the TARGET.";
    }

    if (config.customPrompt && config.customPrompt.trim().length > 0) {
        specificInstructions += `\n[USER NOTE]: ${config.customPrompt}`;
    }

    // Combine all prompts
    const finalPrompt = `${persona}\n\n${specificInstructions}\n\n[EXECUTE CLEANUP & GENERATION]`;

    // EXECUTE WITH RETRY LOGIC
    const response = await generateWithRetry(ai, {
      model: 'gemini-2.5-flash-image',
      contents: { parts: [...parts, { text: finalPrompt }] },
      config: {
         imageConfig: { aspectRatio: "1:1" },
         safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
         ]
      }
    });

    // CHECK FOR IMAGE
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/jpeg;base64,${part.inlineData.data}`;
      }
    }

    // IF NO IMAGE, CHECK FOR TEXT REFUSAL
    const textRefusal = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (textRefusal) {
        throw new Error(`AI từ chối tạo ảnh: "${textRefusal}". Vui lòng thử lại với nội dung khác.`);
    }
    
    // IF NOTHING
    throw new Error("AI đã hoàn thành nhưng không trả về dữ liệu. Có thể do nội dung bị bộ lọc an toàn chặn. Hãy thử mô tả khác.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const msg = (error.message || '').toLowerCase();
    const status = error.status || error.response?.status;

    if (status === 429 || msg.includes('quota')) {
       throw new Error("⚠️ SERVER QUÁ TẢI (429): Hết lượt tạo ảnh miễn phí. Vui lòng chờ 1 phút hoặc đổi API Key khác.");
    }
    if (status === 403 || msg.includes('billing')) {
       throw new Error("⛔ LỖI BILLING: Key này chưa bật thanh toán. Hãy dùng Key từ tài khoản có Billing hoặc tạo Key mới.");
    }
    
    throw new Error(`Lỗi xử lý: ${error.message}`);
  }
};