import React from 'react';
import { GroupBox, BalanceSlider } from '../../components/ui/Shared';
import { GenerationConfig } from '../../types';

interface PanelProps { config: GenerationConfig; setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>; }

export const SymmetrySettingsPanel: React.FC<PanelProps> = ({ config, setConfig }) => (
    <>
        <GroupBox title="TÓC & MẮT">
            <BalanceSlider label="Mượt tóc" value={config.faceBalance.smoothHair} onChange={(v) => setConfig(prev => ({ ...prev, faceBalance: { ...prev.faceBalance, smoothHair: v } }))} />
            <BalanceSlider label="Khoảng cách mắt" value={config.faceBalance.eyeDistance} onChange={(v) => setConfig(prev => ({ ...prev, faceBalance: { ...prev.faceBalance, eyeDistance: v } }))} />
        </GroupBox>
        <GroupBox title="MŨI & MIỆNG">
            <BalanceSlider label="Sống mũi" value={config.faceBalance.noseBridge} onChange={(v) => setConfig(prev => ({ ...prev, faceBalance: { ...prev.faceBalance, noseBridge: v } }))} />
            <BalanceSlider label="Răng & Lợi" value={config.faceBalance.teethGums} onChange={(v) => setConfig(prev => ({ ...prev, faceBalance: { ...prev.faceBalance, teethGums: v } }))} />
        </GroupBox>
        <GroupBox title="CẰM & HÀM">
            <BalanceSlider label="Thon gọn hàm" value={config.faceBalance.jawSlim} onChange={(v) => setConfig(prev => ({ ...prev, faceBalance: { ...prev.faceBalance, jawSlim: v } }))} />
            <BalanceSlider label="Cằm V-Line" value={config.faceBalance.chinVLine} onChange={(v) => setConfig(prev => ({ ...prev, faceBalance: { ...prev.faceBalance, chinVLine: v } }))} />
        </GroupBox>
    </>
);