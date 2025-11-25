

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Settings2, Sparkles, Layers, Wand2, User, Monitor, Menu, ScanFace, Wand, Maximize2, X, Loader2, AlertCircle, Lock, SlidersHorizontal, Save, RefreshCw, Sun, Moon } from 'lucide-react';

import { blobToBase64, processImage, validateApiKey, getEffectiveApiKey } from './services/geminiService';
import { getMachineId, getSavedLicenseKey, validateLicense, saveLicenseKey, LicenseStatus } from './services/licenseService';
import { AppMode, BackgroundColor, GenerationConfig, HairStyle, Outfit, PhotoSize, LightingStyle, BgPoseMode, TrendStyle, MockupStyle, ImageQuality } from './types';

// Feature Components
import { IdPhotoSettingsPanel } from './features/idPhoto/IdPhotoSettingsPanel';
import { RetouchSettingsPanel } from './features/retouch/RetouchSettingsPanel';
import { RestorationSettingsPanel } from './features/restoration/RestorationSettingsPanel';
import { SymmetrySettingsPanel } from './features/symmetry/SymmetrySettingsPanel';
import { LightingSettingsPanel } from './features/lighting/LightingSettingsPanel';
import { BackgroundSettingsPanel, RemoveBgPanel } from './features/background/BackgroundSettingsPanel';
import { TrendCreatorSettingsPanel } from './features/trendCreator/TrendCreatorSettingsPanel';
import { MockupSettingsPanel } from './features/mockup/MockupSettingsPanel';
import { SettingsApp } from './features/settings/SettingsApp';

// Shared Panels (Optimized Structure)
import { AdvancedProPanel } from './features/common/AdvancedProPanel';
import { CameraRawPanel, CameraRawSVG } from './features/cameraRaw/CameraRawPanel';

const LABELS = {
  vi: { menu_id_photo: "Ảnh thẻ ID", menu_retouch: "Retouch Pro", menu_restoration: "Phục hồi ảnh", menu_balance: "Cân bằng mặt", menu_camera_raw: "Camera Raw", menu_lighting: "Ánh sáng", menu_background: "Ghép nền", menu_remove_bg: "Tách nền", menu_trend: "Trend Art", menu_mockup: "Mockup", menu_settings: "Cài đặt" },
  en: { menu_id_photo: "ID Photo", menu_retouch: "Pro Retouch", menu_restoration: "Restoration", menu_balance: "Face Balance", menu_camera_raw: "Camera Raw", menu_lighting: "Relighting", menu_background: "Change BG", menu_remove_bg: "Remove BG", menu_trend: "Trend Art", menu_mockup: "Mockup", menu_settings: "Settings" }
};

const SidebarItem = ({ icon: Icon, label, mode, activeMode, onSelect, disabled = false }: { icon: any, label: string, mode: AppMode, activeMode: AppMode, onSelect: (m: AppMode) => void, disabled?: boolean }) => {
  const isActive = activeMode === mode;
  return (
    <div onClick={() => !disabled && onSelect(mode)} className={`w-full px-3 py-3 flex items-center gap-3 transition-all rounded-lg relative group select-none border border-transparent ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'} ${isActive ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-900/30 border-primary-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 hover:border-white/5'}`}>
      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white drop-shadow-md' : 'text-slate-500 group-hover:text-slate-300'}`} />
      <span className="text-sm font-medium truncate">{label}</span>
      {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>}
      {disabled && mode !== AppMode.Settings && <Lock className="absolute right-3 w-3 h-3 text-slate-600" />}
    </div>
  );
};

