import React, { useState, useRef } from 'react';

/* ─── Mobile horizontal pill strip ─────────────────────────── */
const PersonaStripMobile = ({ personas, activePersona, onSelect }) => {
  const [tooltip, setTooltip] = useState(null);
  const holdTimers = useRef({});

  const startHold = (p) => {
    holdTimers.current[p.id] = setTimeout(() => setTooltip(p.id), 320);
  };
  const endHold = (p) => {
    clearTimeout(holdTimers.current[p.id]);
  };

  if (!personas?.length) return null;
  return (
    <div className="persona-strip py-2 pt-safe">
      {personas.map(p => {
        const isActive = activePersona?.id === p.id;
        return (
          <div key={p.id} className="relative flex-shrink-0">
            <button
              onPointerDown={() => startHold(p)}
              onPointerUp={() => endHold(p)}
              onPointerLeave={() => { endHold(p); setTooltip(null); }}
              onClick={() => { setTooltip(null); onSelect(p.id); }}
              className="flex flex-col items-center gap-1 px-1 active:scale-95"
              style={{ minWidth: 56, transition: 'transform 0.1s' }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(6,182,212,0.15) 100%)'
                    : 'rgba(6,6,14,0.6)',
                  border: `1.5px solid ${isActive ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isActive ? '0 0 16px rgba(124,58,237,0.4), 0 0 4px rgba(6,182,212,0.2)' : 'none',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  transition: 'all 0.25s ease',
                }}
              >
                {p.emoji}
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.01em',
                  color: isActive ? '#c4b5fd' : 'rgba(255,255,255,0.38)',
                  maxWidth: 52,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.25s ease',
                }}
              >
                {p.name.split(' ')[0]}
              </span>
            </button>

            {/* Long-press tooltip */}
            {tooltip === p.id && (
              <div
                className="absolute top-14 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-3 py-2.5 text-left shadow-2xl"
                style={{
                  background: 'rgba(6,6,14,0.97)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  minWidth: 148,
                  pointerEvents: 'none',
                  animation: 'scaleIn 0.15s ease',
                }}
              >
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: '#f9fafb', lineHeight: 1.2 }}>{p.name}</p>
                <p style={{ fontSize: 11, marginTop: 2, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{p.role}</p>
                {p.specialty && (
                  <p style={{ fontSize: 10, color: '#6b7280', marginTop: 4, lineHeight: 1.4 }}>{p.specialty}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ─── Desktop vertical sidebar ──────────────────────────────── */
const PersonaSidebarDesktop = ({ personas, activePersona, onSelect }) => {
  if (!personas?.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {personas.map(p => {
        const isActive = activePersona?.id === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingLeft: 12, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
              borderRadius: 12,
              textAlign: 'left',
              background: isActive
                ? 'linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(6,182,212,0.10) 100%)'
                : 'rgba(6,6,14,0.55)',
              border: `1px solid ${isActive ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.06)'}`,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: isActive
                ? '0 0 20px rgba(124,58,237,0.25), 0 2px 8px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.2)',
              transform: isActive ? 'translateX(5px)' : 'translateX(0)',
              transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1, width: 24, flexShrink: 0, textAlign: 'center' }}>{p.emoji}</span>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: 12,
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: isActive ? '#e9d5ff' : '#e5e7eb',
                lineHeight: 1.2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {p.name.split(' ')[0]}
              </p>
              <p style={{
                fontSize: 10,
                fontWeight: 500,
                color: isActive ? '#a78bfa' : '#6b7280',
                lineHeight: 1.2,
                marginTop: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                maxWidth: 90,
              }}>
                {p.role}
              </p>
            </div>
            {isActive && (
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                flexShrink: 0, marginLeft: 'auto',
                boxShadow: '0 0 8px rgba(124,58,237,0.6)',
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
};

const PersonaSelector = ({ personas, activePersona, onSelect, isMobile }) => {
  if (isMobile) {
    return <PersonaStripMobile personas={personas} activePersona={activePersona} onSelect={onSelect} />;
  }
  return <PersonaSidebarDesktop personas={personas} activePersona={activePersona} onSelect={onSelect} />;
};

export default PersonaSelector;
