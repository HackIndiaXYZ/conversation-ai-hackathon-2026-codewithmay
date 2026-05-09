import { useState, useRef, useCallback, useEffect } from 'react';

export const useTextToSpeech = (settings = {}) => {
  const [isSpeaking, setIsSpeaking]           = useState(false);
  const [audioAmplitude, setAudioAmplitude]   = useState(0);
  const [availableVoices, setAvailableVoices] = useState([]);

  const audioContextRef  = useRef(null);
  const audioRef         = useRef(null);
  const rafRef           = useRef(null);
  const utteranceRef     = useRef(null);

  // ── Audio queue for chunked TTS playback ──────────────────────────────────
  const chunkBufferRef    = useRef({});
  const nextSeqRef        = useRef(0);
  const isPlayingChunkRef = useRef(false);
  const chunkedModeRef    = useRef(false);

  // Keep settings in a ref so callbacks always see latest values
  // without needing settings in every dep array (avoids stale closures)
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Load voices
  useEffect(() => {
    const load = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      if (voices.length > 0) setAvailableVoices(voices);
    };
    load();
    window.speechSynthesis?.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load);
  }, []);

  // ── Animation frame helpers ───────────────────────────────────────────────
  const stopRAF = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setAudioAmplitude(0);
  }, []);

  const startSimulation = useCallback(() => {
    stopRAF();
    let t = 0;
    // Simulate realistic syllable bursts: sharp attack, fast decay, with
    // phrase-level envelope so mouth doesn't just run at constant amplitude.
    // Syllable rate ~3-5 per second, phrase envelope ~0.8s on / 0.3s off.
    const tick = () => {
      const syllable = Math.pow(Math.max(0, Math.sin(t * 10)), 2.0);
      const phrase   = Math.max(0, Math.sin(t * 1.1) * 0.55 + 0.45);
      const noise    = Math.random() * 0.05;
      setAudioAmplitude(Math.min(0.7, syllable * phrase * 0.7 + noise * phrase));
      t += 0.016;
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, [stopRAF]);

  const startAudioAnalysis = useCallback((audio) => {
    stopRAF();
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (!audio._sourceNode) {
        audio._sourceNode = ctx.createMediaElementSource(audio);
      }
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.55;
      audio._sourceNode.connect(analyser);
      analyser.connect(ctx.destination);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sumSq = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sumSq += v * v;
        }
        setAudioAmplitude(Math.min(1, Math.sqrt(sumSq / data.length) * 4));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.warn('Web Audio failed, falling back to simulation:', e.message);
      startSimulation();
    }
  }, [stopRAF, startSimulation]);

  // ── Web Speech API fallback ───────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (!text?.trim()) return;
    if (settingsRef.current.voiceEnabled === false) return;
    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const s = settingsRef.current;
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      const voices = window.speechSynthesis.getVoices();

      if (s.selectedVoiceURI) {
        const picked = voices.find(v => v.voiceURI === s.selectedVoiceURI);
        if (picked) utterance.voice = picked;
      } else {
        const female = voices.find(v =>
          /female|woman/i.test(v.name) ||
          /samantha|victoria|karen|moira|fiona|tessa|aria|jenny|ana|michelle|emma|zira|susan|hazel/i.test(v.name)
        ) || voices.find(v => v.lang.startsWith('en-')) || null;
        if (female) utterance.voice = female;
      }

      utterance.lang   = 'en-US';
      utterance.rate   = s.speechSpeed  ?? 1.0;
      utterance.pitch  = s.speechPitch  ?? 1.05;
      utterance.volume = s.speechVolume ?? 1.0;

      utterance.onstart = () => { setIsSpeaking(true);  startSimulation(); };
      utterance.onend   = () => { setIsSpeaking(false); stopRAF(); };
      utterance.onerror = (e) => {
        if (e.error !== 'interrupted') console.error('SpeechSynthesis:', e.error);
        setIsSpeaking(false); stopRAF();
      };

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
    }
  }, [startSimulation, stopRAF]); // settingsRef is a stable ref — safe to omit from deps

  // ── Single base64 audio playback ──────────────────────────────────────────
  const playAudio = useCallback((audioData, mimeType = 'audio/mpeg') => {
    if (!audioData) return;
    if (settingsRef.current.voiceEnabled === false) return;
    window.speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    stopRAF();

    try {
      const audio = new Audio(`data:${mimeType};base64,${audioData}`);
      audioRef.current = audio;
      audio.volume = settingsRef.current.speechVolume ?? 1.0;

      audio.onplay  = () => { setIsSpeaking(true);  startAudioAnalysis(audio); };
      audio.onended = () => { setIsSpeaking(false); stopRAF(); };
      audio.onerror = () => { setIsSpeaking(false); stopRAF(); };

      const p = audio.play();
      if (p) p.catch(err => {
        console.warn('Autoplay blocked:', err.message);
        setIsSpeaking(false); stopRAF();
      });
    } catch (e) {
      console.error('playAudio error:', e);
      setIsSpeaking(false);
    }
  }, [startAudioAnalysis, stopRAF]);

  // ── Chunked audio queue ───────────────────────────────────────────────────

  const resetQueue = useCallback(() => {
    chunkBufferRef.current    = {};
    nextSeqRef.current        = 0;
    isPlayingChunkRef.current = false;
    chunkedModeRef.current    = true;
  }, []);

  /**
   * FIX: Use a stable ref for drainQueue so the onended callback always calls
   * the latest version without creating a circular/stale closure.
   * The previous code had drainQueue in its own dep array via useCallback,
   * which caused the onended closure to call a stale version of drainQueue
   * that held old ref snapshots.
   */
  const drainQueueRef = useRef(null);

  // Assign the drain logic to the ref on every render — cheap, always fresh
  drainQueueRef.current = () => {
    if (isPlayingChunkRef.current) return;
    const seq = nextSeqRef.current;
    const entry = chunkBufferRef.current[seq];
    if (!entry) return; // chunk not arrived yet; enqueueChunk will call drain when it arrives

    isPlayingChunkRef.current = true;
    nextSeqRef.current = seq + 1;
    delete chunkBufferRef.current[seq];

    const { audioData, mimeType } = entry;

    window.speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

    try {
      const audio = new Audio(`data:${mimeType};base64,${audioData}`);
      audioRef.current = audio;
      audio.volume = settingsRef.current.speechVolume ?? 1.0;

      audio.onplay = () => {
        setIsSpeaking(true);
        startAudioAnalysis(audio);
      };

      audio.onended = () => {
        isPlayingChunkRef.current = false;
        const hasMore = Object.keys(chunkBufferRef.current).length > 0;
        if (hasMore) {
          // More chunks already buffered — play them
          drainQueueRef.current();
        } else if (!chunkedModeRef.current) {
          // Queue is finalised and no buffered chunks remain — done
          setIsSpeaking(false);
          stopRAF();
        }
        // else: still in chunked mode, waiting for next chunk to arrive via enqueueChunk
      };

      audio.onerror = () => {
        console.warn('[TTS queue] Audio element error for seq', seq);
        isPlayingChunkRef.current = false;
        drainQueueRef.current(); // skip bad chunk, try next
      };

      const p = audio.play();
      if (p) p.catch(err => {
        console.warn('[TTS queue] Autoplay blocked for seq', seq, err.message);
        isPlayingChunkRef.current = false;
        drainQueueRef.current();
      });
    } catch (e) {
      console.error('[TTS queue] Error playing chunk seq', seq, e);
      isPlayingChunkRef.current = false;
      drainQueueRef.current();
    }
  };

  // Stable wrapper — never recreated, calls the always-fresh ref
  const drainQueue = useCallback(() => {
    drainQueueRef.current();
  }, []);

  const enqueueChunk = useCallback((seq, audio) => {
    if (!audio?.audioData) return;
    if (settingsRef.current.voiceEnabled === false) return;

    chunkBufferRef.current[seq] = {
      audioData: audio.audioData,
      mimeType:  audio.mimeType || 'audio/mpeg',
    };
    // Always try to drain — if nothing is playing and this is the next expected seq, it plays immediately
    drainQueue();
  }, [drainQueue]);

  const finaliseQueue = useCallback((usedChunkedAudio, fullText) => {
    chunkedModeRef.current = false;

    if (!usedChunkedAudio) {
      // No Google TTS key on server — fall back to Web Speech API
      if (fullText) speak(fullText);
      return;
    }

    // If playback already finished before finalise arrived, clean up now
    if (!isPlayingChunkRef.current && Object.keys(chunkBufferRef.current).length === 0) {
      setIsSpeaking(false);
      stopRAF();
    }
    // Otherwise the last chunk's onended will handle teardown
  }, [speak, stopRAF]);

  // ── Stop everything ───────────────────────────────────────────────────────
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    isPlayingChunkRef.current = false;
    chunkBufferRef.current    = {};
    chunkedModeRef.current    = false;
    setIsSpeaking(false);
    stopRAF();
  }, [stopRAF]);

  return {
    isSpeaking,
    audioAmplitude,
    availableVoices,
    speak,
    playAudio,
    enqueueChunk,
    resetQueue,
    finaliseQueue,
    stop,
  };
};
