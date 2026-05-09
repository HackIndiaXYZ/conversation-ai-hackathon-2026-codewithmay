import { useState, useCallback } from 'react';

const STORAGE_KEY = 'avatar-transforms';
const DEFAULTS = { scale: 100, translateY: 0, translateX: 0 };

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const useAvatarTransform = () => {
  const [transforms, setTransforms] = useState(load);

  const getTransform = useCallback((personaId) => {
    return { ...DEFAULTS, ...(transforms[personaId] || {}) };
  }, [transforms]);

  const setTransform = useCallback((personaId, key, value) => {
    setTransforms(prev => {
      const next = {
        ...prev,
        [personaId]: { ...DEFAULTS, ...(prev[personaId] || {}), [key]: value },
      };
      save(next);
      return next;
    });
  }, []);

  const resetTransform = useCallback((personaId) => {
    setTransforms(prev => {
      const next = { ...prev };
      delete next[personaId];
      save(next);
      return next;
    });
  }, []);

  return { getTransform, setTransform, resetTransform };
};
