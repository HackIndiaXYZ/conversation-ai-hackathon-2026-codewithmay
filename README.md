## Demo

> **Watch Proxa Echo in action**

[![Demo Video]](https://youtu.be/l-aC46OeKzs)

# Proxa Echo

**Realtime Conversational AI Avatar Platform**

*Healthcare & pharmaceutical roleplay simulation — voice-driven, expressive, browser-native.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js]](https://nodejs.org)
[![React]](https://reactjs.org)
[![Vite]](https://vitejs.dev)
[![Live2D]](https://www.live2d.com)
[![Docker]](docker-compose.yml)
[![HackIndia 2026]](https://hackindia.xyz)



## Overview

**Proxa Echo** is a browser-native, realtime conversational AI platform built for pharmaceutical sales training and healthcare professional (HCP) roleplay simulation. It pairs a streaming LLM backend with expressive Live2D avatar characters that lip-sync, emote, and respond dynamically to natural speech — no app install, no latency compromise.

A pharmaceutical sales rep can practice detailing medications to clinically accurate AI personas — a Pharmacist, Registered Nurse, Dietitian, or Psychologist — each with a distinct voice, personality, and clinical system prompt. The platform runs entirely in the browser on both desktop and mobile, and supports multiple LLM backends including local inference via Ollama.

---

## Demo

> **Watch Proxa Echo in action**

[![Demo Video]](https://your-demo-video-url-here)

<!-- TODO: Replace the link above with your final demo video URL before submission -->

---

## Documentation

| Document | Description |
|---|---|
| [Technical Approach](./docs/technical-approach.md) | Architecture decisions, design rationale, and engineering deep-dive |
| [Third-Party APIs & Licensing](./docs/third-party-apis.md) | All external services, SDKs, licences, and attribution |

---

## Features

### Realtime Conversational AI

- **Continuous voice input** via the browser-native Web Speech API with 600 ms silence detection for natural, human-like turn-taking — no push-to-talk required.
- **Token-streaming responses** delivered via Server-Sent Events (SSE) for instant on-screen rendering as the model generates.
- **Multi-turn memory** — the last 14 messages of conversation history are sent on every request, maintaining coherent clinical context throughout a session.
- **Intent routing** — lightweight keyword classification identifies `clinical`, `coding`, `conversational`, and `general` intents to modulate response behaviour.

### Expressive Avatar System

- **Live2D Cubism 4 rendering** — full WebGL-based avatars with physics simulation, eye-blink, and procedural idle motion.
- **Realtime lip sync** — Web Audio API amplitude data is mapped through a custom `AmplitudeProvider → CubismLipSyncUpdater` pipeline with asymmetric attack/release smoothing for natural mouth movement.
- **Emotion-driven expressions** — the LLM prefixes every response with `[EMOTION:X]`; the frontend parses the tag and triggers matching `.exp3.json` expressions: `happy`, `sad`, `angry`, `surprised`, `blushing`, `calm`, `analytical`, and more.
- **Dynamic motion pools** — speaking and idle motion sets are triggered by avatar state transitions.

### Text-to-Speech Pipeline

- **Google Cloud Neural2 TTS** (primary) — per-persona neural voices (`en-US-Neural2-F/C/E/H`) with configurable speaking rate; responses are synthesised sentence-by-sentence for minimal first-audio latency.
- **Web Speech API** (fallback) — fully client-side synthesis with zero backend dependency; activates automatically when no Google TTS key is configured.
- **Chunked, ordered audio delivery** — `audio_chunk` SSE events carry base64 MP3 segments keyed by sequence number; a client-side buffer guarantees correct playback order.

### Persona & Roleplay System

- **4 bundled clinical HCP personas:**

  | Persona | Role | Clinical Focus |
  |---|---|---|
  | Haru | Pharmacist | Drug mechanisms, bioavailability, formulary challenges |
  | Izumi | Registered Nurse | Patient safety, administration, side-effect monitoring |
  | Emma Rodriguez | Dietitian | Nutritional interactions, lifestyle, metabolic context |
  | Dr. Aiko Tanaka | Psychologist | Cognitive impact, dependency risk, mental health overlap |

- **Server-side persona override** — deploy custom personas for specific clients or therapeutic areas via `avatar.config.json` + `AVATAR_CONFIG_PATH`. Supports configurable `dialogueBehavior`: `concise`, `detailed`, `socratic`, `empathetic`, `formal`, or `casual`.

### Visual Intelligence

- **Contextual image injection** — when a visual aid is clinically relevant, the LLM embeds `[IMAGE_QUERY:terms|N]` tags. The backend fetches real images via SerpApi (Google Images) and falls back to deterministic Picsum placeholders.
- **Overlay image panel** — retrieved images (1–4, LLM-determined) render in a dedicated overlay alongside the active avatar.

### UI & Interaction Modes

- **Split-screen layout** — avatar panel and chat panel displayed side by side on desktop.
- **Full-screen avatar mode** — chat panel collapses; conversation renders as an overlaid subtitle strip.
- **Mobile-responsive** — `useIsMobile()` hook drives layout switching at the 768 px breakpoint; the subtitle strip replaces the persona card and transcript on narrow viewports. Tested on Chrome (Android) and Safari (iOS).
- **Settings panel** — voice selection, TTS provider toggle, speech recognition language, and provider health check.
- **Avatar transform panel** — pan, zoom, and reposition the avatar canvas at runtime.

---

## Architecture

Proxa Echo follows a clean client–server split with a stateless Express backend and a rich React/WebGL frontend. All conversation state lives in the browser; each request includes full history, making the backend trivially horizontally scalable.

```
┌─────────────────────────────────────────────────────────┐
│                        BROWSER                          │
│                                                         │
│  User Speech                                            │
│      ↓                                                  │
│  Web Speech API  (continuous, 600 ms silence timer)     │
│      ↓                                                  │
│  useChat.sendMessage()  ──────── POST /api/chat ──────► │
│                                                         │
│  ◄── chunk events       (text tokens, SSE)              │
│  ◄── audio_chunk events (base64 MP3, sequence id)       │
│  ◄── complete event                                     │
│      ↓                                                  │
│  Emotion parser   →  Live2DManager.setEmotion()         │
│  Image parser     →  ImageOverlay.jsx                   │
│  Audio queue      →  Web Audio API amplitude analysis   │
│      ↓                                                  │
│  AmplitudeProvider  →  CubismLipSyncUpdater             │
│      ↓                                                  │
│  Live2D Cubism WebGL Canvas                             │
│  (physics · eye-blink · motion · expression)            │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   EXPRESS BACKEND                       │
│                                                         │
│  POST /api/chat  (SSE)                                  │
│      ↓                                                  │
│  resolveSystemPrompt()  (request > server config)       │
│      ↓                                                  │
│  LLMService.generateResponse()                          │
│  ├── Ollama          local · NDJSON streaming           │
│  ├── Anthropic Claude    SSE · content_block_delta      │
│  └── OpenAI GPT-4        SSE · choices[0].delta        │
│      ↓                                                  │
│  Sentence splitter  →  TTSService.generateSpeech()      │
│  ├── Google Cloud Neural2  TTS                          │
│  └── null  (browser Web Speech API fallback)            │
│      ↓                                                  │
│  ImageService.search()  (SerpApi / Picsum fallback)     │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend framework** | React 18, Vite 5, TypeScript (Live2D layer), Lucide React |
| **Styling** | Tailwind CSS 3, PostCSS, custom CSS animations |
| **Avatar rendering** | Live2D Cubism SDK 4 (WebGL) — `.moc3`, `.model3.json`, `.exp3.json`, `.motion3.json` |
| **Lip sync** | Custom `AmplitudeProvider → CubismLipSyncUpdater`, Web Audio API analyser node |
| **Speech input** | Web Speech API — `webkitSpeechRecognition`, continuous mode |
| **Text-to-speech** | Google Cloud Neural2 TTS (primary) · Web Speech API (fallback) |
| **Backend** | Node.js 18, Express 4 (ESM), `node --watch` dev server |
| **LLM providers** | Ollama (local) · Anthropic Claude API · OpenAI GPT-4 API |
| **Streaming transport** | Server-Sent Events — `text/event-stream` |
| **Image search** | SerpApi Google Images engine · Picsum fallback |
| **Containerisation** | Docker · Docker Compose 3.9 |

---

## Project Structure

```
proxa-echo/
├── avatar.config.json           # Server-side persona override template
├── docker-compose.yml           # Multi-service Docker orchestration
│
├── backend/
│   ├── Dockerfile               # Node 18 Alpine image
│   ├── .env.example             # Environment variable reference
│   └── src/
│       ├── server.js            # Express app, CORS, middleware
│       ├── routes/
│       │   └── chat.js          # POST /api/chat · GET /api/health · GET /api/images
│       └── services/
│           ├── llmService.js    # Ollama / Anthropic / OpenAI provider abstraction
│           ├── ttsService.js    # Google Neural2 TTS, per-persona voice config
│           ├── imageService.js  # SerpApi + Picsum fallback
│           └── apiService.js    # Shared HTTP helpers
│
└── frontend/
    ├── public/
    │   ├── live2dcubismcore.min.js   # Live2D Cubism Core (WebAssembly)
    │   ├── personas.json             # HCP persona definitions
    │   ├── Shaders/                  # Live2D WebGL GLSL shaders
    │   └── models/
    │       ├── haru/                 # Pharmacist — expressions, motions, textures
    │       ├── haru_greeter/         # Psychologist — expressions, motions, textures
    │       └── izumi/                # Nurse — expressions, motions, textures
    └── src/
        ├── App.jsx                   # Root layout, mobile detection, mode switching
        ├── components/
        │   ├── Avatar/
        │   │   ├── AvatarCanvas.jsx        # React ↔ Live2D bridge, WebGL mount
        │   │   ├── AvatarBackground.jsx    # Scene backgrounds (pharmacy / hospital / clinic)
        │   │   ├── AvatarTransformPanel.jsx
        │   │   ├── ImageOverlay.jsx        # Contextual image display
        │   │   └── VoiceOrb.jsx            # Mic button, amplitude visualiser
        │   ├── Chat/
        │   │   ├── ChatPanel.jsx     # Chat UI, mode toggle, persona display
        │   │   ├── MessageList.jsx   # Scrollable history with emotion badges
        │   │   └── InputBox.jsx
        │   └── UI/
        │       ├── PersonaSelector.jsx
        │       ├── SettingsPanel.jsx
        │       └── MediaView.jsx     # Camera / screen-share overlay
        ├── hooks/
        │   ├── useChat.js              # SSE streaming, emotion/image tag parsing
        │   ├── useTextToSpeech.js      # Google TTS audio queue, amplitude
        │   ├── useSpeechRecognition.js # Continuous STT, silence timer
        │   ├── usePersona.js           # Persona state, system prompt resolution
        │   └── useAvatarTransform.js
        └── live2d/
            ├── AmplitudeProvider.ts    # Web Audio → Cubism lip sync bridge
            └── framework/              # Cubism TypeScript framework layer
                ├── cubismdefaultparameterid.ts
                ├── cubismmodelsettingjson.ts
                └── effect/
                    ├── cubismbreath.ts
                    ├── cubismeyeblink.ts
                    ├── cubismlook.ts
                    └── cubismpose.ts
```

---

## Setup

### Prerequisites

- **Node.js 18+** and **npm 9+**
- (Optional) [Ollama](https://ollama.ai) for local, fully offline LLM inference
- (Optional) Anthropic or OpenAI API key for cloud LLM providers
- (Optional) Google Cloud TTS API key for Neural2 voices

### 1. Clone

```bash
git clone https://github.com/your-org/proxa-echo.git
cd proxa-echo
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Set LLM_PROVIDER and any API keys in .env
npm install
```

```bash
# Development (hot-reload)
npm run dev
# → http://localhost:3001

# Production
npm start
```

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
# → http://localhost:5173
```

### 4. Local LLM via Ollama (optional)

For a fully offline pipeline — no API keys required:

```bash
# Install Ollama: https://ollama.ai/download
ollama pull llama3

# backend/.env
LLM_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

### 5. Docker Compose (full stack)

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your keys

docker compose up --build
# Backend → http://localhost:3001
# Frontend → http://localhost:5173
```

---

## Environment Variables

All keys are optional except those required by the selected `LLM_PROVIDER`.

```env
# ─── LLM Provider ──────────────────────────────────────────────────────────────
# Choose ONE: ollama | anthropic | openai
LLM_PROVIDER=ollama

# ─── Ollama (local, no API key required) ───────────────────────────────────────
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# ─── Anthropic Claude ──────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
# Supported: claude-opus-4-20250514 | claude-sonnet-4-20250514 | claude-haiku-4-5-20251001

# ─── OpenAI GPT-4 ──────────────────────────────────────────────────────────────
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
# Supported: gpt-4o | gpt-4-turbo | gpt-4o-mini

# ─── Google Cloud Text-to-Speech ───────────────────────────────────────────────
# Omit to automatically fall back to the browser Web Speech API
GOOGLE_TTS_API_KEY=your_google_tts_api_key_here

# ─── SerpApi (Google Images) ───────────────────────────────────────────────────
# Omit to fall back to deterministic Picsum placeholders
SERPAPI_KEY=your_serpapi_key_here

# ─── Server ────────────────────────────────────────────────────────────────────
PORT=3001

# ─── Avatar Persona Config (optional server-side override) ─────────────────────
# AVATAR_CONFIG_PATH=./avatar.config.json
```

---

## LLM Provider Support

Switch providers by setting `LLM_PROVIDER` in `.env` — no code changes required.

| Provider | Streaming | Details |
|---|---|---|
| **Ollama** | NDJSON stream | Local inference · no API key · GPU-accelerated |
| **Anthropic Claude** | SSE `content_block_delta` | Requires `ANTHROPIC_API_KEY` |
| **OpenAI GPT-4** | SSE `choices[0].delta` | Requires `OPENAI_API_KEY` |

All providers receive an identical system prompt (persona definition + emotion tag instruction + image query instruction) and return streamed chunks to the same `onChunk` callback. Adding a new provider requires implementing one streaming method following the existing interface.

---

## Usage

1. Open `http://localhost:5173` in **Chrome, Edge, or any Chromium-based browser**.
2. Select an HCP persona from the **Persona Selector** — each card shows the character's name, role, specialty, and personality profile.
3. Click the **microphone orb** to begin listening, or type directly in the chat input.
4. Speak naturally. The platform waits 600 ms after your last word before sending.
5. The avatar responds in realtime: text streams on-screen, the avatar lip-syncs and emotes, and TTS audio plays back as it is generated sentence-by-sentence.

**Layout modes** — use the toggle in the Chat Panel header:
- **Split screen** — avatar on the left, chat history on the right.
- **Full-screen avatar** — chat minimises; conversation subtitles appear as an overlay strip.

**Custom personas** — deploy with a client-specific HCP persona by configuring `avatar.config.json`:

```json
{
  "name": "Dr. Maya",
  "role": "Cardiology Consultant",
  "traits": "direct, evidence-based, empathetic",
  "dialogueBehavior": "concise",
  "systemPrompt": "You are Dr. Maya, a Cardiology Consultant with 20 years of clinical experience..."
}
```

Then set `AVATAR_CONFIG_PATH=./avatar.config.json` in your backend environment.

---

## Deployment

The backend is fully stateless — each `/api/chat` request includes the complete conversation history from the client. No session management, no persistent storage. This design enables:

- **Horizontal scaling** behind any load balancer
- **Zero-config deployment** to Railway, Fly.io, Render, AWS ECS, or GCP Cloud Run
- **Instant rollback** — no state migration required

For high-concurrency production deployments, add a reverse proxy (nginx) and scale backend replicas independently of the frontend static build.

---

## Known Limitations

- **Live2D model licences** — Bundled Haru, Haru Greeter, and Izumi models are sample assets from Live2D Inc. and are subject to the [Live2D Free Material License Agreement](https://www.live2d.com/en/terms/live2d-free-material-license-agreement/). They are provided for development and demo purposes only; commercial distribution requires a separate licence.
- **Speech recognition browser support** — `webkitSpeechRecognition` requires Chrome, Edge, or Chromium-based browsers. Firefox and some iOS Safari versions do not support the Continuous Speech Recognition API.
- **Google TTS latency** — Cloud TTS adds ~200–600 ms per sentence round-trip. The Web Speech API fallback is synchronous but produces lower-fidelity voice output.
- **Ollama hardware requirements** — Large local models (70B+) require substantial GPU VRAM. Default settings in `.env.example` assume a capable local setup.
- **Image search fallback** — Without a `SERPAPI_KEY`, image queries return Picsum stock photos, which are not medically relevant. Configure SerpApi for production clinical training use.

---

## Roadmap

- [ ] Persistent session history and conversation export
- [ ] Additional bundled HCP personas and clinical domains
- [ ] WebRTC-based audio streaming to reduce TTS latency
- [ ] LMS / SCORM integration for enterprise training platforms
- [ ] Custom avatar import (`.model3.json` upload)
- [ ] Analytics dashboard for sales training performance metrics

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for full terms.

> **Asset licence note:** Live2D model assets in `frontend/public/models/` are governed by the [Live2D Free Material License Agreement](https://www.live2d.com/en/terms/live2d-free-material-license-agreement/) and are not covered by the MIT licence above.

---



Built by **Team CodeWithMay**

*HackIndia Conversation AI Hackathon 2026*

**Proxa Echo** — *Where AI meets the clinic.*

