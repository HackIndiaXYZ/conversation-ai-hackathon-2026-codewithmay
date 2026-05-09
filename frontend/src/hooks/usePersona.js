import { useState, useEffect, useCallback } from 'react';

/**
 * Build a system prompt from the active persona, optionally overridden by user settings.
 * Priority: full custom system prompt > field-by-field overrides > persona default.
 */
function buildSystemPrompt(persona, settings = {}) {
  // Full override wins
  if (settings.personaSystemPrompt?.trim()) {
    return settings.personaSystemPrompt.trim();
  }

  // Field-by-field overrides layered on top of the persona's default
  let base = persona?.systemPrompt || '';

  const name    = settings.personaName?.trim();
  const role    = settings.personaRole?.trim();
  const traits  = settings.personaTraits?.trim();
  const behavior = settings.personaDialogueBehavior?.trim();

  if (name || role || traits || behavior) {
    const nameLine    = name    ? `Your name is ${name}.` : '';
    const roleLine    = role    ? `Your role is: ${role}.` : '';
    const traitsLine  = traits  ? `Your personality traits are: ${traits}.` : '';
    const behaviorMap = {
      concise:    'Keep every reply to 2 sentences or fewer.',
      detailed:   'Give thorough, well-structured explanations.',
      socratic:   'Reply primarily with guiding questions to help the user discover answers themselves.',
      empathetic: 'Always acknowledge the user\'s feelings before responding to the content.',
      formal:     'Use formal language and avoid contractions.',
      casual:     'Speak in a relaxed, friendly, conversational tone.',
    };
    const behaviorLine = behavior ? behaviorMap[behavior] || '' : '';

    const overrides = [nameLine, roleLine, traitsLine, behaviorLine].filter(Boolean).join(' ');
    base = base ? `${base}\n\n${overrides}` : overrides;
  }

  return base;
}

export const usePersona = (settings = {}) => {
  const [personas, setPersonas] = useState([]);
  const [activePersona, setActivePersona] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/personas.json')
      .then(r => r.json())
      .then(data => {
        setPersonas(data);
        setActivePersona(data[0]); // default to first (Doctor)
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load personas:', err);
        setLoading(false);
      });
  }, []);

  const switchPersona = useCallback((personaId) => {
    const found = personas.find(p => p.id === personaId);
    if (found) setActivePersona(found);
  }, [personas]);

  // Compose the effective persona: base persona + settings overrides
  const effectivePersona = activePersona
    ? {
        ...activePersona,
        // Override display name / role if user set them
        name: settings.personaName?.trim() || activePersona.name,
        role: settings.personaRole?.trim() || activePersona.role,
        systemPrompt: buildSystemPrompt(activePersona, settings),
      }
    : null;

  return { personas, activePersona, effectivePersona, loading, switchPersona };
};
