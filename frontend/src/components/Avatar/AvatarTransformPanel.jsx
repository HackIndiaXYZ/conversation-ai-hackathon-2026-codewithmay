import React from 'react';
import { RotateCcw, ZoomIn, MoveHorizontal, MoveVertical } from 'lucide-react';

/**
 * AvatarTransformPanel
 * Compact sliders to zoom/reposition the avatar canvas per persona.
 * Rendered inside the settings drawer in VoiceOrb.
 */
const AvatarTransformPanel = ({ personaName, transform, onChange, onReset }) => {
  const { scale, translateY, translateX } = transform;

  const Row = ({ icon: Icon, label, valueKey, min, max, step, value, unit }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-primary-400" />
          {label}
        </span>
        <span className="text-xs font-mono text-primary-300">
          {value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(valueKey, parseFloat(e.target.value))}
        className="w-full accent-primary-500"
      />
      <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="border-t border-white/8 pt-3 mt-1 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Avatar Position — {personaName}
        </span>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-primary-400 transition-colors"
          title="Reset to defaults"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <Row icon={ZoomIn}          label="Zoom"       valueKey="scale"      min={50}   max={200} step={1}  value={scale}      unit="%" />
      <Row icon={MoveVertical}    label="Move up/down"  valueKey="translateY" min={-300} max={300} step={5}  value={translateY} unit="px" />
      <Row icon={MoveHorizontal}  label="Move left/right" valueKey="translateX" min={-300} max={300} step={5}  value={translateX} unit="px" />
    </div>
  );
};

export default AvatarTransformPanel;
