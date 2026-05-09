import { useState, useCallback, useRef } from 'react';
import apiService from '../services/apiService';

// Regex to extract and strip the LLM-injected emotion tag
const EMOTION_TAG_RE = /^\[EMOTION:([a-z]+)\]\s*/i;

// Regex to extract and strip an image query tag anywhere in text
// Format: [IMAGE_QUERY:search terms|N]  (N = count, optional, defaults to 1)
const IMAGE_QUERY_RE = /\[IMAGE_QUERY:([^\]|]+)(?:\|(\d+))?\]/i;

/**
 * Strip [IMAGE_QUERY:...|N] from text and return { imageQuery, imageCount, text }.
 */
function parseImageQuery(text) {
  const match = text.match(IMAGE_QUERY_RE);
  if (match) {
    const count = match[2] ? Math.min(4, Math.max(1, parseInt(match[2], 10))) : 1;
    return {
      imageQuery: match[1].trim(),
      imageCount: count,
      text: text.replace(match[0], '').trim(),
    };
  }
  return { imageQuery: null, imageCount: 1, text };
}

/**
 * Strip [EMOTION:X] from the start of text and return { emotion, text }.
 * Falls back to legacy regex detection if no tag is present.
 */
function parseEmotion(text) {
  const match = text.match(EMOTION_TAG_RE);
  if (match) {
    return {
      emotion: match[1].toLowerCase(),
      text:    text.slice(match[0].length),
    };
  }

  // Legacy fallback (brittle regex) for responses that don't contain the tag
  if (/angry|frustrat|unacceptable|that's wrong|incorrect/i.test(text))  return { emotion: 'angry',     text };
  if (/sad|sorry|unfortunat|terrible|concern|worried/i.test(text))       return { emotion: 'sad',       text };
  if (/great|excellent|perfect|wonderful|happy|glad|love/i.test(text))   return { emotion: 'happy',     text };
  if (/surprised|wow|really\?|unexpected|interesting!/i.test(text))      return { emotion: 'surprised', text };
  if (/blush|embarrass|awkward/i.test(text))                             return { emotion: 'blushing',  text };
  return { emotion: null, text };
}

export const useChat = () => {
  const [messages, setMessages]       = useState([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [currentIntent, setCurrentIntent] = useState('general');
  const [imageQuery, setImageQuery]   = useState(null);
  const [imageCount, setImageCount]   = useState(1);

  // Ref so callbacks always see fresh messages without stale closures
  const messagesRef = useRef(messages);
  const setMessagesAndRef = (updater) => {
    setMessages(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      messagesRef.current = next;
      return next;
    });
  };

  /**
   * @param {string}   userMessage
   * @param {object}   persona
   * @param {Function} onAudioReceived        (audio|null, fullText, usedChunkedAudio) => void
   * @param {any}      _reserved              reserved, pass null
   * @param {Function} onEmotionDetected      (emotion: string) => void   (optional)
   * @param {Function} onAudioChunk           (seq, audio, sentence) => void  (optional, for chunked TTS)
   */
  const sendMessage = useCallback(async (
    userMessage,
    persona,
    onAudioReceived,
    _reserved = null,
    onEmotionDetected = null,
    onAudioChunk = null,
  ) => {
    if (!userMessage.trim()) return;

    const userMsg      = { id: Date.now(),     role: 'user',      content: userMessage, timestamp: new Date() };
    const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: '',          timestamp: new Date(), intent: 'general' };

    const historySnapshot = messagesRef.current;
    setMessagesAndRef(prev => [...prev, userMsg, assistantMsg]);
    setIsLoading(true);
    setImageQuery(null); // clear previous image on new message
    setImageCount(1);

    // Running buffer to detect the emotion tag which may span multiple chunks
    let chunkAccumulator  = '';
    let emotionParsed     = false;
    let emotionFromTag    = null;

    await apiService.sendMessage(
      userMessage,
      historySnapshot,
      persona,

      // onChunk — live text streaming
      (chunk, intent) => {
        setCurrentIntent(intent || 'general');

        if (!emotionParsed) {
          chunkAccumulator += chunk;
          const match = chunkAccumulator.match(EMOTION_TAG_RE);
          if (match) {
            emotionParsed  = true;
            emotionFromTag = match[1].toLowerCase();
            // Strip the tag from the accumulated buffer
            chunkAccumulator = chunkAccumulator.slice(match[0].length);

            // Fire emotion callback immediately
            if (typeof onEmotionDetected === 'function') {
              onEmotionDetected(emotionFromTag);
            }

            // Now flush the clean text into the message
            const cleanChunk = chunkAccumulator;
            setMessagesAndRef(prev => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last?.role === 'assistant') {
                last.content += cleanChunk;
                last.intent   = intent;
              }
              return next;
            });
          }
          // else: still accumulating — don't display yet (tag might be split across chunks)
          // But safety: if buffer is long enough without finding the tag, show it anyway
          else if (chunkAccumulator.length > 80) {
            emotionParsed = true; // give up waiting for tag
            const cleanChunk = chunkAccumulator;
            setMessagesAndRef(prev => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last?.role === 'assistant') {
                last.content += cleanChunk;
                last.intent   = intent;
              }
              return next;
            });
          }
        } else {
          // Normal streaming after tag is parsed
          setMessagesAndRef(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === 'assistant') {
              last.content += chunk;
              last.intent   = intent;
            }
            return next;
          });
        }
      },

      // onComplete
      (fullContent, intent, audio, usedChunkedAudio) => {
        setIsLoading(false);
        setCurrentIntent(intent || 'general');

        // Parse + strip emotion tag from the full response for final state
        const { emotion, text: cleanContent0 } = parseEmotion(fullContent);
        // Parse + strip image query tag
        const { imageQuery: detectedImageQuery, imageCount: detectedImageCount, text: cleanContent } = parseImageQuery(cleanContent0);

        if (detectedImageQuery) { setImageQuery(detectedImageQuery); setImageCount(detectedImageCount); }

        setMessagesAndRef(prev => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === 'assistant') {
            last.content = cleanContent;
            last.intent  = intent;
            last.audio   = audio;
          }
          return next;
        });

        // Notify caller with audio + full clean text
        if (onAudioReceived) onAudioReceived(audio, cleanContent, usedChunkedAudio);

        // Use tag emotion if we got one; otherwise use legacy detection
        const finalEmotion = emotionFromTag || emotion;
        if (finalEmotion && typeof onEmotionDetected === 'function') {
          onEmotionDetected(finalEmotion);
        }
      },

      // onError
      (error) => {
        console.error('Chat error:', error);
        setIsLoading(false);
        setMessagesAndRef(prev => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === 'assistant') {
            last.content = 'Sorry, I encountered an error. Please try again.';
            last.error   = true;
          }
          return next;
        });
      },

      // onAudioChunk — forward directly to caller (App.jsx will call enqueueChunk)
      onAudioChunk,
    );
  }, []);

  const clearMessages = useCallback(() => {
    setMessagesAndRef([]);
    setCurrentIntent('general');
    setImageQuery(null);
    setImageCount(1);
  }, []);

  const restoreMessages = useCallback((saved) => {
    setMessagesAndRef(saved);
  }, []);

  return { messages, isLoading, currentIntent, imageQuery, imageCount, sendMessage, clearMessages, restoreMessages };
};