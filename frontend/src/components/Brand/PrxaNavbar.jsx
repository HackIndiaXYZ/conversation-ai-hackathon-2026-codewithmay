import React from 'react';

/* ── Proxa Echo SVG logo mark ──────────────────────────────── */
const LogoMark = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lm-grad" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
    {/* Outer ring */}
    <circle cx="11" cy="11" r="10" stroke="url(#lm-grad)" strokeWidth="1.5" fill="none" opacity="0.7" />
    {/* Middle ring */}
    <circle cx="11" cy="11" r="6.5" stroke="url(#lm-grad)" strokeWidth="1" fill="none" opacity="0.5" />
    {/* Core */}
    <circle cx="11" cy="11" r="3.5" fill="url(#lm-grad)" />
  </svg>
);

const PrxaNavbar = ({
  isSpeaking, isListening, isLoading,
  viewMode, onViewModeChange,
  isMobile,
}) => {
  const statusClass = isListening ? 'listening' : isSpeaking ? 'speaking' : isLoading ? 'thinking' : '';
  const statusLabel = isListening ? 'Listening' : isSpeaking ? 'Speaking' : isLoading ? 'Thinking' : 'Ready';

  const isAvatarOnly = isMobile || viewMode === 'avatar';

  return (
    <header
      className="proxa-navbar"
      style={isAvatarOnly ? {
        background: 'rgba(3, 7, 18, 0)',
        backdropFilter: 'blur(0px)',
        WebkitBackdropFilter: 'blur(0px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0)',
        boxShadow: 'none',
      } : undefined}
    >
      {/* Logo */}
      <div className="proxa-logo">
        <div className="proxa-logo-icon">
          <LogoMark />
        </div>
        <span className="proxa-logo-name">
          Proxa <span>Echo</span>
        </span>
      </div>

      {/* Center — session indicator (desktop only) */}
      {!isMobile && (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="session-indicator">
            <span className="session-dot" />
            <span>Live Session</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: 12 }}>|</span>
          <span style={{ fontSize: 10, color: 'rgba(156,163,175,0.5)', letterSpacing: '0.06em', fontWeight: 500, textTransform: 'uppercase' }}>
            Healthcare AI
          </span>
        </div>
      )}

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Status badge */}
        <div className={`status-badge ${statusClass}`}>
          <span className={`status-dot ${statusClass}`} />
          <span>{statusLabel}</span>
        </div>

        {/* View mode toggle — desktop only */}
        {!isMobile && onViewModeChange && (
          <button
            onClick={() => onViewModeChange(viewMode === 'split' ? 'avatar' : 'split')}
            className="btn-ghost"
            style={{ fontSize: 11, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            {viewMode === 'split' ? (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/></svg>
                Avatar
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="4.5" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="6.5" y="1" width="4.5" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                Split
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export default PrxaNavbar;