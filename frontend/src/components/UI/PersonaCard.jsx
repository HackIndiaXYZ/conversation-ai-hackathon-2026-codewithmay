import React from 'react';

const PersonaCard = ({ persona }) => {
  if (!persona) return null;

  return (
    <div className="persona-card" style={{ zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{
          width: 28, height: 28,
          borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(6,182,212,0.2) 100%)',
          border: '1px solid rgba(124,58,237,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, flexShrink: 0,
        }}>
          {persona.emoji}
        </div>
        <div>
          <p className="persona-card-name">{persona.name}</p>
          <p className="persona-card-role">{persona.role}</p>
        </div>
      </div>
      {persona.specialty && (
        <p className="persona-card-spec">{persona.specialty}</p>
      )}
    </div>
  );
};

export default PersonaCard;
