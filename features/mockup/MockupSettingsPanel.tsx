import React from 'react';
import { GroupBox } from '../../components/ui/Shared';
import { GenerationConfig, MockupStyle } from '../../types';
import { Upload, Box, LayoutTemplate, Briefcase, Camera, Sunset, Building2, Crown } from 'lucide-react';

interface PanelProps { config: GenerationConfig; setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>; selectedFile: File | null; previewUrl: string | null; onUploadMain: () => void; }

export const MockupSettingsPanel: React.FC<PanelProps> = ({ config, setConfig, selectedFile, previewUrl, onUploadMain }) => {
    
    const styles = [
        { id: MockupStyle.StudioMinimal, label: "Studio Minimal", icon: LayoutTemplate },
        { id: MockupStyle.Podium3D, label: "3D Podium", icon: Box },
        { id: MockupStyle.LifestyleHand, label: "Cầm tay (Hand)", icon: Camera },
        { id: MockupStyle.NatureOutdoor, label: "Thiên nhiên", icon: Sunset },
        { id: MockupStyle.LuxuryDark, label: "Luxury (Sang trọng)", icon: Crown },
        { id: MockupStyle.OfficeDesk, label: "Văn phòng", icon: Briefcase },
    ];

    return (
        <div className="space-y-4">
            <GroupBox title="SẢN PHẨM (INPUT)">
                <div onClick={onUploadMain} className={`group relative h-32 w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${selectedFile ? 'border-primary-500 bg-dark-900' : 'border-dark-600 hover:border-slate-500 hover:bg-dark-800'}`}>
                    {selectedFile ? (
                        <>
                            <img src={previewUrl || ''} className="h-full w-full object-contain p-2" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-primary-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1"><Upload className="w-3 h-3"/> Thay ảnh</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-dark-600 transition-colors"><Upload className="w-5 h-5 text-slate-400" /></div>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Tải ảnh sản phẩm</span>
                        </div>
                    )}
                </div>
            </GroupBox>
            
            <GroupBox title="PHONG CÁCH MOCKUP (STYLE)">
                <div className="grid grid-cols-2 gap-2">
                    {styles.map((s) => {
                        const Icon = s.icon;
                        const isSelected = config.mockup.style === s.id;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setConfig(p => ({...p, mockup: { style: s.id }}))}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all relative overflow-hidden group ${isSelected ? 'bg-gradient-to-br from-primary-600/90 to-primary-700/90 border-primary-500 text-white shadow-lg' : 'bg-dark-800 border-dark-700 text-slate-400 hover:bg-dark-700 hover:border-slate-600'}`}
                            >
                                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-500 group-hover:text-primary-400'}`} />
                                <span className="text-[10px] font-bold">{s.label}</span>
                                {isSelected && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                            </button>
                        );
                    })}
                </div>
            </GroupBox>
        </div>
    );
};