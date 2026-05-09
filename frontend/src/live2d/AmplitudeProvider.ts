/**
 * AmplitudeProvider
 *
 * Custom IParameterProvider that reads real-time audio amplitude from a React ref.
 * This replaces LAppWavFileHandler for browser-based TTS audio sources (Web Speech API
 * and base64 audio) where we drive amplitude externally via Web Audio analysis.
 *
 * The provider is registered with CubismLipSyncUpdater so the framework's normal
 * onLateUpdate → addParameterValueById pipeline is used — meaning the mouth value
 * is applied AFTER loadParameters/saveParameters, which is the correct order.
 */

import { IParameterProvider } from '@framework/motion/iparameterprovider';

export class AmplitudeProvider extends IParameterProvider {
  private _amplitudeRef: { current: number };
  private _smoothed = 0;
  private _smoothingFactor: number;

  /**
   * @param amplitudeRef - Shared React ref; `.current` is updated each frame by
   *                       the Web Audio analyser or amplitude simulation in useTextToSpeech.
   * @param smoothingFactor - How quickly the smoothed value tracks raw amplitude (0–1).
   *                          0.35 gives natural mouth movement without jitter.
   */
  constructor(
    amplitudeRef: { current: number },
    smoothingFactor = 0.0   // Pass-through: Live2DManager owns all smoothing
  ) {
    super();
    this._amplitudeRef = amplitudeRef;
    this._smoothingFactor = smoothingFactor;
  }

  /**
   * Called each frame by CubismUpdateScheduler.onLateUpdate().
   * Pass the raw value straight through — Live2DManager.applyParams
   * handles all smoothing with asymmetric attack/release rates.
   * Double-smoothing was the primary cause of lip sync lag on haru/izumi.
   */
  update(_deltaTimeSeconds?: number): boolean {
    // No smoothing here — just copy raw value so getParameter() is current
    this._smoothed = this._amplitudeRef.current ?? 0;
    return true;
  }

  /**
   * Returns raw amplitude in [0, 1].
   * CubismLipSyncUpdater calls addParameterValueById(id, this.getParameter()).
   * For haru/izumi, Live2DManager overrides PARAM_MOUTH_OPEN_Y via
   * setParameterValueById after the scheduler runs, so this value is
   * effectively only used for models not explicitly handled in applyParams.
   */
  getParameter(): number {
    return Math.max(0, Math.min(1, this._smoothed));
  }

  /** Reset smoothing (call when switching models). */
  reset(): void {
    this._smoothed = 0;
  }
}