const App: React.FC = () => {
  const [isActivated, setIsActivated] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [secondFile, setSecondFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [secondPreviewUrl, setSecondPreviewUrl] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const t = LABELS[lang];

  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('user_gemini_key') || '');
  const [tempApiKey, setTempApiKey] = useState(userApiKey);
  const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');

  const [machineId, setMachineId] = useState('');
  const [licenseInput, setLicenseInput] = useState('');
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [config, setConfig] = useState<GenerationConfig>({
    mode: AppMode.IDPhoto, 
    size: PhotoSize.Size3x4, 
    bgColor: BackgroundColor.White, 
    outfit: Outfit.WhiteShirt, 
    hairStyle: HairStyle.Auto, 
    keepFeatures: true, 
    smoothSkin: true, 
    slightSmile: false, 
    restoreColorize: true, 
    restoreScratches: true, 
    restoreSharpen: true,
    restoreDetailLevel: 'medium',
    lightingStyle: LightingStyle.Side, 
    lightingPrompt: '', 
    faceBalance: { smoothHair: 0, eyeDistance: 0, eyeSize: 0, eyeSymmetry: 0, noseNostrils: 0, noseBridge: 0, noseTip: 0, mouthSymmetry: 0, teethGums: 0, smileLines: 0, jawSlim: 0, chinVLine: 0 },
    retouch: { blemishRemoval: 80, skinSmoothing: 40, dodgeAndBurn: 30, brightenEyes: 30, makeup: 20, ageReduction: 0, skinTone: 'neutral' },
    cameraRaw: { temperature: 0, tint: 0, exposure: 0, contrast: 0, highlights: 0, shadows: 0, whites: 0, blacks: 0, texture: 0, clarity: 0, dehaze: 0, vibrance: 0, saturation: 0 },
    removeBg: { removeDetails: true, evenBackground: true, reduceNoise: true, sharpen: true, customPrompt: '' },
    bgScenePrompt: '', 
    bgPoseMode: BgPoseMode.KeepOriginal, 
    bgLightingMode: 'Mặc định', 
    bgImageCount: 1, 
    trendStyle: TrendStyle.Clay, 
    trendPrompt: '', 
    trendImageCount: 1, 
    mockup: { style: MockupStyle.StudioMinimal }, 
    customPrompt: '',
    // DEFAULT QUALITY IS HIGH
    quality: ImageQuality.High
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const secondFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMachineId(getMachineId());
    const checkLicense = () => {
      const license = getSavedLicenseKey();
      if (!license) { setIsActivated(false); setLicenseStatus(null); return; }
      setLicenseInput(license);
      const status = validateLicense(license);
      if (status.isValid) { setIsActivated(true); setLicenseStatus({ isValid: true, message: "Đã kích hoạt.", expiryDate: status.expiryDate }); }
      else { setIsActivated(false); setLicenseStatus({ isValid: false, message: status.message || "Key hết hạn hoặc không hợp lệ." }); }
    };
    checkLicense();
    const intervalId = setInterval(() => { checkLicense(); }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => { if (!isActivated && config.mode !== AppMode.Settings) setConfig(prev => ({...prev, mode: AppMode.Settings})); }, [isActivated]); 
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, isSecond: boolean = false) => {
    const file = event.target.files?.[0];
    if (file) {
      if (isSecond) { setSecondFile(file); setSecondPreviewUrl(URL.createObjectURL(file)); }
      else { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); setGeneratedImage(null); setError(null); }
    }
  };
  const handleClearSecondFile = () => { setSecondFile(null); setSecondPreviewUrl(null); if (secondFileInputRef.current) secondFileInputRef.current.value = ''; };

  // Deprecated in favor of direct prop passing, but kept for compatibility
  const handleCheckKey = async () => { const key = tempApiKey.trim(); if (!key) return; setCheckStatus('checking'); try { const isValid = await validateApiKey(key); setCheckStatus(isValid ? 'valid' : 'invalid'); } catch { setCheckStatus('invalid'); } };
  const handleSaveKey = () => { localStorage.setItem('user_gemini_key', tempApiKey.trim()); setUserApiKey(tempApiKey.trim()); };
  const handleCopySerial = () => { navigator.clipboard.writeText(machineId); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); };
  const handleCheckLicense = () => { const status = validateLicense(licenseInput.trim()); setLicenseStatus(status.isValid ? { isValid: true, message: "Khóa hợp lệ.", expiryDate: status.expiryDate } : { isValid: false, message: status.message || "Khóa không hợp lệ." }); };
  const handleActivateLicense = () => { const status = validateLicense(licenseInput.trim()); if (status.isValid) { saveLicenseKey(licenseInput.trim()); setIsActivated(true); setLicenseStatus({ isValid: true, message: "Đã kích hoạt thành công.", expiryDate: status.expiryDate }); } else { setLicenseStatus({ isValid: false, message: status.message || "Khóa không hợp lệ." }); } };

  const handleApplyCameraRaw = async () => {
    if (!selectedFile || !previewUrl) return;
    setIsProcessing(true);
    try {
      const img = new Image(); img.src = previewUrl; await new Promise(r => img.onload = r);
      const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error("Could not get canvas context");
      ctx.filter = 'url(#cameraRawFilter)'; ctx.drawImage(img, 0, 0, img.width, img.height); ctx.filter = 'none'; 
      canvas.toBlob((blob) => { if (blob) { const newFile = new File([blob], selectedFile.name, { type: selectedFile.type }); setSelectedFile(newFile); setPreviewUrl(URL.createObjectURL(newFile)); setConfig(prev => ({ ...prev, cameraRaw: { temperature: 0, tint: 0, exposure: 0, contrast: 0, highlights: 0, shadows: 0, whites: 0, blacks: 0, texture: 0, clarity: 0, dehaze: 0, vibrance: 0, saturation: 0 } })); setGeneratedImage(null); } setIsProcessing(false); }, selectedFile.type);
    } catch (e) { setError("Lỗi khi áp dụng bộ lọc."); setIsProcessing(false); }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;
    if (config.mode === AppMode.ChangeBackground && !secondFile) {
        setError("Vui lòng tải lên Ảnh nền (Ảnh tham chiếu) để thực hiện ghép nền.");
        return;
    }
    
    // Force refresh key from state or storage before starting
    const currentKey = userApiKey || localStorage.getItem('user_gemini_key') || '';
    const effectiveKey = getEffectiveApiKey(currentKey);
    
    if (!effectiveKey) {
        setConfig(prev => ({...prev, mode: AppMode.Settings}));
        setError("Thiếu API Key. Vui lòng vào Cài đặt và nhập khóa API của bạn.");
        return;
    }

    setIsProcessing(true); setError(null);
    try {
      const base64 = await blobToBase64(selectedFile);
      let secondBase64 = secondFile ? await blobToBase64(secondFile) : undefined;
      const mime = selectedFile.type || 'image/jpeg';
      // Pass the FRESH userApiKey state
      const result = await processImage(base64, config, mime, currentKey, secondBase64);
      setGeneratedImage(result);
    } catch (err: any) { setError(err.message || "Error processing image."); } finally { setIsProcessing(false); }
  };

  const renderConfigControls = () => {
    switch (config.mode) {
      case AppMode.IDPhoto: return <IdPhotoSettingsPanel config={config} setConfig={setConfig} />;
      case AppMode.Lighting: return <LightingSettingsPanel config={config} setConfig={setConfig} />;
      // Pass second file props to BackgroundSettingsPanel
      case AppMode.ChangeBackground: return <BackgroundSettingsPanel config={config} setConfig={setConfig} secondFile={secondFile} secondPreviewUrl={secondPreviewUrl} onUploadSecond={() => secondFileInputRef.current?.click()} onClearSecond={handleClearSecondFile} />;
      case AppMode.RemoveBackground: return <RemoveBgPanel config={config} setConfig={setConfig} />;
      case AppMode.Trend: return <TrendCreatorSettingsPanel config={config} setConfig={setConfig} />;
      case AppMode.Mockup: return <MockupSettingsPanel config={config} setConfig={setConfig} selectedFile={selectedFile} previewUrl={previewUrl} onUploadMain={() => fileInputRef.current?.click()} />;
      case AppMode.Restoration: return <RestorationSettingsPanel config={config} setConfig={setConfig} />;
      case AppMode.Balance: return <SymmetrySettingsPanel config={config} setConfig={setConfig} />;
      case AppMode.Retouch: return <RetouchSettingsPanel config={config} setConfig={setConfig} />;
      case AppMode.CameraRaw: return <CameraRawPanel config={config} setConfig={setConfig} />;
      default: return null;
    }
  };

  return (
    <div className="h-screen w-full bg-dark-950 text-slate-200 flex flex-col font-sans overflow-hidden select-none">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e)} />
      <input type="file" ref={secondFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, true)} />
      {config.mode === AppMode.CameraRaw && <CameraRawSVG config={config.cameraRaw} />}
      {isFullscreen && generatedImage && <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm"><img src={generatedImage} className="max-w-full max-h-full object-contain p-4" /><button onClick={() => setIsFullscreen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X className="w-8 h-8"/></button></div>}
      <header className="h-12 bg-dark-900 border-b border-dark-700 flex items-center justify-between px-4 shrink-0"><div className="flex items-center gap-2"><Menu className="w-5 h-5 text-slate-400" /><span className="text-sm font-bold text-slate-300 tracking-wide uppercase">Thuan.VQ AI Studio Ultimate</span></div><div className="flex items-center gap-3"><div className="flex items-center gap-1.5 bg-dark-800 px-3 py-1 rounded-full border border-dark-700"><div className={`w-2 h-2 rounded-full ${isActivated ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div><span className="text-[10px] font-bold text-slate-400 uppercase">{isActivated ? 'Pro Activated' : 'Trial Mode'}</span></div></div></header>
      <div className="flex-1 flex p-3 gap-3 overflow-hidden bg-dark-950">
         <aside className="w-64 bg-dark-900 rounded-xl border border-dark-700 flex flex-col py-5 px-3 shrink-0 overflow-y-auto custom-scrollbar shadow-xl">
             <div className="mb-8"><div className="px-3 mb-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest border-b border-dark-800 pb-2">{t.menu_id_photo}</div><div className="flex flex-col gap-2"><SidebarItem disabled={!isActivated} icon={User} label="Ảnh thẻ ID Pro" mode={AppMode.IDPhoto} activeMode={config.mode} onSelect={m => setConfig(prev => ({...prev, mode: m}))} /><SidebarItem disabled={!isActivated} icon={Wand} label="Retouch Pro" mode={AppMode.Retouch} activeMode={config.mode} onSelect={m => setConfig(prev => ({...prev, mode: m}))} /><SidebarItem disabled={!isActivated} icon={RefreshCw} label="Phục hồi ảnh" mode={AppMode.Restoration} activeMode={config.mode} onSelect={m => setConfig(prev => ({...prev, mode: m}))} /><SidebarItem disabled={!isActivated} icon={ScanFace} label="Cân bằng mặt" mode={AppMode.Balance} activeMode={config.mode} onSelect={m => setConfig(prev => ({...prev, mode: m}))} /></div></div>
             <div className="mb-8"><div className="px-3 mb-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest border-b border-dark-800 pb-2">SÁNG TẠO</div><div className="flex flex-col gap-2"><SidebarItem disabled={!isActivated} icon={SlidersHorizontal} label="Camera Raw" mode={AppMode.CameraRaw} activeMode={config.mode} onSelect={m => setConfig(prev => ({...prev, mode: m}))} /><SidebarItem disabled={!isActivated} icon={Sun} label="Ánh sáng" mode={AppMode.Lighting} activeMode={config.mode} onSelect={m => setConfig(prev => ({...prev, mode: m}))} /><SidebarItem disabled={!isActivated} icon={Layers} label="Ghép nền" mode={AppMode.ChangeBackground} activeMode={config.mode} onSelect={m => setConfig(prev => ({...prev, mode: m}))} /><SidebarItem disabled={!isActivated} icon={Wand2} label="Tách nền" mode={AppMode.RemoveBackground} activeMode={config.mode} onSelect={m => setConfig(prev => ({...prev, mode: m}))} /><SidebarItem disabled={!isActivated} icon={Sparkles} label="Trend Art" mode={AppMode.Trend} activeMode={config.mode} onSelect={m => setConfig(prev => ({...prev, mode: m}))} /><SidebarItem disabled={!isActivated} icon={Monitor} label="Mockup" mode={AppMode.Mockup} activeMode={config.mode} onSelect={m => setConfig(prev => ({...prev, mode: m}))} /></div></div>
             <div className="mt-auto pt-3 border-t border-dark-800 flex flex-col gap-2"><SidebarItem icon={Settings2} label="Cài đặt" mode={AppMode.Settings} activeMode={config.mode} onSelect={m => setConfig(prev => ({...prev, mode: m}))} />
                <div className="bg-dark-950/50 rounded-lg p-1 flex items-center border border-dark-800 mt-1"><button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[11px] font-bold transition-all ${theme === 'light' ? 'bg-white text-dark-900 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Sun className="w-3.5 h-3.5" /> Sáng</button><button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[11px] font-bold transition-all ${theme === 'dark' ? 'bg-dark-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Moon className="w-3.5 h-3.5" /> Tối</button></div>
             </div>
         </aside>
         <div className="flex-1 flex gap-4 overflow-hidden relative">
             {config.mode === AppMode.Settings ? (
                <div className="flex-1 bg-dark-950 p-4 md:p-8 overflow-y-auto custom-scrollbar flex justify-center">
                    <SettingsApp machineId={machineId} licenseInput={licenseInput} setLicenseInput={setLicenseInput} licenseStatus={licenseStatus} handleCheckLicense={handleCheckLicense} handleActivateLicense={handleActivateLicense} handleCopySerial={handleCopySerial} copySuccess={copySuccess} userApiKey={userApiKey} setUserApiKey={setUserApiKey} tempApiKey={tempApiKey} setTempApiKey={setTempApiKey} checkStatus={checkStatus} handleCheckKey={handleCheckKey} handleSaveKey={handleSaveKey} theme={theme} setTheme={setTheme} />
                </div>
             ) : (
                <>
                    <div className="w-80 bg-dark-900 rounded-xl border border-dark-700 flex flex-col shrink-0 overflow-hidden shadow-2xl z-10">
                        <div className="p-5 border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm"><h3 className="text-sm font-bold text-white uppercase flex items-center gap-2"><Settings2 className="w-4 h-4 text-primary-500" /> Cấu hình</h3></div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-6">
                            {renderConfigControls()}
                            {/* In ChangeBackground mode, we handle the second file inside the main panel, so hide it here to avoid duplication */}
                            {config.mode !== AppMode.CameraRaw && config.mode !== AppMode.ChangeBackground && <AdvancedProPanel config={config} setConfig={setConfig} secondFile={secondFile} secondPreviewUrl={secondPreviewUrl} onUploadSecond={() => secondFileInputRef.current?.click()} onClearSecond={handleClearSecondFile} />}
                             {/* Re-add Advanced Panel for Change Background but without the duplicate upload box (since it's now in the main panel) */}
                            {config.mode === AppMode.ChangeBackground && <AdvancedProPanel config={config} setConfig={setConfig} secondFile={null} secondPreviewUrl={null} onUploadSecond={() => {}} onClearSecond={() => {}} />}

                            <div className="pt-2 pb-4"><button onClick={config.mode === AppMode.CameraRaw ? handleApplyCameraRaw : handleGenerate} disabled={isProcessing || !selectedFile} className={`w-full py-3.5 rounded-lg font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden group ${isProcessing || !selectedFile ? 'bg-dark-700 text-slate-500 cursor-not-allowed' : config.mode === AppMode.CameraRaw ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-900/40' : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 shadow-primary-900/30 hover:shadow-primary-900/50'}`}><div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>{isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : config.mode === AppMode.CameraRaw ? <Save className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}<span className="relative">{isProcessing ? 'Đang xử lý...' : config.mode === AppMode.CameraRaw ? 'ÁP DỤNG' : 'TẠO ẢNH NGAY'}</span></button></div>
                        </div>
                    </div>
                    <div className="flex-1 bg-dark-900 rounded-xl border border-dark-700 flex flex-col overflow-hidden relative shadow-inner">
                         <div className="h-12 border-b border-dark-700 flex items-center justify-between px-5 bg-dark-800/30 backdrop-blur-sm"><span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Monitor className="w-3 h-3"/> Cửa sổ xem</span>{generatedImage && (<div className="flex gap-2"><button onClick={() => setIsFullscreen(true)} className="p-2 hover:bg-dark-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Toàn màn hình"><Maximize2 className="w-4 h-4"/></button><a href={generatedImage} download={`thuanvq-ai-${Date.now()}.png`} className="p-2 hover:bg-dark-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Tải xuống"><Download className="w-4 h-4"/></a></div>)}</div>
                         <div className="flex-1 p-5 flex gap-5 overflow-hidden">
                             <div className="flex-1 flex flex-col gap-3 min-w-0">
                                 <div className="text-[10px] font-bold text-slate-500 uppercase">Ảnh gốc</div>
                                 <div onClick={() => fileInputRef.current?.click()} className={`flex-1 rounded-xl border-2 border-dashed border-dark-700 bg-dark-950/50 flex flex-col items-center justify-center cursor-pointer hover:bg-dark-800/50 transition-colors relative overflow-hidden group ${!selectedFile ? 'hover:border-primary-500/50' : ''}`}>
                                     {selectedFile ? (<div className="w-full h-full relative"><img src={previewUrl || ''} className="w-full h-full object-contain" style={config.mode === AppMode.CameraRaw ? { filter: 'url(#cameraRawFilter)' } : {}} /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><div className="bg-dark-800 text-white text-xs py-1.5 px-4 rounded-full flex items-center gap-2 shadow-lg font-medium"><Upload className="w-3 h-3"/> Thay ảnh</div></div></div>) : (<div className="text-center p-6"><div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500 group-hover:text-primary-500 group-hover:scale-110 transition-all shadow-lg border border-dark-700"><Upload className="w-7 h-7" /></div><p className="text-sm text-slate-400 font-medium">Nhấp để tải ảnh lên</p><p className="text-[10px] text-slate-600 mt-1">JPG, PNG (Max 10MB)</p></div>)}
                                 </div>
                             </div>
                             <div className="flex-1 flex flex-col gap-3 min-w-0">
                                 <div className="text-[10px] font-bold text-slate-500 uppercase text-primary-500">Kết quả AI</div>
                                 <div className="flex-1 rounded-xl border border-dark-700 bg-dark-950 flex items-center justify-center relative overflow-hidden shadow-inner">{generatedImage ? (<img src={generatedImage} className="w-full h-full object-contain" />) : (<div className="text-center opacity-30"><Sparkles className="w-16 h-16 mx-auto mb-3 text-primary-500" /><p className="text-sm font-medium">Kết quả sẽ hiện ở đây</p></div>)}{error && (<div className="absolute inset-0 bg-dark-950/90 flex items-center justify-center p-6 text-center backdrop-blur-sm"><div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl shadow-2xl max-w-sm"><AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" /><p className="text-sm text-red-400 font-medium leading-relaxed">{error}</p><button onClick={() => setError(null)} className="mt-4 text-xs text-slate-400 hover:text-white underline font-bold">ĐÓNG THÔNG BÁO</button></div></div>)}{isProcessing && (<div className="absolute inset-0 bg-dark-950/80 backdrop-blur-md flex flex-col items-center justify-center z-10"><div className="relative"><div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div><Sparkles className="w-6 h-6 text-yellow-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" /></div><p className="text-sm font-bold text-white animate-pulse mt-5 tracking-wide">AI ĐANG XỬ LÝ...</p><p className="text-xs text-slate-400 mt-2">Vui lòng đợi trong giây lát</p></div>)}</div>
                             </div>
                         </div>
                    </div>
                </>
             )}
         </div>
      </div>
    </div>
  );
};

export default App;