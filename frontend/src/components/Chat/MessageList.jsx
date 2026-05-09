import React, { useEffect, useRef } from 'react';
import { User, Bot, Code, BookOpen, Sparkles } from 'lucide-react';

/**
 * Message List Component
 * Displays chat messages
 */
const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getIntentIcon = (intent) => {
    switch (intent) {
      case 'coding':
        return <Code className="w-4 h-4" />;
      case 'learning':
        return <BookOpen className="w-4 h-4" />;
      case 'conversational':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getIntentColor = (intent) => {
    switch (intent) {
      case 'coding':
        return 'text-green-400';
      case 'learning':
        return 'text-blue-400';
      case 'conversational':
        return 'text-purple-400';
      default:
        return 'text-primary-400';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <Bot className="w-16 h-16 mx-auto mb-4 text-primary-500" />
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm mt-2">Ask me anything or use voice input</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {/* Message header for assistant */}
              {message.role === 'assistant' && message.intent && (
                <div className={`flex items-center gap-2 mb-2 text-xs ${getIntentColor(message.intent)}`}>
                  {getIntentIcon(message.intent)}
                  <span className="capitalize">{message.intent} Mode</span>
                </div>
              )}

              {/* Message content */}
              <div className="whitespace-pre-wrap break-words">
                {message.content || (
                  <span className="text-gray-400 italic">Thinking...</span>
                )}
              </div>

              {/* Timestamp */}
              <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-primary-200' : 'text-gray-500'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>

              {/* Error indicator */}
              {message.error && (
                <div className="text-red-400 text-xs mt-2">
                  ⚠ Failed to send
                </div>
              )}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
