

import React from 'react';
import { GroupBox, SimpleSlider } from '../../components/ui/Shared';
import { GenerationConfig } from '../../types';

interface PanelProps { config: GenerationConfig; setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>; }

export const RetouchSettingsPanel: React.FC<PanelProps> = ({ config, setConfig }) => (
    <>
        <GroupBox title="TRẺ HÓA & MÀU DA">
             <SimpleSlider label="Giảm tuổi (Trẻ hóa)" value={config.retouch.ageReduction} onChange={(v) => setConfig(prev => ({...prev, retouch: {...prev.retouch, ageReduction: v}}))} />
             <div className="mt-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Tông màu da (Skin Tone)</label>
                <div className="grid grid-cols-5 gap-1">
                    {['neutral', 'warm', 'cool', 'rosy', 'tan'].map((tone) => (
                        <button 
                            key={tone} 
                            onClick={() => setConfig((p: any) => ({...p, retouch: {...p.retouch, skinTone: tone}}))}
                            className={`h-8 rounded border transition-all text-[9px] uppercase font-bold ${config.retouch.skinTone === tone ? 'border-primary-500 bg-primary-600 text-white' : 'border-dark-600 bg-dark-800 text-slate-500'}`}
                        >
                            {tone}
                        </button>
                    ))}
                </div>
             </div>
        </GroupBox>
        <GroupBox title="LÀM ĐẸP CHUYÊN SÂU">
            <SimpleSlider label="Xóa mụn/thâm" value={config.retouch.blemishRemoval} onChange={(v) => setConfig(prev => ({...prev, retouch: {...prev.retouch, blemishRemoval: v}}))} />
            <SimpleSlider label="Mịn da (Giữ lỗ chân lông)" value={config.retouch.skinSmoothing} onChange={(v) => setConfig(prev => ({...prev, retouch: {...prev.retouch, skinSmoothing: v}}))} />
            <SimpleSlider label="Dodge & Burn (Khối)" value={config.retouch.dodgeAndBurn} onChange={(v) => setConfig(prev => ({...prev, retouch: {...prev.retouch, dodgeAndBurn: v}}))} />
        </GroupBox>
        <GroupBox title="MAKEUP & MẮT">
            <SimpleSlider label="Sáng mắt (Eye Sparkle)" value={config.retouch.brightenEyes} onChange={(v) => setConfig(prev => ({...prev, retouch: {...prev.retouch, brightenEyes: v}}))} />
            <SimpleSlider label="Trang điểm kỹ thuật số" value={config.retouch.makeup} onChange={(v) => setConfig(prev => ({...prev, retouch: {...prev.retouch, makeup: v}}))} />
        </GroupBox>
    </>
);