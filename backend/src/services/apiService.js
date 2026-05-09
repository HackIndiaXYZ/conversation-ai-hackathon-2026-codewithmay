const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  async sendMessage(message, history, persona, onChunk, onComplete, onError) {
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
            if (data.type === 'chunk'    && onChunk)    onChunk(data.content, data.intent);
            if (data.type === 'complete' && onComplete)  onComplete(data.content, data.intent, data.audio);
            if (data.type === 'error'    && onError)     onError(new Error(data.message));
          } catch (_) {}
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
    } catch { return { status: 'error' }; }
  }
}

export default new ApiService();
