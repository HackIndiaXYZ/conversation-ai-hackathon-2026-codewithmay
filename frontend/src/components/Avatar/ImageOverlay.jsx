import React, { useState, useEffect, useRef } from 'react';

/**
 * ImageOverlay
 *
 * Fetches real Google Images via the backend /api/images proxy (SerpApi).
 * Falls back to Unsplash if the backend returns nothing.
 *
 * Layouts:
 *   1 → one large panel, left side, vertically centred
 *   2 → one panel each side, vertically centred
 *   3 → two stacked left + one right centred
 *   4 → 2×2 grid flanking avatar
 */

const API_BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:3001/api';

// ── Backend proxy → SerpApi ───────────────────────────────────────────────────
async function fetchImages(query, count) {
  try {
    const res  = await fetch(`${API_BASE}/images?q=${encodeURIComponent(query)}&num=${count}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const urls = (data.images || []).map(img => img.thumbnail).filter(Boolean);
    if (urls.length > 0) return urls;
  } catch (err) {
    console.warn('[ImageOverlay] backend fetch failed:', err.message);
  }

  // Picsum fallback (reliable — source.unsplash.com was deprecated in 2023)
  return Array.from({ length: count }, (_, i) => {
    const seed = Math.abs(
      query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + i * 37
    ) % 1000;
    return `https://picsum.photos/seed/${seed}/400/300`;
  });
}

// ── Panel layout per count ────────────────────────────────────────────────────
function getPanelStyles(count) {
  switch (count) {
    case 1:
      return [
        { left: '2%', top: '50%', transform: 'translateY(-50%)', width: '30%', aspectRatio: '4/3' },
      ];
    case 2:
      return [
        { left: '2%',  top: '50%', transform: 'translateY(-50%)', width: '28%', aspectRatio: '4/3' },
        { right: '2%', top: '50%', transform: 'translateY(-50%)', width: '28%', aspectRatio: '4/3' },
      ];
    case 3:
      return [
        { left: '2%', top: '12%', width: '26%', aspectRatio: '4/3' },
        { left: '2%', top: '57%', width: '26%', aspectRatio: '4/3' },
        { right: '2%', top: '50%', transform: 'translateY(-50%)', width: '28%', aspectRatio: '4/3' },
      ];
    case 4:
    default:
      return [
        { left: '2%',  top: '12%', width: '27%', aspectRatio: '4/3' },
        { right: '2%', top: '12%', width: '27%', aspectRatio: '4/3' },
        { left: '2%',  top: '57%', width: '24%', aspectRatio: '4/3' },
        { right: '2%', top: '57%', width: '24%', aspectRatio: '4/3' },
      ];
  }
}

// ── Individual image panel ────────────────────────────────────────────────────
const ImagePanel = ({ src, style, index, visible }) => {
  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);

  useEffect(() => { setLoaded(false); setError(false); }, [src]);

  const isReady = loaded || error;
  const delay   = index * 90;

  return (
    <div
      style={{
        position: 'absolute',
        ...style,
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
        opacity:   visible && isReady ? 1 : 0,
        transform: `${style.transform || ''} scale(${visible && isReady ? 1 : 0.85})`,
        zIndex: 5,
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 6px 28px rgba(0,0,0,0.5)',
        border: '3px solid rgba(255,255,255,0.88)',
        background: '#1a1a2e',
      }}
    >
      {/* Loading shimmer */}
      {!isReady && (
        <div style={{
          width: '100%', paddingTop: '75%', position: 'relative',
          background: 'linear-gradient(135deg,#2a2a4a,#1a1a2e)',
        }}>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.2)', fontSize: '11px',
          }}>···</div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          width: '100%', paddingTop: '75%', position: 'relative',
          background: 'linear-gradient(135deg,#2a1a1a,#1a1a2e)',
        }}>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.2)', fontSize: '11px',
          }}>unavailable</div>
        </div>
      )}

      {/* Image */}
      {src && (
        <img
          src={src}
          alt=""
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            display: loaded ? 'block' : 'none',
            width: '100%', height: '100%', objectFit: 'cover',
          }}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
};

// ── Main overlay ──────────────────────────────────────────────────────────────
const ImageOverlay = ({ imageQuery, imageCount = 1, visible }) => {
  const count = Math.min(4, Math.max(1, imageCount || 1));

  const [images,        setImages]        = useState([]);
  const [panelsVisible, setPanelsVisible] = useState(false);
  const lastKeyRef = useRef(null);

  useEffect(() => {
    const key = `${imageQuery}|${count}`;
    if (!imageQuery || key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    setImages([]);
    setPanelsVisible(false);

    fetchImages(imageQuery, count).then(urls => setImages(urls));
  }, [imageQuery, count]);

  useEffect(() => {
    if (visible && images.length > 0) {
      const t = setTimeout(() => setPanelsVisible(true), 80);
      return () => clearTimeout(t);
    } else {
      setPanelsVisible(false);
    }
  }, [visible, images]);

  if (!visible && !panelsVisible) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
      {getPanelStyles(count).map((style, i) => (
        <ImagePanel
          key={`${imageQuery}-${i}`}
          src={images[i] ?? null}
          style={style}
          index={i}
          visible={panelsVisible}
        />
      ))}
    </div>
  );
};

export default ImageOverlay;
