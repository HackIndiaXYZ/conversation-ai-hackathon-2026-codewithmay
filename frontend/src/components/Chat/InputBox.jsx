import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

/**
 * Input Box Component
 * Handles text and voice input
 */
const InputBox = ({ 
  onSendMessage, 
  isLoading, 
  isListening, 
  onStartListening, 
  onStopListening,
  transcript 
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
      <div className="flex items-end gap-3">
        {/* Voice input button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          disabled={isLoading}
          className={`flex-shrink-0 p-3 rounded-xl transition-all ${
            isListening
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? 'Listening...' : 'Type your message or use voice input...'}
            disabled={isLoading || isListening}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 placeholder-gray-500"
            rows="1"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          
          {isListening && (
            <div className="absolute bottom-2 right-2">
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-red-500 animate-pulse" style={{ animationDelay: '0s' }} />
                <div className="w-1 h-4 bg-red-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-4 bg-red-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading || isListening}
          className="flex-shrink-0 p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-3 flex items-center gap-2 text-gray-400 text-sm">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <span>AI is thinking...</span>
        </div>
      )}
    </form>
  );
};

export default InputBox;
