import React from 'react';
import { GroupBox, Toggle } from '../../components/ui/Shared';
import { GenerationConfig } from '../../types';

interface PanelProps { config: GenerationConfig; setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>; }

export const RestorationSettingsPanel: React.FC<PanelProps> = ({ config, setConfig }) => (
    <>
    <GroupBox title="CÔNG CỤ PHỤC HỒI">
        <Toggle label="Tô màu ảnh đen trắng" checked={config.restoreColorize} onChange={(v) => setConfig(p => ({...p, restoreColorize: v}))} />
        <Toggle label="Xóa vết xước & Bụi" checked={config.restoreScratches} onChange={(v) => setConfig(p => ({...p, restoreScratches: v}))} />
        <Toggle label="Unblur (Làm nét)" checked={config.restoreSharpen} onChange={(v) => setConfig(p => ({...p, restoreSharpen: v}))} />
    </GroupBox>
    <GroupBox title="AI TÁI TẠO (HALLUCINATION)">
        <div className="grid grid-cols-3 gap-2">
            {['low', 'medium', 'high'].map((level) => (
                <button 
                    key={level}
                    onClick={() => setConfig((p: any) => ({...p, restoreDetailLevel: level}))}
                    className={`py-2 rounded border text-[10px] uppercase font-bold ${config.restoreDetailLevel === level ? 'bg-primary-600 border-primary-500 text-white' : 'bg-dark-800 border-dark-600 text-slate-400'}`}
                >
                    {level === 'low' ? 'Thấp (An toàn)' : level === 'medium' ? 'Vừa' : 'Cao (Sáng tạo)'}
                </button>
            ))}
        </div>
    </GroupBox>
    </>
);