import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSpeechRecognition
 *
 * Additions vs original:
 *  - continuous: true  →  mic stays open across turns
 *  - 600 ms silence timer  →  fires onFinalTranscript(text) after silence
 *  - onFinalTranscript prop wired via startListening({ onFinalTranscript })
 */
export const useSpeechRecognition = () => {
  const [isListening, setIsListening]   = useState(false);
  const [transcript, setTranscript]     = useState('');
  const [isSupported, setIsSupported]   = useState(false);

  const recognitionRef       = useRef(null);
  const silenceTimerRef      = useRef(null);
  const onFinalTranscriptRef = useRef(null); // stable ref so the callback is always fresh
  const pendingFinalRef      = useRef('');   // accumulates final words during this turn

  const SILENCE_MS = 600;

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous      = true;   // keep listening across turns
    recognition.interimResults  = true;
    recognition.lang            = 'en-US';

    recognition.onresult = (event) => {
      let finalText    = '';
      let interimText  = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText   += text + ' ';
          pendingFinalRef.current += text + ' ';
        } else {
          interimText += text;
        }
      }

      // Show live text
      setTranscript(pendingFinalRef.current + interimText);

      if (finalText) {
        // Reset silence timer on every new final segment
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(() => {
          const full = pendingFinalRef.current.trim();
          if (full && typeof onFinalTranscriptRef.current === 'function') {
            onFinalTranscriptRef.current(full);
          }
          pendingFinalRef.current = '';
          setTranscript('');
        }, SILENCE_MS);
      }
    };

    recognition.onerror = (event) => {
      // 'no-speech' is harmless in continuous mode — don't stop listening
      if (event.error !== 'no-speech') {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current?._shouldBeListening) {
        // Small delay prevents "already started" errors
        setTimeout(() => {
          if (recognitionRef.current?._shouldBeListening) {
            try { recognition.start(); } catch (_) {}
          }
        }, 100);
      }
    };

    return () => {
      clearSilenceTimer();
      recognition._shouldBeListening = false;
      try { recognition.stop(); } catch (_) {}
    };
  }, []);

  /**
   * Start listening.
   * @param {object} opts
   * @param {Function} [opts.onFinalTranscript] - called with final text after 600 ms silence
   */
  // Use a ref so startListening/stopListening never go stale
  const isListeningRef = useRef(false);
  const syncListening  = (val) => { isListeningRef.current = val; setIsListening(val); };

  const startListening = useCallback((opts = {}) => {
    if (!recognitionRef.current || isListeningRef.current) return;
    onFinalTranscriptRef.current = opts.onFinalTranscript || null;
    pendingFinalRef.current = '';
    setTranscript('');
    clearSilenceTimer();
    recognitionRef.current._shouldBeListening = true;
    try {
      recognitionRef.current.start();
      syncListening(true);
    } catch (e) {
      console.warn('startListening error:', e.message);
    }
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (!recognitionRef.current) return;
    recognitionRef.current._shouldBeListening = false;
    pendingFinalRef.current = '';
    syncListening(false);
    try { recognitionRef.current.stop(); } catch (_) {}
  }, []);

  const resetTranscript = useCallback(() => {
    pendingFinalRef.current = '';
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};