import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  Settings, X, Volume2, Save, ChevronUp, Bot, ChevronDown,
} from 'lucide-react';
import AvatarTransformPanel from './AvatarTransformPanel';
import { loadSettings } from '../UI/SettingsPanel';

const VoiceOrb = ({
  isListening, isLoading, isSpeaking,
  audioAmplitude = 0,
  transcript = '',
  onStartListening, onStopListening,
  isSupported = true,
  isCameraOn, onToggleCamera,
  isScreenSharing, onToggleScreenShare,
  availableVoices = [],
  onSettingsChange,
  avatarTransform = { scale:100, translateY:0, translateX:0 },
  onTransformChange, onTransformReset,
  personaName = 'Avatar',
  isMobile = false,
}) => {
  const canvasRef       = useRef(null);
  const animRef         = useRef(null);
  const ampRef          = useRef(0);
  const holdTimer           = useRef(null);
  const holdMode            = useRef(false);
  const settingsHandlerRef  = useRef(null);
  const isListeningRef      = useRef(isListening);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  const [expanded, setExpanded]       = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const showSettingsRef = useRef(false);
  const leaveTimer      = useRef(null);
  const setShowSettingsSync = (val) => {
    const v = typeof val === 'function' ? val(showSettingsRef.current) : val;
    showSettingsRef.current = v;
    setShowSettings(v);
  };
  const [settings, setSettings]       = useState(loadSettings);
  const [personaExpanded, setPersonaExpanded] = useState(false);

  /* amplitude smoothing */
  useEffect(() => { ampRef.current = ampRef.current * 0.65 + audioAmplitude * 0.35; }, [audioAmplitude]);

  /* speaking rings */
  useEffect(() => {
    if (!isSpeaking) { cancelAnimationFrame(animRef.current); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    const W = canvas.width, H = canvas.height;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const amp = Math.min(1, ampRef.current * 4 + 0.15);
      for (let i = 0; i < 4; i++) {
        const jitter = i === 0 ? (Math.random() - 0.5) * 4 * amp : 0;
        ctx.beginPath();
        ctx.arc(W/2, H/2, 34 + i*14 + amp*16 + jitter, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(124,58,237,${(0.45 - i*0.09) * amp})`;
        ctx.lineWidth = i === 0 ? 1.5 : 2;
        ctx.stroke();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isSpeaking]);

  /* close settings when clicking outside the orb cluster */
  useEffect(() => {
    if (!showSettings) return;
    const handler = (e) => {
      if (!e.target.closest('[data-orb-cluster]')) setShowSettingsSync(false);
    };
    const t = setTimeout(() => document.addEventListener('pointerdown', handler), 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener('pointerdown', handler);
    };
  }, [showSettings]);

  /* ── Orb click to toggle ── */
  const handleOrbClick = useCallback(() => {
    if (!isSupported) return;
    if (isListeningRef.current) {
      // Always allow stopping the mic, even while speaking/loading
      onStopListening();
    } else {
      // Only block *starting* the mic while the avatar is busy
      if (isLoading || isSpeaking) return;
      onStartListening();
    }
  }, [isSupported, isLoading, isSpeaking, onStartListening, onStopListening]);

  const handleSettingsSave = () => {
    localStorage.setItem('ai-avatar-settings', JSON.stringify(settings));
    onSettingsChange?.(settings);
    setShowSettings(false);
  };
  const updateSetting = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const isActive = isListening || isLoading || isSpeaking;
  const showSats = expanded || isListening;
  const enVoices = availableVoices.filter(v => v.lang?.startsWith('en'));
  const orbSize  = isMobile ? 76 : 68;

  return (
    <div
      data-orb-cluster
      className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      style={{ bottom: isMobile ? 'max(84px, calc(84px + env(safe-area-inset-bottom)))' : 24 }}
      onMouseEnter={() => {
        if (isMobile) return;
        if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
        setExpanded(true);
      }}
      onMouseLeave={() => {
        if (isMobile) return;
        leaveTimer.current = setTimeout(() => {
          if (!showSettingsRef.current) setExpanded(false);
        }, 2000);
      }}
    >
      {/* ── Settings drawer ── */}
      <div
        className="w-72 rounded-2xl overflow-hidden"
        style={{
          background: showSettings ? 'rgba(6,6,14,0.97)' : 'transparent',
          backdropFilter: showSettings ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: showSettings ? 'blur(20px)' : 'none',
          border: showSettings ? '1px solid rgba(255,255,255,0.1)' : 'none',
          boxShadow: showSettings ? '0 25px 50px rgba(0,0,0,0.6)' : 'none',
          marginBottom: showSettings ? '0.75rem' : 0,
          pointerEvents: showSettings ? 'auto' : 'none',
        }}
      >
        <div className={`accordion-inner ${showSettings ? 'open' : ''}`}>
          <div>
            {/* drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <span className="text-sm font-semibold text-white">Settings</span>
              <button onPointerDown={(e) => { e.stopPropagation(); setShowSettingsSync(false); setExpanded(false); }}
                className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-colors"
                style={{ minWidth:36, minHeight:36 }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 460 }}>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary-400" /> Voice output
                </span>
                <div onClick={() => updateSetting('voiceEnabled', !settings.voiceEnabled)}
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${settings.voiceEnabled ? 'bg-primary-600' : 'bg-gray-700'}`}>
                  <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{ left: settings.voiceEnabled ? '1.25rem' : '0.125rem' }} />
                </div>
              </label>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Voice</label>
                <select value={settings.selectedVoiceURI} onChange={e => updateSetting('selectedVoiceURI', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="">— Auto (female) —</option>
                  {enVoices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name}{v.localService?' ✓':''}</option>)}
                  {availableVoices.filter(v => !v.lang?.startsWith('en')).map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Speed — {settings.speechSpeed.toFixed(1)}×</label>
                <input type="range" min="0.5" max="2.0" step="0.1" value={settings.speechSpeed}
                  onChange={e => updateSetting('speechSpeed', parseFloat(e.target.value))} className="w-full accent-primary-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Volume — {Math.round(settings.speechVolume*100)}%</label>
                <input type="range" min="0" max="1" step="0.05" value={settings.speechVolume}
                  onChange={e => updateSetting('speechVolume', parseFloat(e.target.value))} className="w-full accent-primary-500" />
              </div>
              <AvatarTransformPanel personaName={personaName} transform={avatarTransform}
                onChange={(key,val) => onTransformChange?.(key,val)} onReset={() => onTransformReset?.()} />
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-300">Avatar animations</span>
                <div onClick={() => updateSetting('avatarAnimations', !settings.avatarAnimations)}
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${settings.avatarAnimations ? 'bg-primary-600' : 'bg-gray-700'}`}>
                  <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{ left: settings.avatarAnimations ? '1.25rem' : '0.125rem' }} />
                </div>
              </label>
              <div className="border-t border-white/8 pt-1" />
              <div>
                <button onClick={() => setPersonaExpanded(p => !p)}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-200 py-1">
                  <span className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary-400" /> Avatar Persona
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${personaExpanded ? '' : '-rotate-90'}`} />
                </button>
                {personaExpanded && (
                  <div className="mt-3 space-y-3">
                    <p className="text-xs text-gray-500 leading-relaxed">Override the active persona. Leave blank to use defaults.</p>
                    {[['Avatar Name','personaName','e.g. Dr. Maya, Alex…'],['Role / Title','personaRole','e.g. Sales Coach, Study Buddy…'],['Personality Traits','personaTraits','e.g. friendly, concise, direct…']].map(([label,key,ph]) => (
                      <div key={key}>
                        <label className="text-xs text-gray-400 block mb-1">{label}</label>
                        <input type="text" value={settings[key]||''} onChange={e=>updateSetting(key,e.target.value)} placeholder={ph}
                          className="w-full px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-gray-600" />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Dialogue Behavior</label>
                      <select value={settings.personaDialogueBehavior||''} onChange={e=>updateSetting('personaDialogueBehavior',e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500">
                        <option value="">— Default —</option>
                        <option value="concise">Concise (max 2 sentences)</option>
                        <option value="detailed">Detailed explanations</option>
                        <option value="socratic">Socratic (guiding questions)</option>
                        <option value="empathetic">Empathetic (feelings first)</option>
                        <option value="formal">Formal (professional)</option>
                        <option value="casual">Casual (conversational)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">System Prompt <span className="ml-1 text-yellow-500">⚡ overrides all above</span></label>
                      <textarea rows={4} value={settings.personaSystemPrompt||''} onChange={e=>updateSetting('personaSystemPrompt',e.target.value)}
                        placeholder="You are [Name], a [role]…"
                        className="w-full px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono placeholder-gray-600 resize-none" />
                    </div>
                    {(settings.personaName||settings.personaRole||settings.personaTraits||settings.personaSystemPrompt||settings.personaDialogueBehavior) && (
                      <button onClick={() => {
                        ['personaName','personaRole','personaTraits','personaSystemPrompt','personaDialogueBehavior'].forEach(k=>updateSetting(k,''));
                      }} className="text-xs text-red-400 hover:text-red-300">✕ Clear persona overrides</button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="px-4 py-3 border-t border-white/8 flex justify-end">
              <button onClick={handleSettingsSave}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Transcript bubble ── */}
      {transcript && (
        <div className="mb-3 max-w-[280px] px-4 py-2 rounded-2xl border border-gray-700 text-sm text-center shadow-xl animate-fade-in"
          style={{ background:'rgba(6,6,14,0.94)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', color:'rgba(255,255,255,0.93)' }}>
          {transcript}
        </div>
      )}

      {/* ── Status label ── */}
      {(isLoading || isSpeaking) && !transcript && (
        <div className="mb-3 px-3 py-1.5 rounded-full text-xs border animate-fade-in"
          style={{ background:'rgba(6,6,14,0.88)', borderColor:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.8)' }}>
          {isLoading ? '💭 Thinking…' : '🔊 Speaking…'}
        </div>
      )}

      {/* ── Orb cluster ── */}
      <div className="relative flex items-center justify-center" style={{ width: 200, height: orbSize + 16 }}>

        {/* Canvas rings */}
        <canvas ref={canvasRef} width={orbSize + 80} height={orbSize + 80}
          className="absolute pointer-events-none"
          style={{ top: -(orbSize/2 + 16), left: (200 - orbSize - 80)/2, zIndex: 0 }} />

        {/* Thinking orbit ring */}
        {isLoading && (
          <div className="absolute mic-thinking-ring" style={{
            width: orbSize + 16, height: orbSize + 16,
            left: (200 - orbSize - 16)/2, top: -8,
          }} />
        )}

        {/* Left satellite: Camera */}
        <button onClick={onToggleCamera} title={isCameraOn ? 'Camera off' : 'Camera on'}
          className="absolute flex items-center justify-center rounded-full border transition-all duration-300 focus:outline-none active:scale-95"
          style={{
            width:44, height:44, left: showSats ? 2 : 78, top: (orbSize - 44)/2,
            opacity: showSats ? 1 : 0, pointerEvents: showSats ? 'auto' : 'none',
            background: isCameraOn ? 'rgba(124,58,237,0.2)' : 'rgba(30,30,40,0.9)',
            borderColor: isCameraOn ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            boxShadow: isCameraOn ? '0 0 12px rgba(124,58,237,0.4)' : '0 4px 16px rgba(0,0,0,0.4)',
          }}>
          {isCameraOn ? <Video className="w-4 h-4 text-primary-400" /> : <VideoOff className="w-4 h-4 text-gray-400" />}
        </button>

        {/* Centre: Main mic orb */}
        <div className="absolute" style={{ left: (200 - orbSize)/2, top: 0, width: orbSize, height: orbSize, zIndex: 10 }}>
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full animate-ping pointer-events-none" style={{ backgroundColor:'rgba(239,68,68,0.35)' }} />
              <span className="absolute inset-0 rounded-full animate-ping pointer-events-none" style={{ backgroundColor:'rgba(239,68,68,0.18)', animationDelay:'0.45s' }} />
            </>
          )}
          <button
            onClick={handleOrbClick}
            disabled={!isSupported}
            title={isListening ? 'Stop (tap) / release (hold)' : 'Tap or hold to speak'}
            className="w-full h-full rounded-full flex items-center justify-center shadow-2xl focus:outline-none active:scale-95 transition-transform duration-100 relative"
            style={{
              zIndex: 2,
              background: isListening
                ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
                : isLoading || isSpeaking
                  ? 'rgba(50,50,68,0.92)'
                  : 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
              boxShadow: isListening
                ? '0 0 28px rgba(239,68,68,0.7)'
                : isActive
                  ? '0 0 24px rgba(124,58,237,0.6)'
                  : '0 8px 36px rgba(0,0,0,0.55)',
              cursor: !isSupported ? 'not-allowed' : 'pointer',
            }}>
            {isListening
              ? <MicOff className="text-white" style={{ width: orbSize*0.38, height: orbSize*0.38 }} />
              : <Mic    className="text-white" style={{ width: orbSize*0.38, height: orbSize*0.38 }} />
            }
          </button>
        </div>

        {/* Right satellite: Screen share */}
        <button onClick={onToggleScreenShare} title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          className="absolute flex items-center justify-center rounded-full border transition-all duration-300 focus:outline-none active:scale-95"
          style={{
            width:44, height:44, right: showSats ? 2 : 78, top: (orbSize - 44)/2,
            opacity: showSats ? 1 : 0, pointerEvents: showSats ? 'auto' : 'none',
            background: isScreenSharing ? 'rgba(124,58,237,0.2)' : 'rgba(30,30,40,0.9)',
            borderColor: isScreenSharing ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)',
            backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
            boxShadow: isScreenSharing ? '0 0 12px rgba(124,58,237,0.4)' : '0 4px 16px rgba(0,0,0,0.4)',
          }}>
          {isScreenSharing ? <MonitorOff className="w-4 h-4 text-primary-400" /> : <Monitor className="w-4 h-4 text-gray-400" />}
        </button>

        {/* Top satellite: Settings */}
        <button onPointerDown={(e) => { e.stopPropagation(); setShowSettingsSync(s => !s); setExpanded(true); }} title="Settings"
          className="absolute flex items-center justify-center rounded-full border transition-all duration-300 focus:outline-none active:scale-95"
          style={{
            width:44, height:44,
            left: (200 - 44)/2,
            top: showSats ? -(44 + 10) : (orbSize - 44)/2,
            opacity: showSats ? 1 : 0, pointerEvents: showSats ? 'auto' : 'none',
            background: showSettings ? 'rgba(124,58,237,0.2)' : 'rgba(30,30,40,0.9)',
            borderColor: showSettings ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)',
            backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
            boxShadow: showSettings ? '0 0 12px rgba(124,58,237,0.4)' : '0 4px 16px rgba(0,0,0,0.4)',
          }}>
          {showSettings ? <ChevronUp className="w-4 h-4 text-primary-400" /> : <Settings className="w-4 h-4 text-gray-400" />}
        </button>
      </div>

      {/* Mobile expand hint */}
      {isMobile && !isActive && !showSettings && isSupported && (
        <button
          className="mt-1 flex items-center gap-1"
          onClick={() => setExpanded(e => !e)}
          style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}>
          {expanded ? '↑ hide' : '··· more'}
        </button>
      )}
      {/* Desktop hint */}
      {!isMobile && !isActive && isSupported && !showSettings && (
        <p className="mt-2 text-xs text-gray-500 select-none pointer-events-none">Tap to speak</p>
      )}
    </div>
  );
};

export default VoiceOrb;