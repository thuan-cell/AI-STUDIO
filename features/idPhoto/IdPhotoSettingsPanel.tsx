

import React from 'react';
import { GroupBox, Toggle } from '../../components/ui/Shared';
import { BackgroundColor, GenerationConfig, Outfit, PhotoSize } from '../../types';
import { Palette, UserCheck, Plane } from 'lucide-react';

interface PanelProps { config: GenerationConfig; setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>; }

export const IdPhotoSettingsPanel: React.FC<PanelProps> = ({ config, setConfig }) => (
    <>
        <GroupBox title="KÍCH THƯỚC CHUẨN">
            <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setConfig(prev => ({ ...prev, size: PhotoSize.Size3x4 }))} className={`py-2 px-1 text-[10px] rounded border transition-all ${config.size === PhotoSize.Size3x4 ? 'bg-primary-600 border-primary-500 text-white' : 'bg-dark-800 border-dark-700 text-slate-400'}`}>3x4 cm</button>
                <button onClick={() => setConfig(prev => ({ ...prev, size: PhotoSize.Size4x6 }))} className={`py-2 px-1 text-[10px] rounded border transition-all ${config.size === PhotoSize.Size4x6 ? 'bg-primary-600 border-primary-500 text-white' : 'bg-dark-800 border-dark-700 text-slate-400'}`}>4x6 cm</button>
                <button onClick={() => setConfig(prev => ({ ...prev, size: PhotoSize.Passport }))} className={`py-2 px-1 text-[10px] rounded border transition-all flex flex-col items-center justify-center gap-1 ${config.size === PhotoSize.Passport ? 'bg-primary-600 border-primary-500 text-white' : 'bg-dark-800 border-dark-700 text-slate-400'}`}><UserCheck className="w-3 h-3"/>Passport</button>
            </div>
            <div className="mt-2">
                <button onClick={() => setConfig(prev => ({ ...prev, size: PhotoSize.Visa }))} className={`w-full py-2 px-2 text-[10px] rounded border transition-all flex items-center justify-center gap-2 ${config.size === PhotoSize.Visa ? 'bg-primary-600 border-primary-500 text-white' : 'bg-dark-800 border-dark-700 text-slate-400'}`}><Plane className="w-3 h-3"/>Visa Quốc Tế (Nền trắng chuẩn)</button>
            </div>
        </GroupBox>
        <GroupBox title="MÀU NỀN & PHÔNG">
             <div className="grid grid-cols-5 gap-2">
                <button onClick={() => setConfig(p => ({ ...p, bgColor: BackgroundColor.White }))} title="Trắng" className={`h-8 rounded border-2 ${config.bgColor === BackgroundColor.White ? 'border-primary-500' : 'border-slate-600'} bg-white`}></button>
                <button onClick={() => setConfig(p => ({ ...p, bgColor: BackgroundColor.Blue }))} title="Xanh dương" className={`h-8 rounded border-2 ${config.bgColor === BackgroundColor.Blue ? 'border-primary-500' : 'border-slate-600'} bg-[#2b75f6]`}></button>
                <button onClick={() => setConfig(p => ({ ...p, bgColor: BackgroundColor.Cyan }))} title="Cyan Gradient" className={`h-8 rounded border-2 ${config.bgColor === BackgroundColor.Cyan ? 'border-primary-500' : 'border-slate-600'} bg-gradient-to-b from-cyan-300 to-white`}></button>
                <button onClick={() => setConfig(p => ({ ...p, bgColor: BackgroundColor.Luxury }))} title="Xám Studio" className={`h-8 rounded border-2 ${config.bgColor === BackgroundColor.Luxury ? 'border-primary-500' : 'border-slate-600'} bg-gray-700`}></button>
                <button onClick={() => setConfig(p => ({ ...p, bgColor: BackgroundColor.Custom }))} title="Tùy chọn" className={`h-8 rounded border-2 flex items-center justify-center ${config.bgColor === BackgroundColor.Custom ? 'border-primary-500 text-primary-500' : 'border-slate-600 text-slate-400'}`}><Palette className="w-4 h-4" /></button>
             </div>
        </GroupBox>
        <GroupBox title="TRANG PHỤC CAO CẤP">
            <select value={config.outfit} onChange={(e) => setConfig(prev => ({ ...prev, outfit: e.target.value as Outfit }))} className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-primary-500 transition-all">
                <option value={Outfit.Original}>Giữ nguyên trang phục</option>
                <optgroup label="Văn phòng & Công sở">
                    <option value={Outfit.WhiteShirt}>Áo sơ mi trắng (Văn phòng)</option>
                    <option value={Outfit.BlackSuit}>Vest đen + Cà vạt (Doanh nhân)</option>
                    <option value={Outfit.BlueSuit}>Vest xanh Navy (Sang trọng)</option>
                    <option value={Outfit.Turtleneck}>Áo cổ lọ đen (Steve Jobs)</option>
                </optgroup>
                <optgroup label="Truyền thống">
                     <option value={Outfit.AoDaiWhite}>Áo dài trắng</option>
                </optgroup>
            </select>
        </GroupBox>
        <GroupBox title="XỬ LÝ MẶT">
            <Toggle label="Giữ đặc điểm gốc (Nốt ruồi...)" checked={config.keepFeatures} onChange={(v) => setConfig(p => ({...p, keepFeatures: v}))} />
            <Toggle label="Cười nhẹ (Tự nhiên)" checked={config.slightSmile} onChange={(v) => setConfig(p => ({...p, slightSmile: v}))} />
            <Toggle label="Làm mịn da (Beauty)" checked={config.smoothSkin} onChange={(v) => setConfig(p => ({...p, smoothSkin: v}))} />
        </GroupBox>
    </>
);