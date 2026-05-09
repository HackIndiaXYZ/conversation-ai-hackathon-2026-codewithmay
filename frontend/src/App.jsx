import React, { useState, useEffect, useRef, useCallback } from 'react';
import AvatarCanvas from './components/Avatar/AvatarCanvas';
import VoiceOrb from './components/Avatar/VoiceOrb';
import ChatPanel from './components/Chat/ChatPanel';
import { loadSettings } from './components/UI/SettingsPanel';
import MediaView from './components/UI/MediaView';
import PersonaSelector from './components/UI/PersonaSelector';
import PersonaCard from './components/UI/PersonaCard';
import PrxaNavbar from './components/Brand/PrxaNavbar';
import { useChat } from './hooks/useChat';
import { useAvatarTransform } from './hooks/useAvatarTransform';
import { usePersona } from './hooks/usePersona';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useTextToSpeech } from './hooks/useTextToSpeech';

const DEFAULT_MOOD = {
  haru:            'analytical',
  izumi_anime_01:  'friendly',
  kei_vowels_pro:  'engaged',
  haru_greeter:    'calm',
};

function modelKeyFromPath(path) {
  if (!path) return '';
  const parts = path.split('/').filter(Boolean);
  return parts[1] || '';
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

/* ─── Powered-by badge ──────────────────────────────────────── */
const PoweredBadge = () => (
  <div className="powered-badge" style={{ zIndex: 10 }}>
    <span className="powered-badge-dot" />
    <span className="powered-badge-text">Powered by Realtime AI</span>
  </div>
);

/* ─── AvatarSection ─────────────────────────────────────────── */
const AvatarSection = React.memo(({
  persona, audioAmplitude, isSpeaking, personaLoading, onManagerReady,
  isListening, isLoading, transcript, isSupported, onStartListening, onStopListening,
  isCameraOn, onToggleCamera, isScreenSharing, onToggleScreenShare,
  availableVoices, onSettingsChange,
  avatarTransform, onTransformChange, onTransformReset,
  imageQuery, imageVisible, imageCount,
  isMobile, showPoweredBadge,
}) => (
  <div className="absolute inset-0 w-full h-full">
    {/* Background depth vignette */}
    <div className="avatar-vignette" />

    {/* Speaking halo */}
    <div className={`avatar-halo ${isSpeaking ? 'active' : ''}`} />

    {/* Speaking ring pulse */}
    <div className={`avatar-speaking-ring ${isSpeaking ? 'active' : ''}`} />

    {personaLoading ? (
      <div className="avatar-loading-state">
        <div className="avatar-loading-ring" />
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(156,163,175,0.7)',
          letterSpacing: '0.04em',
        }}>
          Initializing avatar…
        </p>
      </div>
    ) : (
      <AvatarCanvas
        modelPath={persona?.modelPath}
        audioAmplitude={audioAmplitude}
        isSpeaking={isSpeaking}
        background={persona?.background || 'hospital'}
        onManagerReady={onManagerReady}
        transform={avatarTransform}
        imageQuery={imageQuery}
        imageVisible={imageVisible}
        imageCount={imageCount}
      />
    )}

    {/* Persona card — desktop only */}
    {!isMobile && <PersonaCard persona={persona} />}

    {/* Powered badge — optional */}
    {showPoweredBadge && !isMobile && <PoweredBadge />}

    {/* Subtitle strip — mobile speaking/thinking */}
    {isMobile && (isSpeaking || isLoading || isListening) && (
      <div className="subtitle-strip">
        {isListening
          ? (transcript || '🎙 Listening…')
          : isLoading
            ? '💭 Thinking…'
            : ''}
      </div>
    )}

    <VoiceOrb
      isListening={isListening}
      isLoading={isLoading}
      isSpeaking={isSpeaking}
      audioAmplitude={audioAmplitude}
      transcript={isMobile ? '' : transcript}
      onStartListening={onStartListening}
      onStopListening={onStopListening}
      isSupported={isSupported}
      isCameraOn={isCameraOn}
      onToggleCamera={onToggleCamera}
      isScreenSharing={isScreenSharing}
      onToggleScreenShare={onToggleScreenShare}
      availableVoices={availableVoices}
      onSettingsChange={onSettingsChange}
      avatarTransform={avatarTransform}
      onTransformChange={onTransformChange}
      onTransformReset={onTransformReset}
      personaName={persona?.name || 'Avatar'}
      isMobile={isMobile}
    />
  </div>
));
AvatarSection.displayName = 'AvatarSection';

