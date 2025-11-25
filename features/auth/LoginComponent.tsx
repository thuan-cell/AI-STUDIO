import React, { useState, useEffect } from 'react';
import { Lock, Key, Copy, CheckCircle, AlertCircle, Unlock, ShieldCheck } from 'lucide-react';
import { getMachineId, validateLicense, saveLicenseKey } from '../../services/licenseService';

export const ActivationOverlay: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [serial, setSerial] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => { setSerial(getMachineId()); }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(serial);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleActivate = () => {
    setError(null);
    const status = validateLicense(inputKey.trim());
    if (status.isValid) {
      saveLicenseKey(inputKey.trim());
      onSuccess();
    } else {
      setError(status.message || "Khóa không hợp lệ");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-dark-950 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none"></div>
      <div className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-4 border border-dark-700 shadow-inner"><Lock className="w-8 h-8 text-primary-500" /></div>
          <h1 className="text-2xl font-bold text-white mb-2">Kích hoạt bản quyền</h1>
          <p className="text-slate-400 text-center text-sm">Vui lòng gửi Mã Seri bên dưới cho quản trị viên để nhận Khóa kích hoạt.</p>
        </div>
        <div className="mb-6">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Mã Seri Máy (Machine ID)</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-slate-200 font-mono text-center tracking-widest select-all">{serial}</div>
            <button onClick={handleCopy} className="px-3 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg text-slate-300 transition-colors" title="Sao chép">{copySuccess ? <CheckCircle className="w-5 h-5 text-green-500"/> : <Copy className="w-5 h-5"/>}</button>
          </div>
        </div>
        <div className="mb-8">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Khóa kích hoạt (Activation Key)</label>
          <div className="relative">
            <Key className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <textarea value={inputKey} onChange={(e) => setInputKey(e.target.value)} placeholder="Dán khóa kích hoạt vào đây..." className="w-full bg-dark-800 border border-dark-700 focus:border-primary-500 rounded-lg pl-10 pr-4 py-3 text-white text-sm outline-none transition-all resize-none h-24 font-mono"/>
          </div>
          {error && <div className="mt-3 flex items-center gap-2 text-red-500 text-xs font-medium animate-pulse"><AlertCircle className="w-4 h-4" />{error}</div>}
        </div>
        <button onClick={handleActivate} className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-lg font-bold text-sm shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2 group"><Unlock className="w-4 h-4 group-hover:scale-110 transition-transform"/>KÍCH HOẠT NGAY</button>
        <div className="mt-6 flex items-center justify-center gap-2 text-dark-700"><ShieldCheck className="w-4 h-4" /><span className="text-[10px] font-medium uppercase tracking-widest">Thuan.VQ Secure System</span></div>
      </div>
    </div>
  );
};