import React from 'react';

export const GroupBox = ({ title, children, className = '' }: { title: string, children?: React.ReactNode, className?: string }) => (
  <div className={`p-4 rounded-xl bg-dark-900 border border-dark-700 space-y-3 ${className}`}>
    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
      {title}
    </h3>
    <div className="space-y-3">
        {children}
    </div>
  </div>
);

export const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) => (
  <label className="flex items-center justify-between cursor-pointer group p-2 hover:bg-dark-800 rounded-lg transition-colors">
    <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className={`w-9 h-5 rounded-full transition-all ${checked ? 'bg-primary-600 shadow-lg shadow-primary-900/50' : 'bg-dark-700'}`}></div>
      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  </label>
);

export const SimpleSlider = ({ label, value, onChange, min = 0, max = 100 }: { label: string, value: number, onChange: (val: number) => void, min?: number, max?: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <span className="text-[10px] font-mono text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded">{value}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))} 
      className="w-full h-1.5 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
    />
  </div>
);

export const BalanceSlider = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
  <div className="space-y-2">
      <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-slate-300">{label}</span>
          <span className="text-[10px] font-mono text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded">{value}%</span>
      </div>
      <div className="relative h-1.5 bg-dark-700 rounded-lg">
          <div className="absolute top-0 bottom-0 bg-primary-500 rounded-lg opacity-30" style={{ left: '50%', width: `${Math.abs(value)/2}%`, transform: value < 0 ? 'translateX(-100%)' : 'none' }}></div>
          <input 
            type="range" 
            min="-100" 
            max="100" 
            value={value} 
            onChange={(e) => onChange(Number(e.target.value))} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg pointer-events-none transition-all" style={{ left: `${(value + 100) / 2}%`, marginLeft: '-6px' }}></div>
      </div>
  </div>
);

export const PromptInput = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) => (
  <textarea 
    value={value} 
    onChange={(e) => onChange(e.target.value)} 
    placeholder={placeholder}
    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 outline-none transition-all min-h-[80px] resize-none"
  />
);