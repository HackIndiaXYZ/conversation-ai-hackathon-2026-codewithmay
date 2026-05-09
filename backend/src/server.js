import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', chatRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Avatar Assistant API',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat',
      health: 'GET /api/health'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  const provider = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();
  const modelMap  = {
    anthropic: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    openai:    process.env.OPENAI_MODEL    || 'gpt-4o',
    ollama:    process.env.OLLAMA_MODEL    || 'llama3',
  };
  const model = modelMap[provider] || modelMap.ollama;
  console.log(`
╔════════════════════════════════════════════╗
║   AI Avatar Assistant - Backend Server    ║
╠════════════════════════════════════════════╣
║  Status:  Running                          ║
║  Port:    ${PORT}                              ║
║  Provider: ${provider}
║  Model:   ${model}
╚════════════════════════════════════════════╝
  `);
});

export default app;
