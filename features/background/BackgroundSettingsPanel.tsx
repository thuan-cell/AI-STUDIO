import React from 'react';
import { GroupBox, SimpleSlider } from '../../components/ui/Shared';
import { BgPoseMode, GenerationConfig, Outfit } from '../../types';
import { Check, Upload, Image as ImageIcon, X, Shirt, User } from 'lucide-react';

interface PanelProps { 
    config: GenerationConfig; 
    setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>; 
    secondFile?: File | null;
    secondPreviewUrl?: string | null;
    onUploadSecond?: () => void;
    onClearSecond?: () => void;
}

export const BackgroundSettingsPanel: React.FC<PanelProps> = ({ config, setConfig, secondFile, secondPreviewUrl, onUploadSecond, onClearSecond }) => (
  <div className="space-y-4">
    <GroupBox title="1. ẢNH NỀN (BẮT BUỘC)">
         <div 
            onClick={onUploadSecond}
            className={`group border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${secondFile ? 'border-primary-500 bg-dark-900' : 'border-dark-600 bg-dark-900/50 hover:border-slate-500 hover:bg-dark-800'}`}
        >
            {secondFile ? (
                <>
                    <img src={secondPreviewUrl || ''} className="h-full w-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-primary-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1"><Upload className="w-3 h-3"/> Đổi nền khác</span>
                    </div>
                    {onClearSecond && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onClearSecond(); }}
                            className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors z-20"
                            title="Xóa ảnh nền"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </>
            ) : (
                <div className="text-center p-4">
                    <div className="w-10 h-10 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-500/20 transition-colors border border-dark-700">
                        <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-primary-400" />
                    </div>
                    <span className="text-xs text-slate-300 font-bold uppercase tracking-wide block">Tải ảnh nền lên</span>
                    <span className="text-[9px] text-slate-500 mt-1 block">AI sẽ dùng ảnh này làm phông nền</span>
                </div>
            )}
        </div>
    </GroupBox>

    <GroupBox title="2. TÙY CHỈNH CHỦ THỂ & TRANG PHỤC">
        <div className="space-y-3">
            {/* Pose Selection */}
            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-2"><User className="w-3 h-3"/> Tư thế & Dáng đứng</label>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => setConfig((p: any) => ({...p, bgPoseMode: BgPoseMode.KeepOriginal}))}
                        className={`py-2 px-2 rounded-lg border text-[10px] font-bold transition-all ${config.bgPoseMode === BgPoseMode.KeepOriginal ? 'bg-primary-600 border-primary-500 text-white' : 'bg-dark-800 border-dark-700 text-slate-400 hover:bg-dark-700'}`}
                    >
                        Giữ nguyên dáng gốc
                    </button>
                    <button 
                        onClick={() => setConfig((p: any) => ({...p, bgPoseMode: BgPoseMode.ChangePose}))}
                        className={`py-2 px-2 rounded-lg border text-[10px] font-bold transition-all ${config.bgPoseMode === BgPoseMode.ChangePose ? 'bg-primary-600 border-primary-500 text-white' : 'bg-dark-800 border-dark-700 text-slate-400 hover:bg-dark-700'}`}
                    >
                        Đổi dáng phù hợp nền
                    </button>
                </div>
            </div>

            {/* Outfit Selection */}
            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-2"><Shirt className="w-3 h-3"/> Thay trang phục</label>
                <select 
                    value={config.outfit} 
                    onChange={(e) => setConfig(prev => ({ ...prev, outfit: e.target.value as Outfit }))} 
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-primary-500 transition-all custom-select"
                >
                    <option value={Outfit.Original}>✨ Giữ nguyên trang phục cũ</option>
                    
                    <optgroup label="CÔNG SỞ & DOANH NHÂN (OFFICE)">
                        <option value={Outfit.WhiteShirt}>Áo sơ mi trắng (White Shirt)</option>
                        <option value={Outfit.BlackSuit}>Vest đen + Cà vạt (Black Suit)</option>
                        <option value={Outfit.BlueSuit}>Vest xanh Navy (Luxury)</option>
                        <option value={Outfit.Turtleneck}>Áo cổ lọ đen (CEO Style)</option>
                    </optgroup>

                    <optgroup label="DẠ HỘI & CƯỚI (WEDDING/PARTY)">
                        <option value={Outfit.WeddingDress}>Váy cưới (Wedding Dress)</option>
                        <option value={Outfit.GroomSuit}>Vest chú rể (Tuxedo)</option>
                        <option value={Outfit.EveningGown}>Váy dạ hội lấp lánh</option>
                        <option value={Outfit.CocktailDress}>Váy dự tiệc (Cocktail)</option>
                    </optgroup>

                    <optgroup label="STREET STYLE & TRENDY">
                        <option value={Outfit.StreetwearHype}>Streetwear Hypebeast (Oversize)</option>
                        <option value={Outfit.KoreanCasual}>Phong cách Hàn Quốc (Soft Boy/Girl)</option>
                        <option value={Outfit.VintageRetro}>Retro Vintage 90s</option>
                        <option value={Outfit.LeatherJacket}>Áo khoác da (Biker)</option>
                        <option value={Outfit.SummerVibe}>Mùa hè (Summer Vibe)</option>
                    </optgroup>
                    
                    <optgroup label="TRUYỀN THỐNG (VIETNAM)">
                        <option value={Outfit.AoDaiWhite}>Áo dài trắng (Học sinh)</option>
                        <option value={Outfit.AoDaiRed}>Áo dài đỏ (Tết/Lễ)</option>
                        <option value={Outfit.AoDaiModern}>Áo dài cách tân</option>
                    </optgroup>
                    
                    <optgroup label="SÁNG TẠO & HÓA TRANG">
                         <option value={Outfit.CyberpunkFashion}>Cyberpunk Techwear</option>
                         <option value={Outfit.HanfuChinese}>Cổ trang (Hán phục)</option>
                    </optgroup>
                </select>
            </div>
        </div>
    </GroupBox>

    <GroupBox title="3. KỸ THUẬT SỐ (LIGHT & SHADOW)">
        <SimpleSlider label="Đổ bóng (Shadow Intensity)" value={80} onChange={() => {}} min={0} max={100} />
        <SimpleSlider label="Khớp ánh sáng (Light Match)" value={100} onChange={() => {}} min={0} max={100} />
    </GroupBox>
  </div>
);

