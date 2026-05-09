import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import llmService from '../services/llmService.js';
import ttsService from '../services/ttsService.js';
import imageService from '../services/imageService.js';

// ─── Load optional server-side avatar config ──────────────────────────────────
// Reads AVATAR_CONFIG_PATH from env (or ./avatar.config.json if it exists).
// Fields: name, role, traits, dialogueBehavior, systemPrompt
function loadAvatarConfig() {
  const configPath = process.env.AVATAR_CONFIG_PATH
    || path.resolve(process.cwd(), '../avatar.config.json');
  try {
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      const cfg = JSON.parse(raw);
      console.log(`[AvatarConfig] Loaded from ${configPath}`);
      return cfg;
    }
  } catch (err) {
    console.warn(`[AvatarConfig] Failed to load config: ${err.message}`);
  }
  return null;
}

const SERVER_AVATAR_CONFIG = loadAvatarConfig();

/**
 * Merge server-side avatar config with a request-level systemPrompt.
 * Priority: request systemPrompt > server config systemPrompt > server config fields
 */
function resolveSystemPrompt(requestSystemPrompt) {
  // If the request carries its own fully-formed system prompt, use it as-is.
  if (requestSystemPrompt?.trim()) return requestSystemPrompt.trim();

  if (!SERVER_AVATAR_CONFIG) return '';

  // Full server-level system prompt
  if (SERVER_AVATAR_CONFIG.systemPrompt?.trim()) {
    return SERVER_AVATAR_CONFIG.systemPrompt.trim();
  }

  // Build from individual fields
  const parts = [];
  if (SERVER_AVATAR_CONFIG.name)    parts.push(`Your name is ${SERVER_AVATAR_CONFIG.name}.`);
  if (SERVER_AVATAR_CONFIG.role)    parts.push(`Your role is: ${SERVER_AVATAR_CONFIG.role}.`);
  if (SERVER_AVATAR_CONFIG.traits)  parts.push(`Your personality traits are: ${SERVER_AVATAR_CONFIG.traits}.`);

  const behaviorMap = {
    concise:    'Keep every reply to 2 sentences or fewer.',
    detailed:   'Give thorough, well-structured explanations.',
    socratic:   'Reply primarily with guiding questions.',
    empathetic: "Always acknowledge the user's feelings before responding to the content.",
    formal:     'Use formal language and avoid contractions.',
    casual:     'Speak in a relaxed, friendly, conversational tone.',
  };
  if (SERVER_AVATAR_CONFIG.dialogueBehavior) {
    const rule = behaviorMap[SERVER_AVATAR_CONFIG.dialogueBehavior];
    if (rule) parts.push(rule);
  }

  return parts.join(' ');
}

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], systemPrompt, voiceType = 'friendly' } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const resolvedSystemPrompt = resolveSystemPrompt(systemPrompt);

    const intent = llmService.detectIntent(message);
    const messages = [
      ...history.slice(-14),
      { role: 'user', content: message }
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Check if Google TTS key is present and not the default placeholder value.
    // If absent/placeholder, gracefully skip and let the frontend use Web Speech API.
    const rawTTSKey = (process.env.GOOGLE_TTS_API_KEY || '').trim();
    const hasTTSKey = !!(rawTTSKey && rawTTSKey !== 'your_google_tts_api_key_here');

    let fullResponse = '';
    let sentenceBuffer = '';
    let audioSeq = 0;
    const ttsPromises = [];

    /**
     * Fire a TTS request for one sentence and stream audio_chunk back to client.
     * Errors are logged but NEVER propagate — the SSE stream must not crash.
     */
    const flushSentence = (sentence) => {
      if (!sentence.trim() || sentence.trim().length < 4) return;
      if (!hasTTSKey) return; // no key → skip; frontend falls back to Web Speech API

      const seq = audioSeq++;
      const promise = (async () => {
        try {
          const audio = await ttsService.generateSpeech(sentence.trim(), voiceType);
          if (audio && audio.audioData) {
            res.write(`data: ${JSON.stringify({
              type: 'audio_chunk',
              seq,
              sentence: sentence.trim(),
              audio,
            })}\n\n`);
          }
        } catch (err) {
          console.error(`[TTS] audio_chunk seq=${seq} failed:`, err.message);
          // Do NOT rethrow — other chunks and the 'complete' event must still fire
        }
      })();
      ttsPromises.push(promise);
    };

    await llmService.generateResponse(
      messages,
      (chunk) => {
        fullResponse += chunk;
        sentenceBuffer += chunk;

        // Always stream text chunk for live display
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk, intent })}\n\n`);

        // Split on sentence boundaries: .!? optionally followed by closing quote/paren, then whitespace
        const parts = sentenceBuffer.split(/(?<=[.!?][)'"»]?)\s+/);
        if (parts.length > 1) {
          for (let i = 0; i < parts.length - 1; i++) {
            flushSentence(parts[i]);
          }
          sentenceBuffer = parts[parts.length - 1];
        }
      },
      resolvedSystemPrompt
    );

    // Flush remainder (sentence without trailing punctuation)
    flushSentence(sentenceBuffer);

    // Wait for all in-flight TTS requests before sending 'complete'
    await Promise.allSettled(ttsPromises);

    // 'complete' sends NO audio payload — audio already sent as audio_chunk events
    // If hasTTSKey is false, frontend will use Web Speech API on the fullResponse text
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      content: fullResponse,
      intent,
      audio: null,            // always null now — audio streamed via audio_chunk
      usedChunkedAudio: hasTTSKey,
    })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat route error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    res.end();
  }
});

router.get('/health', (req, res) => {
  const hasTTSKey = !!(process.env.GOOGLE_TTS_API_KEY && process.env.GOOGLE_TTS_API_KEY.trim());
  const { provider, model } = llmService.providerInfo();
  res.json({
    status: 'ok',
    provider,
    model,
    tts: hasTTSKey ? 'google-neural2' : 'browser-fallback',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/images?q=paracetamol+tablet&num=2
 *
 * Scrapes Google Images server-side — no API key needed.
 * Returns: { images: [ { thumbnail } ] }
 */
router.get('/images', async (req, res) => {
  try {
    const { q, num = '1' } = req.query;
    if (!q) return res.status(400).json({ error: 'q param required' });

    const count = Math.min(4, Math.max(1, parseInt(num, 10) || 1));
    const thumbnails = await imageService.search(q, count);

    res.json({ images: thumbnails.map(thumbnail => ({ thumbnail })) });
  } catch (err) {
    console.error('[Images route] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
