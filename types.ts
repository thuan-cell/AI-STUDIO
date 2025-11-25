

export enum AppMode {
  IDPhoto = 'id_photo',
  Restoration = 'restoration',
  Lighting = 'lighting',
  Balance = 'face_balance',
  Retouch = 'high_end_retouch', 
  CameraRaw = 'camera_raw',
  ChangeBackground = 'change_background',
  RemoveBackground = 'clean_background',
  Trend = 'trend_photo',
  Mockup = 'mockup',
  Settings = 'settings'
}

export enum PhotoSize {
  Size3x4 = '3:4',
  Size4x6 = '2:3', 
  SizeSquare = '1:1',
  Passport = 'passport_standard', 
  Visa = 'visa_standard' 
}

export enum BackgroundColor {
  White = 'white',
  Blue = 'blue',
  Grey = 'grey',
  Red = 'red',
  Cyan = 'cyan_gradient', 
  Luxury = 'luxury_dark', 
  Custom = 'custom'
}

export enum Outfit {
  Original = 'original_clothing',
  Custom = 'custom_outfit',

  // OFFICE & STUDIO (Formal)
  WhiteShirt = 'white_formal_shirt',
  BlackSuit = 'black_business_suit',
  BlueSuit = 'navy_blue_suit',
  Turtleneck = 'black_turtleneck_luxury',
  
  // TRADITIONAL (Vietnam)
  AoDaiWhite = 'ao_dai_white_school',
  AoDaiRed = 'ao_dai_red_tet',
  AoDaiModern = 'ao_dai_modern_fashion',

  // WEDDING & PARTY (Event)
  WeddingDress = 'luxury_wedding_dress',
  GroomSuit = 'groom_tuxedo',
  EveningGown = 'evening_gown_sparkle',
  CocktailDress = 'cocktail_dress_party',

  // STREET STYLE (Casual/Trendy)
  StreetwearHype = 'streetwear_oversize_hypebeast',
  KoreanCasual = 'korean_soft_boy_girl',
  VintageRetro = 'vintage_retro_90s',
  LeatherJacket = 'leather_jacket_biker',
  SummerVibe = 'summer_floral_beach',
  
  // ARTISTIC
  CyberpunkFashion = 'cyberpunk_techwear',
  HanfuChinese = 'hanfu_traditional'
}

export enum HairStyle {
  Auto = 'natural hair style',
  BangsDown = 'hair with bangs down',
  SlickedBack = 'slicked back professional hair',
  Curly = 'soft curly hair', 
  Short = 'neat short cut', 
  Original = 'keep original hair exactly'
}

export enum LightingStyle {
  Side = 'side',
  Hard = 'hard',
  Rembrandt = 'rembrandt',
  Back = 'back',
  Background = 'background',
  Hair = 'hair',
  Split = 'split',
  Silhouette = 'silhouette',
  Ambient = 'ambient',
  Cinematic = 'cinematic_teal_orange', 
  Neon = 'neon_cyberpunk', 
  Custom = 'custom',
  BacklitFull = 'backlit_full'
}

export enum BgPoseMode {
  KeepOriginal = 'keep_original',
  ChangePose = 'change_pose'
}

export enum TrendStyle {
  Begging = 'begging', 
  Model = 'model',     
  Clay = 'clay',
  Cyberpunk = 'cyberpunk', 
  Disney3D = 'disney_3d', 
  Anime = 'anime_makoto_shinkai', 
  OilPainting = 'oil_painting', 
  Sketch = 'pencil_sketch', 
  Custom = 'custom'
}

export enum MockupStyle {
  StudioMinimal = 'studio_minimal',
  LifestyleHand = 'lifestyle_hand',
  NatureOutdoor = 'nature_outdoor',
  LuxuryDark = 'luxury_dark',
  OfficeDesk = 'office_desk',
  Podium3D = 'podium_3d'
}

export interface FaceBalanceConfig {
  smoothHair: number;
  eyeDistance: number;
  eyeSize: number;
  eyeSymmetry: number;
  noseNostrils: number;
  noseBridge: number;
  noseTip: number;
  mouthSymmetry: number;
  teethGums: number;
  smileLines: number;
  jawSlim: number;
  chinVLine: number;
}

export interface RetouchConfig {
  blemishRemoval: number;
  skinSmoothing: number;
  dodgeAndBurn: number;
  brightenEyes: number;
  makeup: number;
  ageReduction: number; 
  skinTone: 'neutral' | 'warm' | 'cool' | 'rosy' | 'tan'; 
}

export interface CameraRawConfig {
  temperature: number;
  tint: number;
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  texture: number;
  clarity: number;
  dehaze: number;
  vibrance: number;
  saturation: number;
}

export interface RemoveBgConfig {
  removeDetails: boolean;
  evenBackground: boolean;
  reduceNoise: boolean;
  sharpen: boolean;
  customPrompt?: string;
}

export interface MockupConfig {
  style: MockupStyle;
}

// NEW: Quality Settings
export enum ImageQuality {
  Standard = 'standard', // Fast
  High = 'high',         // Balanced
  Ultra4K = '4k',        // High Res
  Masterpiece8K = '8k'   // Maximum Detail
}

export interface GenerationConfig {
  mode: AppMode;
  size: PhotoSize;
  bgColor: BackgroundColor;
  bgColorCustom?: string;
  outfit: Outfit;
  outfitCustom?: string;
  hairStyle: HairStyle;
  keepFeatures: boolean;
  smoothSkin: boolean;
  slightSmile: boolean;
  restoreColorize: boolean;
  restoreScratches: boolean;
  restoreSharpen: boolean;
  restoreDetailLevel: 'low' | 'medium' | 'high'; 
  lightingStyle: LightingStyle;
  lightingPrompt?: string;
  faceBalance: FaceBalanceConfig;
  retouch: RetouchConfig;
  cameraRaw: CameraRawConfig;
  removeBg: RemoveBgConfig;
  bgScenePrompt: string;
  bgReferenceImage?: string;
  bgPoseMode: BgPoseMode;
  bgLightingMode: string;
  bgImageCount: number;
  trendStyle?: TrendStyle;
  trendPrompt?: string;
  trendImageCount?: number;
  mockup: MockupConfig;
  customPrompt?: string;
  
  // NEW FIELDS
  quality: ImageQuality;
}

export interface GeneratedImage {
  url: string;
  config: GenerationConfig;
}

export interface LicenseStatus {
  isValid: boolean;
  message?: string;
  expiryDate?: Date;
}