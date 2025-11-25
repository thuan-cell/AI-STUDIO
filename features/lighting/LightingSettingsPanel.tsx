import React from 'react';
import { GroupBox } from '../../components/ui/Shared';
import { GenerationConfig, LightingStyle } from '../../types';

interface PanelProps { config: GenerationConfig; setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>; }

export const LightingSettingsPanel: React.FC<PanelProps> = ({ config, setConfig }) => {
  const styles = [
    { id: LightingStyle.Side, label: "Ánh sáng bên" }, { id: LightingStyle.Hard, label: "Ánh sáng cứng" }, { id: LightingStyle.Rembrandt, label: "Ánh sáng 45°" },
    { id: LightingStyle.Back, label: "Ánh sáng ngược" }, { id: LightingStyle.Background, label: "Ánh sáng nền" }, { id: LightingStyle.Hair, label: "Ánh sáng tóc" },
    { id: LightingStyle.Split, label: "Ánh sáng tách đôi" }, { id: LightingStyle.BacklitFull, label: "Ngược sáng toàn phần" }, { id: LightingStyle.Ambient, label: "Ánh sáng môi trường" }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase pl-1">9 Kiểu ánh sáng Studio</h3>
      <div className="grid grid-cols-3 gap-2">
        {styles.map(s => (
          <button key={s.id} onClick={() => setConfig(p => ({...p, lightingStyle: s.id}))} className={`p-1 rounded-lg border text-[10px] font-medium transition-all h-14 flex items-center justify-center text-center leading-tight ${config.lightingStyle === s.id ? 'bg-primary-600 border-primary-500 text-white shadow-md' : 'bg-dark-800/50 border-dark-700 text-slate-400 hover:border-slate-500 hover:bg-dark-800'}`}>{s.label}</button>
        ))}
      </div>
    </div>
  );
};