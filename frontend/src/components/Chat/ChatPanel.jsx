import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Send, Mic, MicOff, Trash2, User, ChevronDown, MessageCircle } from 'lucide-react';

const PEEK   = 72;
const HALF   = 0.46;
const FULL   = 0.86;

/* ── Shared: avatar icon ───────────────────────────────────── */
const AvatarIcon = ({ emoji, size = 28 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6d28d9 0%, #0891b2 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.5, flexShrink: 0,
    boxShadow: '0 2px 10px rgba(109,40,217,0.4)',
  }}>
    {emoji || '🤖'}
  </div>
);

/* ── Shared: typing dots ───────────────────────────────────── */
const TypingDots = () => (
  <div style={{
    display: 'flex', gap: 4, padding: '10px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px 14px 14px 4px',
    alignItems: 'center',
  }}>
    {[0,1,2].map(i => (
      <span key={i}
        className="animate-bounce"
        style={{
          width: 5, height: 5, borderRadius: '50%',
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          animationDelay: `${i * 0.15}s`,
          display: 'block',
        }}
      />
    ))}
  </div>
);

/* ── Shared: message list ──────────────────────────────────── */
const MessageList = ({ messages, isLoading, persona, bottomRef }) => (
  <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
    {messages.length === 0 && (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, textAlign: 'center', padding: '24px 16px' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(6,182,212,0.12) 100%)',
          border: '1px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          {persona?.emoji || '💬'}
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>
          Start chatting with {persona?.name?.split(' ')[0] || 'the avatar'}
        </p>
        {persona?.personality && (
          <p style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic', maxWidth: 200, lineHeight: 1.5 }}>
            "{persona.personality}"
          </p>
        )}
      </div>
    )}

    {messages.map(msg => (
      <div
        key={msg.id}
        className="msg-bubble"
        style={{ display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
      >
        {msg.role === 'assistant' && (
          <AvatarIcon emoji={persona?.emoji} size={26} />
        )}

        <div
          style={{
            maxWidth: '78%',
            padding: '9px 13px',
            fontSize: 13,
            lineHeight: 1.55,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: msg.error ? '#fca5a5' : '#f3f4f6',
            ...(msg.role === 'user'
              ? {
                  background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)',
                  borderRadius: '14px 14px 4px 14px',
                  boxShadow: '0 2px 12px rgba(109,40,217,0.3)',
                }
              : msg.error
              ? {
                  background: 'rgba(220,38,38,0.12)',
                  border: '1px solid rgba(220,38,38,0.25)',
                  borderRadius: '14px 14px 14px 4px',
                }
              : {
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px 14px 14px 4px',
                }
            ),
          }}
        >
          {msg.content}
        </div>

        {msg.role === 'user' && (
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <User style={{ width: 13, height: 13, color: '#9ca3af' }} />
          </div>
        )}
      </div>
    ))}

    {isLoading && (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}>
        <AvatarIcon emoji={persona?.emoji} size={26} />
        <TypingDots />
      </div>
    )}
    <div ref={bottomRef} />
  </div>
);