export const RemoveBgPanel: React.FC<PanelProps> = ({ config, setConfig }) => (
  <div className="space-y-4">
    <GroupBox title="CÔNG CỤ CHUYÊN NGHIỆP">
      <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-dark-800 rounded-lg transition-colors">
         <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${config.removeBg.removeDetails ? 'bg-primary-600' : 'bg-dark-700'}`}>{config.removeBg.removeDetails && <Check className="w-3.5 h-3.5 text-white" />}</div>
         <input type="checkbox" className="hidden" checked={config.removeBg.removeDetails} onChange={(e) => setConfig(p => ({...p, removeBg: {...p.removeBg, removeDetails: e.target.checked}}))} />
         <span className="text-sm font-medium text-slate-200">Tẩy các chi tiết thừa</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-dark-800 rounded-lg transition-colors">
         <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${config.removeBg.evenBackground ? 'bg-primary-600' : 'bg-dark-700'}`}>{config.removeBg.evenBackground && <Check className="w-3.5 h-3.5 text-white" />}</div>
         <input type="checkbox" className="hidden" checked={config.removeBg.evenBackground} onChange={(e) => setConfig(p => ({...p, removeBg: {...p.removeBg, evenBackground: e.target.checked}}))} />
         <span className="text-sm font-medium text-slate-200">Làm đều màu phông (Solid Color)</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-dark-800 rounded-lg transition-colors">
         <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${config.removeBg.reduceNoise ? 'bg-primary-600' : 'bg-dark-700'}`}>{config.removeBg.reduceNoise && <Check className="w-3.5 h-3.5 text-white" />}</div>
         <input type="checkbox" className="hidden" checked={config.removeBg.reduceNoise} onChange={(e) => setConfig(p => ({...p, removeBg: {...p.removeBg, reduceNoise: e.target.checked}}))} />
         <span className="text-sm font-medium text-slate-200">Giảm Noise/Nhiễu hạt</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-dark-800 rounded-lg transition-colors">
         <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${config.removeBg.sharpen ? 'bg-primary-600' : 'bg-dark-700'}`}>{config.removeBg.sharpen && <Check className="w-3.5 h-3.5 text-white" />}</div>
         <input type="checkbox" className="hidden" checked={config.removeBg.sharpen} onChange={(e) => setConfig(p => ({...p, removeBg: {...p.removeBg, sharpen: e.target.checked}}))} />
         <span className="text-sm font-medium text-slate-200">Tăng độ nét chủ thể</span>
      </label>
    </GroupBox>
  </div>
);