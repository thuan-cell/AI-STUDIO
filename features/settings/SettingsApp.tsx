

import React, { useState, useEffect } from 'react';
import { Settings2, ShieldCheck, Sparkles, Monitor, CheckCircle, Copy, Key, AlertCircle, Unlock, Loader2, RefreshCw, Activity, Wifi, Server, ExternalLink, Save, UserCircle2, ServerCog } from 'lucide-react';
import { LicenseStatus } from '../../types';
import { diagnoseConnection, DiagnosticResult } from '../../services/geminiService';

interface SettingsAppProps {
  machineId: string;
  licenseInput: string;
  setLicenseInput: (val: string) => void;
  licenseStatus: LicenseStatus | null;
  handleCheckLicense: () => void;
  handleActivateLicense: () => void;
  handleCopySerial: () => void;
  copySuccess: boolean;
  userApiKey: string;
  setUserApiKey: (val: string) => void; 
  tempApiKey: string;
  setTempApiKey: (val: string) => void;
  checkStatus: 'idle' | 'checking' | 'valid' | 'invalid';
  handleCheckKey: () => void;
  handleSaveKey: () => void;
  theme: 'dark' | 'light';
  setTheme: (val: 'dark' | 'light') => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
    machineId, licenseInput, setLicenseInput, licenseStatus, handleCheckLicense, handleActivateLicense,
    handleCopySerial, copySuccess, userApiKey, setUserApiKey, tempApiKey, setTempApiKey,
    handleCheckKey, handleSaveKey, theme, setTheme
}) => {
    
    const [diagnostics, setDiagnostics] = useState<DiagnosticResult[] | null>(null);
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [hasSystemKey, setHasSystemKey] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

    useEffect(() => {
        // Detect System Key from Vite Env or Process Env (Render)
        // Note: process.env.API_KEY is defined via vite.config.ts define replacement
        const envKey = ((import.meta as any).env && (import.meta as any).env.VITE_API_KEY) || (process.env.API_KEY);
        setHasSystemKey(!!envKey && envKey.length > 5); // Length check to ensure it's a valid looking key
    }, []);

    const handleRunDiagnosis = async () => {
        // Test user key if entered, otherwise test system key
        const keyToTest = tempApiKey.trim() || userApiKey || ((hasSystemKey) ? undefined : '');
        
        setIsDiagnosing(true);
        setDiagnostics(null);
        try {
            // Passing undefined to diagnoseConnection triggers it to look for the system key internally
            const results = await diagnoseConnection(keyToTest);
            setDiagnostics(results);
        } catch (e) {
            console.error(e);
        } finally {
            setIsDiagnosing(false);
        }
    };

    const onSaveKey = () => {
        handleSaveKey();
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    const handleGetFreeKey = () => {
        window.open('https://aistudio.google.com/app/apikey', '_blank');
    };

    const handleFactoryReset = () => {
        const confirmReset = window.confirm(
            "CẢNH BÁO: Hành động này sẽ xóa toàn bộ dữ liệu bao gồm:\n- API Key cá nhân\n- Khóa kích hoạt (License)\n- Cấu hình cục bộ\n\n(Key Hệ Thống từ Render sẽ KHÔNG bị xóa)\n\nBạn có chắc chắn không?"
        );
        if (confirmReset) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="w-full max-w-2xl bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden h-fit">
            <div className="p-6 border-b border-dark-700 bg-dark-800/30">
                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><Settings2 className="w-5 h-5 text-primary-500"/> Cài đặt & Cấu hình</h2>
                <p className="text-sm text-slate-400">Quản lý bản quyền, kết nối tài khoản Google và tùy chỉnh ứng dụng.</p>
            </div>
            <div className="p-6 space-y-8">
                
                {/* GOOGLE ACCOUNT CONNECTION SECTION */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500"/> Kết nối Google AI (Gemini)
                        </h3>
                        {hasSystemKey && !userApiKey && (
                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1 font-bold shadow-[0_0_10px_rgba(34,197,94,0.2)] animate-pulse">
                                <ServerCog className="w-3 h-3"/> SYSTEM KEY (RENDER)
                            </span>
                        )}
                    </div>

                    {/* INPUT AREA */}
                    <div className="bg-dark-950 rounded-lg border border-dark-700 p-4 space-y-4">
                            <div className="relative">
                                <input 
                                    type="password" 
                                    value={tempApiKey} 
                                    onChange={(e) => setTempApiKey(e.target.value)} 
                                    placeholder={hasSystemKey && !userApiKey ? "✅ Đang dùng Key Hệ Thống (Không cần nhập)" : "Dán API Key cá nhân (AIza...) vào đây..."} 
                                    className={`w-full bg-dark-900 border rounded px-4 py-3 text-sm text-white outline-none tracking-widest font-mono transition-colors ${hasSystemKey && !tempApiKey && !userApiKey ? 'border-green-500/50 focus:border-green-500 placeholder-green-500/50 text-green-500 font-bold' : 'border-dark-700 focus:border-primary-500'}`}
                                />
                                <div className={`absolute right-3 top-3 w-2.5 h-2.5 rounded-full ${userApiKey || hasSystemKey ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`}></div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] text-slate-500 italic">
                                    {userApiKey 
                                        ? <span className="text-blue-400 font-bold flex items-center gap-1"><UserCircle2 className="w-3 h-3"/> Đang dùng Key Cá nhân.</span> 
                                        : (hasSystemKey 
                                            ? <span className="text-green-500 font-bold flex items-center gap-1"><ServerCog className="w-3 h-3"/> Đang dùng Key Hệ Thống.</span>
                                            : "Chưa có Key nào.")
                                    }
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleRunDiagnosis} disabled={isDiagnosing} className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white text-xs font-bold rounded border border-dark-600 transition-colors flex items-center gap-2">{isDiagnosing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Activity className="w-3 h-3" />} Kiểm tra kết nối</button>
                                    <button onClick={onSaveKey} className={`px-4 py-2 text-white text-xs font-bold rounded shadow-lg transition-all flex items-center gap-2 ${saveStatus === 'saved' ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                                        {saveStatus === 'saved' ? <CheckCircle className="w-3 h-3"/> : <Save className="w-3 h-3"/>}
                                        {saveStatus === 'saved' ? 'Đã Lưu!' : 'Lưu Key'}
                                    </button>
                                </div>
                            </div>
                            
                            {/* DIAGNOSTIC RESULTS */}
                            {diagnostics && (
                                <div className="mt-4 p-3 bg-dark-900 rounded border border-dark-700 space-y-2 animate-fade-in">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Trạng thái kết nối:</h4>
                                    {diagnostics.map((res, idx) => (
                                        <div key={idx} className="flex items-start gap-3 text-xs">
                                            <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${res.status === 'ok' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                {res.step === 'network' && <Wifi className="w-2.5 h-2.5"/>}
                                                {res.step === 'auth' && <Key className="w-2.5 h-2.5"/>}
                                                {res.step === 'image_model' && <Server className="w-2.5 h-2.5"/>}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium ${res.status === 'ok' ? 'text-slate-300' : 'text-red-400'}`}>{res.message}</p>
                                                {res.details && <p className="text-[10px] text-slate-500 mt-0.5 break-all opacity-70">{res.details}</p>}
                                                {res.actionUrl && (
                                                    <a href={res.actionUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-[10px] font-bold transition-colors shadow-sm">
                                                        <ExternalLink className="w-3 h-3"/> KHẮC PHỤC NGAY
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                    
                    {/* Simplified Get Key Link */}
                    {(!hasSystemKey || userApiKey) && (
                        <div className="mt-3 flex justify-end">
                            <button onClick={handleGetFreeKey} className="text-[10px] text-blue-400 hover:text-blue-300 underline flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> Chưa có Key? Lấy miễn phí tại đây
                            </button>
                        </div>
                    )}
                </section>

                <div className="h-px bg-dark-800"></div>

                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-500"/> Bản quyền phần mềm (License)</h3>
                    <div className="bg-dark-950 rounded-lg border border-dark-700 p-4 space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Mã Seri Máy (Machine ID)</label>
                            <div className="flex gap-2">
                                    <code className="flex-1 bg-dark-900 border border-dark-700 rounded px-3 py-2 text-xs font-mono text-slate-300">{machineId}</code>
                                    <button onClick={handleCopySerial} className="px-3 bg-dark-800 border border-dark-700 rounded hover:bg-dark-700 text-slate-400 transition-colors">{copySuccess ? <CheckCircle className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}</button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Khóa kích hoạt (License Key)</label>
                                <div className="relative"><Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" /><input type="text" value={licenseInput} onChange={(e) => setLicenseInput(e.target.value)} placeholder="Nhập khóa kích hoạt..." className="w-full bg-dark-900 border border-dark-700 rounded pl-9 pr-3 py-2 text-xs text-white focus:border-primary-500 outline-none font-mono"/></div>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-2">
                            <div className="flex-1">{licenseStatus && <div className={`text-[10px] inline-flex items-center gap-1.5 px-2 py-1 rounded border ${licenseStatus.isValid ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>{licenseStatus.isValid ? <ShieldCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}<span className="font-medium">{licenseStatus.message}</span></div>}</div>
                            <div className="flex gap-2 shrink-0"><button onClick={handleCheckLicense} className="px-4 py-2 bg-dark-800 border border-dark-600 rounded text-xs font-bold hover:bg-dark-700 text-slate-300 transition-colors">Kiểm tra</button><button onClick={handleActivateLicense} className="px-4 py-2 bg-primary-600 rounded text-xs font-bold hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20 transition-colors flex items-center gap-1"><Unlock className="w-3 h-3"/> Kích hoạt</button></div>
                        </div>
                    </div>
                </section>
                
                <div className="h-px bg-dark-800"></div>
                
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Monitor className="w-4 h-4 text-red-500"/> Vùng Nguy Hiểm</h3>
                    <button onClick={handleFactoryReset} className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors"><RefreshCw className="w-4 h-4" /> Khởi động lại ứng dụng (Reset System)</button>
                </section>
            </div>
        </div>
    );
}