import React from 'react';
import { GroupBox } from '../../components/ui/Shared';
import { GenerationConfig, TrendStyle } from '../../types';

interface PanelProps { config: GenerationConfig; setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>; }

export const TrendCreatorSettingsPanel: React.FC<PanelProps> = ({ config, setConfig }) => {
  const handleTrendSelect = (style: TrendStyle) => setConfig(p => ({ ...p, trendStyle: style }));
  
  const trends = [
      { id: TrendStyle.Begging, label: "Ăn Xin (Beggar)" },
      { id: TrendStyle.Model, label: "Model Vogue" },
      { id: TrendStyle.Clay, label: "Đất Sét (Clay)" },
      { id: TrendStyle.Cyberpunk, label: "Cyberpunk 2077" },
      { id: TrendStyle.Disney3D, label: "Disney Pixar 3D" },
      { id: TrendStyle.Anime, label: "Anime Nhật Bản" },
      { id: TrendStyle.OilPainting, label: "Tranh Sơn Dầu" },
      { id: TrendStyle.Sketch, label: "Tranh Phác Thảo" },
  ];

  return (
    <div className="space-y-4">
      <GroupBox title="THƯ VIỆN STYLE">
          <div className="grid grid-cols-2 gap-2">
              {trends.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => handleTrendSelect(t.id)} 
                    className={`p-2 rounded border text-[10px] font-bold transition-all h-10 flex items-center justify-center text-center ${config.trendStyle === t.id ? 'bg-gradient-to-r from-primary-600 to-purple-600 border-transparent text-white shadow-lg' : 'bg-dark-800 border-dark-700 text-slate-400 hover:border-slate-500 hover:bg-dark-700'}`}
                  >
                      {t.label}
                  </button>
              ))}
          </div>
      </GroupBox>
      
      <GroupBox title="SỐ LƯỢNG BIẾN THỂ">
          <div className="flex gap-4">
             {[1, 2, 3, 4].map(num => (
               <label key={num} className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={config.trendImageCount === num} onChange={() => setConfig(p => ({...p, trendImageCount: num}))} className="accent-primary-500" /><span className="text-xs text-slate-300">{num} ảnh</span></label>
             ))}
          </div>
      </GroupBox>
    </div>
  );
};