/* ── Shared: input bar ─────────────────────────────────────── */
const InputBar = ({ input, onInput, onKey, onSend, isLoading, isListening, onStartListening, onStopListening, textareaRef }) => (
  <div style={{
    padding: '10px 12px',
    borderTop: '1px solid rgba(124,58,237,0.1)',
    background: 'rgba(6,6,14,0.6)',
    flexShrink: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
      <button
        onClick={isListening ? onStopListening : onStartListening}
        style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isListening
            ? 'rgba(220,38,38,0.85)'
            : 'rgba(255,255,255,0.06)',
          border: isListening
            ? '1px solid rgba(220,38,38,0.4)'
            : '1px solid rgba(255,255,255,0.08)',
          color: isListening ? '#fff' : '#6b7280',
          boxShadow: isListening ? '0 0 16px rgba(220,38,38,0.3)' : 'none',
          transition: 'all 0.2s ease',
          transform: isListening ? 'scale(1.05)' : 'scale(1)',
          cursor: 'pointer',
        }}
      >
        {isListening
          ? <MicOff style={{ width: 15, height: 15 }} />
          : <Mic style={{ width: 15, height: 15 }} />
        }
      </button>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'flex-end',
        borderRadius: 18, padding: '8px 12px', gap: 8,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'border-color 0.2s',
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={onInput}
          onKeyDown={onKey}
          placeholder={isListening ? 'Listening…' : 'Type a message…'}
          rows={1}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            color: '#f3f4f6',
            fontSize: 13,
            lineHeight: 1.45,
            maxHeight: 88,
            fontFamily: 'var(--font-body)',
          }}
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: input.trim() && !isLoading
              ? 'linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)'
              : 'rgba(255,255,255,0.04)',
            opacity: !input.trim() || isLoading ? 0.35 : 1,
            cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: input.trim() && !isLoading ? '0 2px 10px rgba(124,58,237,0.4)' : 'none',
            border: 'none',
          }}
        >
          <Send style={{ width: 12, height: 12, color: '#fff' }} />
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MOBILE — bottom sheet
══════════════════════════════════════════════════════════════════ */
const ChatBottomSheet = ({
  messages, isLoading, onSendMessage, onClearChat,
  isListening, onStartListening, onStopListening, transcript, persona,
}) => {
  const [snapIndex, setSnapIndex] = useState(0);
  const [unread, setUnread]       = useState(0);
  const [input, setInput]         = useState('');
  const sheetRef    = useRef(null);
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const dragY       = useRef(0);
  const dragH       = useRef(0);
  const prevCount   = useRef(messages.length);

  const snapHeights = () => [
    PEEK,
    Math.round(window.innerHeight * HALF),
    Math.round(window.innerHeight * FULL),
  ];

  const applySnap = useCallback((idx, animated = true) => {
    const el = sheetRef.current;
    if (!el) return;
    const h = snapHeights()[idx];
    el.style.transition = animated ? 'height 0.32s cubic-bezier(0.32,0.72,0,1)' : 'none';
    el.style.height = h + 'px';
    setSnapIndex(idx);
  }, []);

  useEffect(() => { applySnap(0, false); }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const offset = window.innerHeight - vv.height;
      if (sheetRef.current) {
        sheetRef.current.style.transform = offset > 50 ? `translateY(-${offset}px)` : 'translateY(0)';
      }
    };
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const newCount = messages.length;
    if (snapIndex === 0 && newCount > prevCount.current) {
      const newAssistant = messages.slice(prevCount.current).filter(m => m.role === 'assistant').length;
      if (newAssistant > 0) setUnread(u => u + newAssistant);
    }
    prevCount.current = newCount;
  }, [messages, snapIndex]);

  useEffect(() => { if (snapIndex > 0) setUnread(0); }, [snapIndex]);
  useEffect(() => {
    if (snapIndex > 0) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, snapIndex]);
  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);

  const onTouchStart = (e) => {
    dragY.current = e.touches[0].clientY;
    dragH.current = sheetRef.current.getBoundingClientRect().height;
    sheetRef.current.style.transition = 'none';
  };
  const onTouchMove = (e) => {
    const dy = dragY.current - e.touches[0].clientY;
    const heights = snapHeights();
    const newH = Math.max(PEEK * 0.6, Math.min(heights[2] * 1.03, dragH.current + dy));
    sheetRef.current.style.height = newH + 'px';
  };
  const onTouchEnd = () => {
    const h = sheetRef.current.getBoundingClientRect().height;
    const heights = snapHeights();
    const mid1 = (heights[0] + heights[1]) / 2;
    const mid2 = (heights[1] + heights[2]) / 2;
    if (h < mid1)      applySnap(0);
    else if (h < mid2) applySnap(1);
    else               applySnap(2);
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 88) + 'px'; }
  };
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;
    onSendMessage?.(text);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, isLoading, onSendMessage]);
  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const lastMsg = [...messages].reverse().find(m => m.role === 'assistant');
  const preview = lastMsg?.content?.slice(0, 50) || `Talk with ${persona?.name?.split(' ')[0] || 'avatar'}`;

  return (
    <div ref={sheetRef} className="bottom-sheet" style={{ height: PEEK }}>
      {/* Drag handle + peek row */}
      <div
        style={{ flexShrink: 0, cursor: 'grab' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="sheet-handle" />
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', cursor: 'pointer' }}
          onClick={() => applySnap(snapIndex === 0 ? 1 : 0)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <AvatarIcon emoji={persona?.emoji} size={30} />
              <span style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 8, height: 8, borderRadius: '50%',
                border: '1.5px solid rgba(6,6,14,0.9)',
                background: isListening ? '#f87171' : isLoading ? '#fbbf24' : '#34d399',
              }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: '#f9fafb', lineHeight: 1.2 }}>
                {persona?.name?.split(' ')[0] || 'AI'}
              </p>
              <p style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, marginTop: 1 }}>
                {isListening ? '🎙 Listening…' : isLoading ? '💭 Thinking…' : preview}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {unread > 0 && (
              <span style={{
                minWidth: 18, height: 18, borderRadius: 9,
                background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#fff', padding: '0 4px',
              }}>
                {unread}
              </span>
            )}
            <ChevronDown style={{
              width: 16, height: 16, color: '#6b7280',
              transform: snapIndex > 0 ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: 'calc(100% - 72px)',
        opacity: snapIndex > 0 ? 1 : 0,
        pointerEvents: snapIndex > 0 ? 'auto' : 'none',
        transition: 'opacity 0.2s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 14px 8px 14px',
          borderBottom: '1px solid rgba(124,58,237,0.1)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#f9fafb' }}>
              {persona?.name || 'AI Assistant'}
            </p>
            <span style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 10,
              background: 'rgba(124,58,237,0.15)', color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.2)', fontWeight: 500,
            }}>
              {persona?.role || 'AI'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={onClearChat} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
              <Trash2 style={{ width: 14, height: 14 }} />
            </button>
            <button onClick={() => applySnap(0)} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
              <ChevronDown style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>

        <MessageList messages={messages} isLoading={isLoading} persona={persona} bottomRef={bottomRef} />

        <div className="pb-safe">
          <InputBar
            input={input} onInput={handleInput} onKey={handleKey} onSend={handleSend}
            isLoading={isLoading} isListening={isListening}
            onStartListening={onStartListening} onStopListening={onStopListening}
            textareaRef={textareaRef}
          />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DESKTOP — inline mode (split view)
══════════════════════════════════════════════════════════════════ */
const ChatInline = ({ messages, isLoading, onSendMessage, onClearChat, isListening, onStartListening, onStopListening, transcript, persona }) => {
  const [input, setInput] = useState('');
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);

  const handleInput = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 96) + 'px'; }
  };
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;
    onSendMessage?.(text);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, isLoading, onSendMessage]);
  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <MessageList messages={messages} isLoading={isLoading} persona={persona} bottomRef={bottomRef} />
      <InputBar
        input={input} onInput={handleInput} onKey={handleKey} onSend={handleSend}
        isLoading={isLoading} isListening={isListening}
        onStartListening={onStartListening} onStopListening={onStopListening}
        textareaRef={textareaRef}
      />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DESKTOP — floating pill + panel
