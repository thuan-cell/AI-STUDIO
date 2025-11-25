import React from 'react';
import { GroupBox, PromptInput } from '../../components/ui/Shared';
import { GenerationConfig } from '../../types';
import { Image as ImageIcon, Upload, X, Wand2 } from 'lucide-react';

interface PanelProps {
    config: GenerationConfig;
    setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>;
    secondFile: File | null;
    secondPreviewUrl: string | null;
    onUploadSecond: () => void;
    onClearSecond: () => void;
}

export const AdvancedProPanel: React.FC<PanelProps> = ({ config, setConfig, secondFile, secondPreviewUrl, onUploadSecond, onClearSecond }) => {
    
    return (
        <GroupBox title="TÙY CHỈNH NÂNG CAO (ULTIMATE)" className="border-primary-500/20 bg-gradient-to-b from-primary-900/10 to-transparent mt-6">
            
            {/* MAGIC PROMPT */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase flex items-center gap-2 mb-2">
                    <Wand2 className="w-3.5 h-3.5 text-yellow-500"/> MAGIC PROMPT (Mô tả chi tiết)
                </label>
                <div className="relative">
                    <PromptInput 
                        value={config.customPrompt || ''}
                        onChange={(val) => setConfig((p: any) => ({...p, customPrompt: val}))}
                        placeholder="Nhập mọi yêu cầu của bạn tại đây... (VD: Ánh sáng neon tím, thêm hiệu ứng mưa, làm tóc bồng bềnh hơn, nền màu tối sang trọng...)"
                    />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
            </div>

            {/* REFERENCE IMAGE */}
            <div className="space-y-3 border-t border-white/5 pt-4 mt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                    <ImageIcon className="w-3 h-3 text-purple-400"/> Ảnh tham chiếu (Reference)
                </label>
                <div 
                    onClick={onUploadSecond}
                    className="group border border-dashed border-dark-600 bg-dark-900/50 rounded-lg h-24 flex items-center justify-center cursor-pointer hover:border-primary-500/50 hover:bg-dark-800 transition-all relative overflow-hidden"
                >
                    {secondFile ? (
                        <>
                            <img src={secondPreviewUrl || ''} className="h-full w-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-dark-900/80 px-3 py-1.5 rounded-md text-[10px] text-white shadow-sm border border-white/10 font-bold">Thay đổi ảnh</span>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onClearSecond(); }}
                                className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors z-20"
                                title="Xóa ảnh tham chiếu"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-2 bg-dark-800 rounded-full group-hover:bg-primary-500/20 transition-colors">
                                <Upload className="w-4 h-4 text-slate-500 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <span className="text-[9px] text-slate-500 uppercase font-medium tracking-wide">Tải ảnh mẫu</span>
                        </div>
                    )}
                </div>
            </div>
        </GroupBox>
    )
};