const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  /**
   * sendMessage — streams SSE from the backend.
   *
   * Callbacks:
   *   onChunk(content, intent)           — text chunk (for live display)
   *   onComplete(content, intent, audio) — final event; audio is null when chunked TTS was used
   *   onError(error)                     — error event
   *   onAudioChunk(seq, audio, sentence) — NEW: individual TTS audio chunk with sequence number
   */
  async sendMessage(message, history, persona, onChunk, onComplete, onError, onAudioChunk) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: history.map(m => ({ role: m.role, content: m.content })),
          systemPrompt: persona?.systemPrompt || null,
          voiceType:    persona?.voice || 'friendly',
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'chunk'       && onChunk)       onChunk(data.content, data.intent);
            if (data.type === 'audio_chunk' && onAudioChunk)  onAudioChunk(data.seq, data.audio, data.sentence);
            if (data.type === 'complete'    && onComplete)     onComplete(data.content, data.intent, data.audio, data.usedChunkedAudio);
            if (data.type === 'error'       && onError)        onError(new Error(data.message));
          } catch (_) {
            // Malformed SSE line — ignore silently
          }
        }
      }
    } catch (error) {
      console.error('API Error:', error);
      if (onError) onError(error);
    }
  }

  async checkHealth() {
    try {
      return await (await fetch(`${API_BASE_URL}/health`)).json();
    } catch {
      return { status: 'error' };
    }
  }
}

export default new ApiService();