══════════════════════════════════════════════════════════════════ */
const ChatDesktop = ({ messages, isLoading, onSendMessage, onClearChat, isListening, onStartListening, onStopListening, transcript, persona }) => {
  const [isOpen, setIsOpen]   = useState(false);
  const [unread, setUnread]   = useState(0);
  const [input, setInput]     = useState('');
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const prevCount   = useRef(messages.length);

  useEffect(() => {
    const newCount = messages.length;
    if (!isOpen && newCount > prevCount.current) {
      const newAssistant = messages.slice(prevCount.current).filter(m => m.role === 'assistant').length;
      if (newAssistant > 0) setUnread(u => u + newAssistant);
    }
    prevCount.current = newCount;
  }, [messages, isOpen]);

  useEffect(() => { if (isOpen) { setUnread(0); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); } }, [isOpen]);
  useEffect(() => { if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);

  const handleInput = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 96) + 'px'; }
  };
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;
    onSendMessage?.(text);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, isLoading, onSendMessage]);
  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const previewText = [...messages].reverse().find(m => m.role === 'assistant')?.content?.slice(0, 48) || `Talk with ${persona?.name?.split(' ')[0] || 'avatar'}`;

  return (
    <>
      {/* Chat panel */}
      <div
        style={{
          position: 'fixed', bottom: 112, right: 20, zIndex: 30,
          width: 348,
          height: isOpen ? 490 : 0,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          display: 'flex', flexDirection: 'column',
          background: 'rgba(6,6,14,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(124,58,237,0.18)',
          borderRadius: 20,
          boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(124,58,237,0.1)',
          overflow: 'hidden',
          transition: 'height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px',
          borderBottom: '1px solid rgba(124,58,237,0.1)',
          background: 'rgba(6,6,14,0.8)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <AvatarIcon emoji={persona?.emoji} size={32} />
              <span style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 8, height: 8, borderRadius: '50%',
                border: '1.5px solid rgba(6,6,14,0.95)',
                background: isListening ? '#f87171' : isLoading ? '#fbbf24' : '#34d399',
              }} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#f9fafb', lineHeight: 1.2 }}>
                {persona?.name || 'AI Assistant'}
              </p>
              <p style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.2, marginTop: 1, color: isListening ? '#f87171' : isLoading ? '#fbbf24' : '#a78bfa' }}>
                {isListening ? '● Listening…' : isLoading ? '● Thinking…' : `● ${persona?.role || 'Ready'}`}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={onClearChat} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
              <Trash2 style={{ width: 14, height: 14 }} />
            </button>
            <button onClick={() => setIsOpen(false)} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
              <ChevronDown style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>

        <MessageList messages={messages} isLoading={isLoading} persona={persona} bottomRef={bottomRef} />

        <InputBar
          input={input} onInput={handleInput} onKey={handleKey} onSend={handleSend}
          isLoading={isLoading} isListening={isListening}
          onStartListening={onStartListening} onStopListening={onStopListening}
          textareaRef={textareaRef}
        />
      </div>

      {/* Floating pill trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: 112, right: 20, zIndex: 30,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 14px 8px 10px',
            background: 'rgba(6,6,14,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 40,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(124,58,237,0.1)',
            cursor: 'pointer',
            maxWidth: 260,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(124,58,237,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(124,58,237,0.1)'; }}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <AvatarIcon emoji={persona?.emoji} size={30} />
            <span style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 8, height: 8, borderRadius: '50%',
              border: '1.5px solid rgba(6,6,14,0.95)',
              background: isListening || isLoading ? '#fbbf24' : '#34d399',
            }} />
          </div>
          <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: '#f9fafb', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {persona?.name?.split(' ')[0] || 'AI'}
            </p>
            <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isListening ? '🎙 Listening…' : isLoading ? '💭 Thinking…' : previewText}
            </p>
          </div>
          {unread > 0 ? (
            <span style={{
              minWidth: 18, height: 18, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#fff', padding: '0 4px',
            }}>
              {unread}
            </span>
          ) : (
            <MessageCircle style={{ width: 14, height: 14, color: '#6b7280', flexShrink: 0 }} />
          )}
        </button>
      )}
    </>
  );
};

/* ─── Auto-switch ────────────────────────────────────────────── */
const ChatPanel = (props) => {
  if (props.isMobile) return <ChatBottomSheet {...props} />;
  if (props.isInline) return <ChatInline {...props} />;
  return <ChatDesktop {...props} />;
};

export default ChatPanel;