/* ─── App ───────────────────────────────────────────────────── */
function App() {
  const isMobile = useIsMobile();

  const [viewMode, setViewMode]               = useState('avatar');
  const [isCameraOn, setIsCameraOn]           = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [ttsSettings, setTtsSettings]         = useState(loadSettings);
  const [imageVisible, setImageVisible]       = useState(false);
  const imageHideTimerRef                     = useRef(null);

  const { personas, activePersona, effectivePersona, loading: personaLoading, switchPersona } = usePersona(ttsSettings);
  const { messages, isLoading, currentIntent, imageQuery, imageCount, sendMessage, clearMessages, restoreMessages } = useChat();
  const {
    isListening, transcript, isSupported,
    startListening, stopListening, resetTranscript,
  } = useSpeechRecognition();
  const {
    isSpeaking, audioAmplitude, availableVoices,
    speak, playAudio, enqueueChunk, resetQueue, finaliseQueue, stop: stopSpeaking,
  } = useTextToSpeech(ttsSettings);

  const { getTransform, setTransform, resetTransform } = useAvatarTransform();
  const avatarTransform = activePersona
    ? getTransform(activePersona.id)
    : { scale: 100, translateY: 0, translateX: 0 };

  const avatarManagerRef     = useRef(null);
  const emotionResetTimerRef = useRef(null);
  const chatHistoriesRef     = useRef({});

  const handlePersonaSwitch = (id) => {
    if (activePersona?.id) {
      chatHistoriesRef.current[activePersona.id] = messages;
    }
    switchPersona(id);
    const saved = chatHistoriesRef.current[id];
    if (saved && saved.length > 0) {
      restoreMessages(saved);
    } else {
      clearMessages();
    }
  };

  const handleEmotionDetected = useCallback((emotion) => {
    const mgr = avatarManagerRef.current;
    if (!mgr) return;
    if (emotionResetTimerRef.current) clearTimeout(emotionResetTimerRef.current);
    mgr.setEmotion(emotion);
    emotionResetTimerRef.current = setTimeout(() => {
      const key = modelKeyFromPath(activePersona?.modelPath);
      avatarManagerRef.current?.setEmotion(DEFAULT_MOOD[key] ?? 'neutral');
      emotionResetTimerRef.current = null;
    }, 5000);
  }, [activePersona]);

  useEffect(() => {
    if (imageQuery && (isSpeaking || isLoading)) {
      if (imageHideTimerRef.current) clearTimeout(imageHideTimerRef.current);
      setImageVisible(true);
    } else if (imageVisible) {
      imageHideTimerRef.current = setTimeout(() => {
        setImageVisible(false);
        imageHideTimerRef.current = null;
      }, 6000);
    }
    return () => { if (imageHideTimerRef.current) clearTimeout(imageHideTimerRef.current); };
  }, [imageQuery, isSpeaking, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (emotionResetTimerRef.current) {
      clearTimeout(emotionResetTimerRef.current);
      emotionResetTimerRef.current = null;
    }
  }, [activePersona]);

  const handleSendMessage = useCallback(async (message) => {
    if (!message?.trim()) return;
    resetTranscript();
    resetQueue();
    await sendMessage(
      message,
      effectivePersona,
      (audio, fullText, usedChunkedAudio) => {
        if (usedChunkedAudio)       finaliseQueue(true, fullText);
        else if (audio?.audioData)  playAudio(audio.audioData, audio.mimeType);
        else                        finaliseQueue(false, fullText);
      },
      null,
      handleEmotionDetected,
      (seq, audio) => enqueueChunk(seq, audio),
    );
  }, [effectivePersona, sendMessage, resetTranscript, resetQueue, finaliseQueue, playAudio, enqueueChunk, handleEmotionDetected]);

  const handleStartListening = useCallback(() => {
    startListening({ onFinalTranscript: (text) => handleSendMessage(text) });
  }, [startListening, handleSendMessage]);

  useEffect(() => () => stopSpeaking(), [stopSpeaking]);

  const handleManagerReady = useCallback((mgr) => { avatarManagerRef.current = mgr; }, []);

  const avatarSectionProps = {
    persona: effectivePersona,
    audioAmplitude, isSpeaking, personaLoading,
    onManagerReady: handleManagerReady,
    isListening, isLoading, transcript, isSupported,
    onStartListening: handleStartListening,
    onStopListening: stopListening,
    isCameraOn,      onToggleCamera: () => setIsCameraOn(p => !p),
    isScreenSharing, onToggleScreenShare: () => setIsScreenSharing(p => !p),
    availableVoices, onSettingsChange: setTtsSettings,
    avatarTransform,
    onTransformChange: (key, val) => activePersona && setTransform(activePersona.id, key, val),
    onTransformReset:  () => activePersona && resetTransform(activePersona.id),
    imageQuery, imageVisible, imageCount,
    isMobile,
    showPoweredBadge: true,
  };

  const chatPanelProps = {
    messages, isLoading,
    onSendMessage: handleSendMessage,
    onClearChat: clearMessages,
    isListening,
    onStartListening: handleStartListening,
    onStopListening: stopListening,
    transcript,
    persona: effectivePersona,
    isMobile,
  };

  const NAVBAR_H = 52;

  return (
    <div className="h-screen-d bg-gray-950 text-white overflow-hidden" style={{ fontFamily: 'var(--font-body)' }}>

      {/* ── Proxa Echo Navbar ── */}
      <PrxaNavbar
        isSpeaking={isSpeaking}
        isListening={isListening}
        isLoading={isLoading}
        viewMode={viewMode}
        onViewModeChange={!isMobile ? setViewMode : null}
        isMobile={isMobile}
      />

      <main
        className="relative"
        style={
          isMobile || viewMode === 'avatar'
            ? { height: '100dvh', marginTop: 0 }
            : { height: `calc(100dvh - ${NAVBAR_H}px)`, marginTop: NAVBAR_H }
        }
      >

        {/* ══ MOBILE layout ══════════════════════════════════════ */}
        {isMobile ? (
          <div className="absolute inset-0 h-full">
            <AvatarSection {...avatarSectionProps} />

            {/* Persona strip */}
            <div className="absolute left-0 right-0 z-30" style={{ top: NAVBAR_H }}>
              <PersonaSelector
                personas={personas}
                activePersona={activePersona}
                onSelect={handlePersonaSwitch}
                isMobile={true}
              />
            </div>

            {/* Camera PiP */}
            {isCameraOn && (
              <div
                className="absolute left-3 z-20 w-36 h-24 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  top: NAVBAR_H + 16,
                  border: '1px solid rgba(124,58,237,0.3)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                }}
              >
                <MediaView isCameraOn={isCameraOn} />
              </div>
            )}

            <ChatPanel {...chatPanelProps} />
          </div>

        /* ══ DESKTOP avatar-only layout ════════════════════════ */
        ) : viewMode === 'avatar' ? (
          <div className="absolute inset-0">
            {/* Persona sidebar — left */}
            <div
              className="absolute left-4 z-20 pointer-events-auto"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <PersonaSelector
                personas={personas}
                activePersona={activePersona}
                onSelect={handlePersonaSwitch}
                isMobile={false}
              />
            </div>

            <AvatarSection {...avatarSectionProps} />
            <ChatPanel {...chatPanelProps} />

            {isCameraOn && (
              <div
                className="absolute top-4 left-4 w-52 h-36 rounded-2xl overflow-hidden z-10"
                style={{
                  border: '1px solid rgba(124,58,237,0.25)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                <MediaView isCameraOn={isCameraOn} />
              </div>
            )}
          </div>

        /* ══ DESKTOP split layout ══════════════════════════════ */
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              height: '100%',
              padding: 12,
            }}
          >
            {/* Left: avatar panel */}
            <div className="split-view-avatar-panel relative">
              <AvatarSection {...avatarSectionProps} showPoweredBadge={false} />
            </div>

            {/* Right: persona selector + inline chat */}
            <div className="split-view-chat-panel">
              {/* Persona strip header */}
              <div
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderBottom: '1px solid rgba(124,58,237,0.1)',
                  background: 'rgba(6,6,14,0.98)',
                }}
              >
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(124,58,237,0.7)',
                  paddingRight: 4,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>Avatar</span>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    overflowX: 'auto', scrollbarWidth: 'none',
                  }}
                >
                  {personas.map(p => {
                    const isActive = activePersona?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handlePersonaSwitch(p.id)}
                        title={p.name + ' — ' + p.role}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 10px',
                          borderRadius: 10,
                          flexShrink: 0,
                          background: isActive
                            ? 'linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(6,182,212,0.10) 100%)'
                            : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isActive ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.06)'}`,
                          boxShadow: isActive ? '0 0 12px rgba(124,58,237,0.2)' : 'none',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: 14, lineHeight: 1 }}>{p.emoji}</span>
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            fontSize: 11,
                            fontFamily: 'var(--font-display)',
                            fontWeight: 600,
                            lineHeight: 1.2,
                            color: isActive ? '#e9d5ff' : '#d1d5db',
                          }}>
                            {p.name.split(' ')[0]}
                          </p>
                          <p style={{
                            fontSize: 9,
                            lineHeight: 1.2,
                            color: isActive ? '#a78bfa' : '#6b7280',
                            maxWidth: 72,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {p.role}
                          </p>
                        </div>
                        {isActive && (
                          <span style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                            flexShrink: 0, marginLeft: 2,
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inline chat */}
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <ChatPanel {...chatPanelProps} isInline={true} />
              </div>
            </div>
          </div>
        )}
      </main>

      {!isSupported && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
          style={{
            background: 'rgba(220,38,38,0.15)',
            border: '1px solid rgba(220,38,38,0.3)',
            backdropFilter: 'blur(12px)',
            borderRadius: 12,
            padding: '10px 18px',
            fontSize: 13,
            color: '#fca5a5',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          Voice input not supported in this browser
        </div>
      )}
    </div>
  );
}

export default App;