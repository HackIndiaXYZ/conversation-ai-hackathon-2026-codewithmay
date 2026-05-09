# Proxa Echo — Technical Document

## 1. Architecture Overview

Proxa Echo is split into a stateless Express backend and a React/Vite frontend. They communicate exclusively over a single long-lived HTTP connection per turn, using Server-Sent Events (SSE).

### Frontend/Backend Separation

The backend owns two concerns: generating LLM responses and synthesising speech. It has no session state — every request is self-contained and carries the conversation history in the POST body (up to the last 14 turns). The frontend owns rendering, audio playback, emotion animation, and speech recognition.

### Live2D WebGL Pipeline

The avatar is rendered inside a raw WebGL2 `<canvas>` element managed by the Cubism SDK TypeScript framework (bundled in `src/live2d/`). On mount, `AvatarCanvas.jsx` creates a canvas, instantiates `LAppDelegate`, loads the `.model3.json` descriptor, and starts a `requestAnimationFrame` render loop. The loop updates physics, drives mouth opening from `audioAmplitude`, and plays idle/reaction motions.

`Live2DManager.ts` is the single public interface:
- `setEmotion(name)` — maps an emotion name to an `.exp3.json` expression and triggers a motion from the matching group
- `setLipSync(amplitude)` — drives the `ParamMouthOpenY` parameter directly each frame

### LLM → TTS → Avatar Data Flow

```
User types / speaks
        │
        ▼
POST /api/chat  (message + history + voiceType)
        │
        ├─ llmService.generateResponse()  ←── Ollama /api/chat (streaming)
        │      Each Ollama chunk:
        │        1. res.write({ type:'chunk', content })     ← live text display
        │        2. appended to sentenceBuffer
        │        3. if sentence boundary detected:
        │             ttsService.generateSpeech(sentence)   ← async, non-blocking
        │               └─ res.write({ type:'audio_chunk', seq, audio })
        │
        └─ after LLM done + all TTS settled:
             res.write({ type:'complete', content, audio:null, usedChunkedAudio:true })

Frontend SSE reader (apiService.js):
  'chunk'       → useChat appends to message bubble (live streaming text)
  'audio_chunk' → enqueueChunk(seq, audio) in useTextToSpeech
  'complete'    → finaliseQueue() → plays last chunk / falls back to Web Speech API
                  useChat strips [EMOTION:X] tag, calls onEmotionDetected
                  Live2DManager.setEmotion() → expression + motion
```

---

## 2. Key Design Decisions

### Raw WebGL2 over PIXI.js

PIXI.js wraps WebGL with its own renderer and batch pipeline. The Cubism SDK requires direct control over framebuffer binding (for mask rendering), shader program state, and the clipping manager. Inserting the SDK's renderer into PIXI's render graph requires extensive monkey-patching and breaks whenever PIXI flushes its batch at an unexpected time. Raw WebGL2 gives the SDK full control and eliminates that class of bugs entirely.

### Live2D Cubism SDK over Alternatives

VTube Studio and similar tools run as separate processes and expose a WebSocket API — they add a mandatory install step for end-users and a cross-process latency floor. Unity-based Live2D requires a WebGL build (large download, slower startup). The Cubism Web SDK compiles directly to the browser, ships as TypeScript source, and exposes the full expression/motion/physics API that the emotion system relies on. The tradeoff is a ~700 KB framework bundle and a manual render loop, both acceptable for a demo app.

### Google Neural2 TTS over alternatives

Google Neural2 voices score highest on naturalness in the en-US female range and provide `speakingRate` and `pitch` controls via JSON without needing SSML. The API returns base64 MP3 in a single JSON response, making it easy to forward over SSE. Eleven Labs would be higher quality but adds per-character billing complexity. Amazon Polly Neural is comparable but the AWS SDK adds dependency weight. Critically, the entire TTS step is optional: when `GOOGLE_TTS_API_KEY` is absent, the frontend falls back to `window.speechSynthesis` with zero code changes required.

### SSE over WebSockets

WebSockets require a full duplex channel and stateful connection management. For this app the communication pattern is strictly request/response — the client sends one message and the server streams back one response. SSE fits this pattern exactly: it reuses HTTP/1.1, requires no upgrade handshake, and is natively handled by the browser's Fetch API with `ReadableStream`. There is no need to implement reconnection logic for client→server messages (those remain simple POST requests).

---

## 3. Avatar Emotion System

### 15 Emotions → Cubism Parameters

`Live2DManager.ts` maps each emotion name to two things: an expression file and a motion group.

