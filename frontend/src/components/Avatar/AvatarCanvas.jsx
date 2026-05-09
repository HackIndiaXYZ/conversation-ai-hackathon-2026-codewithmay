/**
 * AvatarCanvas.jsx
 *
 * Responsibilities:
 *  1. Mount the WebGL canvas and initialise Live2DManager (once).
 *  2. Forward `audioAmplitude` to Live2DManager via a ref (zero-React-render cost).
 *  3. Forward `phonemeTimeline` whenever the caller loads new TTS audio.
 *  4. Forward `isSpeaking` so Live2DManager can trigger speaking / idle motions.
 *  5. Switch models when `modelPath` changes.
 *  6. Call `onManagerReady(mgr)` after init so callers can access setEmotion() etc.
 *
 * Pipeline
 * --------
 *   TTS / audio data       → phonemeTimeline prop (optional)
 *   Audio amplitude        → audioAmplitude prop  (0–1 float, every render frame)
 *   Speaking on/off        → isSpeaking prop
 *         ↓
 *   AvatarCanvas           (this file — bridges React ↔ Live2D)
 *         ↓
 *   Live2DManager          (timing, shape selection, motion triggering)
 *         ↓
 *   lappmodel              (smooth param interpolation, SDK update)
 *         ↓
 *   MODEL ANIMATES
 *
 * Props
 * -----
 * @prop {string}          modelPath       Path to the model3.json  (required)
 * @prop {number}          audioAmplitude  Raw RMS amplitude 0–1     (default 0)
 * @prop {boolean}         isSpeaking      Whether TTS is active      (default false)
 * @prop {PhonemeEvent[]}  phonemeTimeline Sorted phoneme events      (optional)
 *                                         Format: [{time:0.05, phoneme:'A'}, …]
 *                                         time = seconds from speech start
 * @prop {string}          background      Background preset name     (default 'hospital')
 * @prop {string}          className       Extra CSS classes for the wrapper div
 * @prop {Function}        onManagerReady  Called with Live2DManager instance after init
 */

import React, { useEffect, useRef } from 'react';
import AvatarBackground from './AvatarBackground';
import ImageOverlay from './ImageOverlay';

// ── Dynamic import — keeps Live2D + WebGL out of the initial bundle ──────────
let Live2DManagerClass = null;
const getLive2DManager = async () => {
  if (!Live2DManagerClass) {
    const mod = await import('../../live2d/Live2DManager');
    Live2DManagerClass = mod.Live2DManager;
  }
  return Live2DManagerClass;
};

// ── Component ────────────────────────────────────────────────────────────────

const AvatarCanvas = ({
  modelPath,
  audioAmplitude  = 0,
  isSpeaking      = false,
  phonemeTimeline = null,
  background      = 'hospital',
  className       = '',
  onManagerReady  = null,
  transform       = { scale: 100, translateY: 0, translateX: 0 },
  imageQuery      = null,
  imageVisible    = false,
  imageCount      = 1,
}) => {
  const canvasRef      = useRef(null);
  const managerRef     = useRef(null);
  const initializedRef = useRef(false);

  // Amplitude ref: written each render, read by the Live2D frame loop directly.
  // Using a ref avoids triggering re-renders and sidesteps React's batching.
  const amplitudeRef = useRef(0);
  amplitudeRef.current = audioAmplitude;

  // CSS scale ref: keeps Live2DManager in sync with the current zoom level so
  // the WebGL buffer is always rendered at the correct physical resolution
  // (prevents blurriness when zoomed in on desktop).
  const scaleRef = useRef(1);
  scaleRef.current = (transform.scale || 100) / 100;

  // ── Initialise WebGL + model (once per mount) ────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // Wait one rAF so the canvas has been laid out and has valid clientWidth
      await new Promise(r => requestAnimationFrame(r));
      if (cancelled || !canvasRef.current || !modelPath) return;

      const Manager = await getLive2DManager();
      const mgr = new Manager();
      managerRef.current   = mgr;
      initializedRef.current = true;

      // Pass the amplitude ref so the frame loop reads it every tick
      await mgr.initialize(canvasRef.current, modelPath, amplitudeRef, scaleRef);

      // Notify the parent so it can call setEmotion() etc.
      if (typeof onManagerReady === 'function') onManagerReady(mgr);
    };

    init();

    return () => {
      cancelled = true;
      managerRef.current?.destroy();
      managerRef.current   = null;
      initializedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — intentionally runs once

  // ── Switch model when persona changes ────────────────────────────────────
  useEffect(() => {
    if (!modelPath || !initializedRef.current || !managerRef.current) return;
    managerRef.current.switchModel(modelPath);
  }, [modelPath]);

  // ── Re-render canvas at correct resolution when scale changes ────────────
  //
  // CSS transform: scale() only stretches pixels — it doesn't update the WebGL
  // framebuffer.  When the user zooms in on desktop the avatar would look blurry
  // without this.  scaleRef.current is already updated before this effect runs,
  // so resizeCanvas() inside the manager will read the new value immediately.
  //
  useEffect(() => {
    if (!initializedRef.current || !managerRef.current) return;
    managerRef.current.notifyScaleChange();
  }, [transform.scale]);

  // ── Forward isSpeaking to Live2DManager ─────────────────────────────────
  //
  // Live2DManager.setSpeakingState():
  //   true  → triggers a speaking/gesture motion (TapBody, Gesture, …)
  //   false → starts the linger countdown then lets idle resume
  //
  useEffect(() => {
    if (!initializedRef.current || !managerRef.current) return;
    managerRef.current.setSpeakingState(isSpeaking);
  }, [isSpeaking]);

  // ── Forward phoneme timeline to Live2DManager ────────────────────────────
  //
  // Call this as close to the start of audio playback as possible so the
  // internal clock starts at the right moment.  The manager sorts events
  // internally, so order doesn't matter on the React side.
  //
  // `phonemeTimeline` is compared by reference — if you're creating a new
  // array each render, memoize it with useMemo() in the parent component.
  //
  useEffect(() => {
    if (!initializedRef.current || !managerRef.current) return;
    if (!phonemeTimeline || phonemeTimeline.length === 0) return;
    managerRef.current.setPhonemeTimeline(phonemeTimeline);
  }, [phonemeTimeline]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ isolation: 'isolate' }}
    >
      <AvatarBackground type={background} />
      <ImageOverlay imageQuery={imageQuery} imageCount={imageCount} visible={imageVisible} />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          display: 'block',
          zIndex: 1,
          pointerEvents: 'none',
          transform: `scale(${(transform.scale || 100) / 100}) translate(${transform.translateX || 0}px, ${transform.translateY || 0}px)`,
          transformOrigin: 'center bottom',
          transition: 'transform 0.1s ease-out',
          imageRendering: 'auto',
        }}
      />
    </div>
  );
};

export default AvatarCanvas;