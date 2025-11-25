

import React from 'react';
import { GroupBox, SimpleSlider } from '../../components/ui/Shared';
import { GenerationConfig } from '../../types';

interface PanelProps {
    config: GenerationConfig;
    setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>;
}

export const CameraRawPanel: React.FC<PanelProps> = ({ config, setConfig }) => (
    <>
        <GroupBox title="CÂN BẰNG TRẮNG">
            <SimpleSlider label="Nhiệt độ (Temp)" value={config.cameraRaw.temperature} min={-100} max={100} onChange={(v) => setConfig(p => ({...p, cameraRaw: {...p.cameraRaw, temperature: v}}))} />
            <SimpleSlider label="Sắc thái (Tint)" value={config.cameraRaw.tint} min={-100} max={100} onChange={(v) => setConfig(p => ({...p, cameraRaw: {...p.cameraRaw, tint: v}}))} />
        </GroupBox>
        <GroupBox title="ÁNH SÁNG (TONE)">
            <SimpleSlider label="Phơi sáng (Exposure)" value={config.cameraRaw.exposure} min={-100} max={100} onChange={(v) => setConfig(p => ({...p, cameraRaw: {...p.cameraRaw, exposure: v}}))} />
            <SimpleSlider label="Độ tương phản (Contrast)" value={config.cameraRaw.contrast} min={-100} max={100} onChange={(v) => setConfig(p => ({...p, cameraRaw: {...p.cameraRaw, contrast: v}}))} />
            <SimpleSlider label="Vùng sáng (Highlights)" value={config.cameraRaw.highlights} min={-100} max={100} onChange={(v) => setConfig(p => ({...p, cameraRaw: {...p.cameraRaw, highlights: v}}))} />
            <SimpleSlider label="Vùng tối (Shadows)" value={config.cameraRaw.shadows} min={-100} max={100} onChange={(v) => setConfig(p => ({...p, cameraRaw: {...p.cameraRaw, shadows: v}}))} />
            <SimpleSlider label="Điểm trắng (Whites)" value={config.cameraRaw.whites} min={-100} max={100} onChange={(v) => setConfig(p => ({...p, cameraRaw: {...p.cameraRaw, whites: v}}))} />
            <SimpleSlider label="Điểm đen (Blacks)" value={config.cameraRaw.blacks} min={-100} max={100} onChange={(v) => setConfig(p => ({...p, cameraRaw: {...p.cameraRaw, blacks: v}}))} />
        </GroupBox>
        <GroupBox title="CHI TIẾT & MÀU SẮC">
            <SimpleSlider label="Kết cấu (Texture)" value={config.cameraRaw.texture} min={0} max={100} onChange={(v) => setConfig(p => ({...p, cameraRaw: {...p.cameraRaw, texture: v}}))} />
            <SimpleSlider label="Độ rõ nét (Clarity)" value={config.cameraRaw.clarity} min={0} max={100} onChange={(v) => setConfig(p => ({...p, cameraRaw: {...p.cameraRaw, clarity: v}}))} />
            <SimpleSlider label="Giảm sương mù (Dehaze)" value={config.cameraRaw.dehaze} min={0} max={100} onChange={(v) => setConfig(p => ({...p, cameraRaw: {...p.cameraRaw, dehaze: v}}))} />
            <SimpleSlider label="Độ rực màu (Vibrance)" value={config.cameraRaw.vibrance} min={-100} max={100} onChange={(v) => setConfig(p => ({...p, cameraRaw: {...p.cameraRaw, vibrance: v}}))} />
            <SimpleSlider label="Độ bão hòa (Saturation)" value={config.cameraRaw.saturation} min={-100} max={100} onChange={(v) => setConfig(p => ({...p, cameraRaw: {...p.cameraRaw, saturation: v}}))} />
        </GroupBox>
    </>
);

export const CameraRawSVG = ({ config }: { config: GenerationConfig['cameraRaw'] }) => {
    const getTableValues = (shadows: number, highlights: number) => {
        const s = shadows / 100;
        const h = highlights / 100;
        const steps = 10;
        const values = [];
        for (let i = 0; i <= steps; i++) {
            let x = i / steps;
            let y = x;
            if (x < 0.5) y += Math.sin(x * Math.PI) * (s * 0.2); 
            if (x > 0.5) {
                let x2 = (x - 0.5) * 2;
                y += Math.sin(x2 * Math.PI) * (h * 0.2); 
            }
            y = Math.max(0, Math.min(1, y));
            values.push(y);
        }
        return values.join(' ');
    };

    const getMatrixValues = (temp: number, tint: number) => {
        const t = temp / 200; 
        const ti = tint / 200;
        const r = 1 + t;
        const b = 1 - t;
        const g = 1 + ti;
        return `${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`;
    };

    return (
        <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
            <defs>
                <filter id="cameraRawFilter">
                    <feColorMatrix type="matrix" values={getMatrixValues(config.temperature, config.tint)} result="colorCorr" />
                    <feComponentTransfer in="colorCorr" result="exposureCorr">
                        <feFuncR type="linear" slope={String(1 + config.exposure/100 + config.contrast/100)} intercept={String(-(config.contrast/200))} />
                        <feFuncG type="linear" slope={String(1 + config.exposure/100 + config.contrast/100)} intercept={String(-(config.contrast/200))} />
                        <feFuncB type="linear" slope={String(1 + config.exposure/100 + config.contrast/100)} intercept={String(-(config.contrast/200))} />
                    </feComponentTransfer>
                    <feComponentTransfer in="exposureCorr" result="toneMapped">
                        <feFuncR type="table" tableValues={getTableValues(config.shadows, config.highlights)} />
                        <feFuncG type="table" tableValues={getTableValues(config.shadows, config.highlights)} />
                        <feFuncB type="table" tableValues={getTableValues(config.shadows, config.highlights)} />
                    </feComponentTransfer>
                    <feColorMatrix in="toneMapped" type="saturate" values={String(1 + config.saturation/100)} result="saturated" />
                    {config.clarity > 0 ? (
                        <>
                           <feConvolveMatrix order="3,3" kernelMatrix="0 -1 0 -1 5 -1 0 -1 0" in="saturated" result="sharpened" />
                           <feBlend in="sharpened" in2="saturated" mode="normal" result="final" />
                        </>
                    ) : (
                       <feMerge>
                           <feMergeNode in="saturated" />
                       </feMerge>
                    )}
                </filter>
            </defs>
        </svg>
    );
};