| Emotion      | Expression file        | Motion group  | Key Cubism params changed          |
|--------------|------------------------|---------------|------------------------------------|
| neutral      | Normal.exp3.json       | idle          | All at default                     |
| happy        | Smile.exp3.json        | haru_m_01–03  | ParamEyeLSmile, ParamEyeRSmile     |
| sad          | Sad.exp3.json          | haru_normal   | ParamBrowLY, ParamBrowRY (down)    |
| angry        | Angry.exp3.json        | haru_m_07–08  | ParamBrowLAngle, ParamEyeBallX     |
| surprised    | Surprised.exp3.json    | haru_m_04     | ParamEyeLOpen, ParamEyeROpen (max) |
| blushing     | Blushing.exp3.json     | haru_normal   | ParamCheek                         |
| curious      | f01.exp3.json          | haru_m_05     | ParamBrowLY (asymmetric tilt)      |
| thinking     | f02.exp3.json          | haru_m_06     | ParamBrowLAngle, ParamBodyAngleX   |
| concerned    | Sad.exp3.json          | haru_normal   | ParamBrowLY, ParamMouthForm        |
| analytical   | f02.exp3.json          | haru_m_09–10  | ParamEyeBallX (slight look-away)   |
| engaged      | Smile.exp3.json        | haru_m_01     | ParamEyeLSmile (soft)              |
| calm         | Normal.exp3.json       | haru_idle_02  | All near default, slow physics     |
| excited      | Smile.exp3.json        | haru_m_02–03  | ParamEyeLSmile + body sway         |
| proud        | Smile.exp3.json        | haru_m_01     | ParamBodyAngleX (upright)          |
| embarrassed  | Blushing.exp3.json     | haru_normal   | ParamCheek + ParamEyeLOpen (down)  |

### Emotion Detection Flow

The backend injects this instruction at the top of every system prompt:

> "Begin every response with an emotion tag in this exact format: `[EMOTION:X]` where X is one of: neutral, happy, sad, angry, surprised, curious, thinking, concerned, analytical, engaged, calm, excited, proud, blushing, embarrassed."

`useChat.js` accumulates SSE chunks until the regex `/^\[EMOTION:([a-z]+)\]/i` matches. Once matched, the tag is stripped from the display text and `onEmotionDetected(emotion)` is called immediately — so the avatar changes expression before the full response has finished arriving. After 5 seconds, `App.jsx` resets the emotion to the persona's default mood.

---

## 4. Known Limitations

**Ollama dependency.** The app requires a locally running Ollama instance. There is no built-in fallback to a cloud LLM if Ollama is unreachable; the SSE stream will error and display "Sorry, I encountered an error." A Claude API migration path is noted in the roadmap below.

**Web Speech API mobile gap.** `SpeechRecognition` is not available in Firefox (desktop or mobile) and has inconsistent behaviour on iOS Safari. Users on those browsers see a yellow warning banner and cannot use the mic button. Text input always works.

**Amplitude-only lip sync.** Mouth opening is driven by a single `audioAmplitude` value computed from RMS of the Web Audio buffer (or a sine simulation for Web Speech API). This produces natural-looking movement but does not match actual phoneme shapes. The result is convincing for a demo but not production-quality.

**Emotion tag position.** If the LLM occasionally fails to place the `[EMOTION:X]` tag at the very start (e.g., after a newline or reasoning token), the fallback regex detection runs instead. The fallback has lower accuracy, particularly for nuanced emotions like `curious` or `analytical`.

---

## 5. Future Roadmap

**Phoneme-accurate lip sync.** Replace amplitude-based mouth control with Rhubarb Lip Sync (WASM build) or Azure Viseme events. Feed phoneme timing data alongside the audio stream so Cubism parameters match actual phoneme shapes frame-by-frame.

**Claude API migration.** Replace the Ollama dependency with Anthropic's `claude-sonnet-4-20250514` via the Messages API. The streaming interface maps cleanly onto the existing `onChunk` callback pattern; the main change is request format and model-specific prompt tuning for the emotion tag instruction.

**Mobile STT fallback.** Integrate Azure Cognitive Services Speech SDK or Deepgram as a server-side STT fallback for browsers where `SpeechRecognition` is absent. Audio from `getUserMedia` would be streamed to the backend via WebSocket and transcribed there.

**Multi-language support.** Google Neural2 supports 30+ languages. The system prompt, emotion instruction, and STT `lang` setting would need to be driven by a user-selected locale. Live2D lip sync is language-agnostic so no changes are needed there.

**Session recording and playback.** Store the SSE event log (text + audio chunk sequence) per session to enable scenario replay for training review.
