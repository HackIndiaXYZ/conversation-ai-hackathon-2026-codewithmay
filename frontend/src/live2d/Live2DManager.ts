import { CubismFramework, Option } from '@framework/live2dcubismframework';
import { CubismMatrix44 } from '@framework/math/cubismmatrix44';
import { CubismWebGLOffscreenManager } from '@framework/rendering/cubismoffscreenmanager';
import { CubismShaderManager_WebGL, CubismShaderSet } from '@framework/rendering/cubismshader_webgl';
import { CubismIdHandle } from '@framework/id/cubismid';
import { LAppModel } from './lappmodel';
import { LAppPal } from './lapppal';
import { LAppTextureManager } from './lapptexturemanager';
import { LAppGlManager } from './lappglmanager';
import * as LAppDefine from './lappdefine';
import { shaderSources } from './shaderSources';

const LOAD_COMPLETE = 23;

export interface PhonemeEvent {
  time: number;
  phoneme: string;
}

const DEFAULT_MOOD: Record<string, string> = {
  haru:           'analytical',
  izumi_anime_01:  'friendly',
  kei_vowels_pro: 'engaged',
  haru_greeter:   'calm',
};

const EMOTION_PARAMS: Record<string, Record<string, Record<string, number>>> = {
  haru: {
    neutral:    { PARAM_EYE_FORM: 0,     PARAM_EYE_BALL_FORM: 0,    PARAM_BROW_L_Y: 0,     PARAM_BROW_R_Y: 0,     PARAM_BROW_L_ANGLE: 0,     PARAM_BROW_R_ANGLE: 0,     PARAM_BROW_L_FORM: 0,     PARAM_BROW_R_FORM: 0,     PARAM_MOUTH_FORM: 0,     PARAM_TERE: 0 },
    happy:      { PARAM_EYE_FORM: 0.8,   PARAM_EYE_BALL_FORM: 0.3,  PARAM_BROW_L_Y: 0.45,  PARAM_BROW_R_Y: 0.45,  PARAM_BROW_L_ANGLE: 0.3,   PARAM_BROW_R_ANGLE: 0.3,   PARAM_BROW_L_FORM: 0.5,   PARAM_BROW_R_FORM: 0.5,   PARAM_MOUTH_FORM: 1.5,   PARAM_TERE: 0 },
    angry:      { PARAM_EYE_FORM: -1,    PARAM_EYE_BALL_FORM: -0.5, PARAM_BROW_L_Y: -0.5,  PARAM_BROW_R_Y: -0.5,  PARAM_BROW_L_ANGLE: -0.7,  PARAM_BROW_R_ANGLE: -0.7,  PARAM_BROW_L_FORM: -0.7,  PARAM_BROW_R_FORM: -0.7,  PARAM_MOUTH_FORM: -2,    PARAM_TERE: 0 },
    sad:        { PARAM_EYE_FORM: 0.5,   PARAM_EYE_BALL_FORM: 0.2,  PARAM_BROW_L_Y: -0.35, PARAM_BROW_R_Y: -0.35, PARAM_BROW_L_ANGLE: 0.4,   PARAM_BROW_R_ANGLE: 0.4,   PARAM_BROW_L_FORM: -0.6,  PARAM_BROW_R_FORM: -0.6,  PARAM_MOUTH_FORM: -1.2,  PARAM_TERE: 0 },
    surprised:  { PARAM_EYE_FORM: -0.2,  PARAM_EYE_BALL_FORM: -1,   PARAM_BROW_L_Y: 0.7,   PARAM_BROW_R_Y: 0.7,   PARAM_BROW_L_ANGLE: 0.1,   PARAM_BROW_R_ANGLE: 0.1,   PARAM_BROW_L_FORM: 0.6,   PARAM_BROW_R_FORM: 0.6,   PARAM_MOUTH_FORM: -0.8,  PARAM_TERE: 0 },
    blushing:   { PARAM_EYE_FORM: 0.4,   PARAM_EYE_BALL_FORM: 0.1,  PARAM_BROW_L_Y: 0.15,  PARAM_BROW_R_Y: 0.15,  PARAM_BROW_L_ANGLE: 0.3,   PARAM_BROW_R_ANGLE: 0.3,   PARAM_BROW_L_FORM: -0.5,  PARAM_BROW_R_FORM: -0.5,  PARAM_MOUTH_FORM: -0.3,  PARAM_TERE: 1 },
    analytical: { PARAM_EYE_FORM: -0.15, PARAM_EYE_BALL_FORM: 0,    PARAM_BROW_L_Y: -0.15, PARAM_BROW_R_Y: -0.15, PARAM_BROW_L_ANGLE: -0.15, PARAM_BROW_R_ANGLE: -0.15, PARAM_BROW_L_FORM: -0.2,  PARAM_BROW_R_FORM: -0.2,  PARAM_MOUTH_FORM: -0.1,  PARAM_TERE: 0 },
    friendly:   { PARAM_EYE_FORM: 0.45,  PARAM_EYE_BALL_FORM: 0.2,  PARAM_BROW_L_Y: 0.2,   PARAM_BROW_R_Y: 0.2,   PARAM_BROW_L_ANGLE: 0.15,  PARAM_BROW_R_ANGLE: 0.15,  PARAM_BROW_L_FORM: 0.2,   PARAM_BROW_R_FORM: 0.2,   PARAM_MOUTH_FORM: 0.8,   PARAM_TERE: 0 },
    engaged:    { PARAM_EYE_FORM: 0.3,   PARAM_EYE_BALL_FORM: 0.1,  PARAM_BROW_L_Y: 0.3,   PARAM_BROW_R_Y: 0.3,   PARAM_BROW_L_ANGLE: 0.15,  PARAM_BROW_R_ANGLE: 0.15,  PARAM_BROW_L_FORM: 0.15,  PARAM_BROW_R_FORM: 0.15,  PARAM_MOUTH_FORM: 0.55,  PARAM_TERE: 0 },
    calm:       { PARAM_EYE_FORM: 0.15,  PARAM_EYE_BALL_FORM: 0,    PARAM_BROW_L_Y: 0.05,  PARAM_BROW_R_Y: 0.05,  PARAM_BROW_L_ANGLE: 0.05,  PARAM_BROW_R_ANGLE: 0.05,  PARAM_BROW_L_FORM: 0.05,  PARAM_BROW_R_FORM: 0.05,  PARAM_MOUTH_FORM: 0.3,   PARAM_TERE: 0 },
    excited:    { PARAM_EYE_FORM: 1,     PARAM_EYE_BALL_FORM: 0.4,  PARAM_BROW_L_Y: 0.6,   PARAM_BROW_R_Y: 0.6,   PARAM_BROW_L_ANGLE: 0.35,  PARAM_BROW_R_ANGLE: 0.35,  PARAM_BROW_L_FORM: 0.6,   PARAM_BROW_R_FORM: 0.6,   PARAM_MOUTH_FORM: 2,     PARAM_TERE: 0 },
    thinking:   { PARAM_EYE_FORM: -0.1,  PARAM_EYE_BALL_FORM: 0,    PARAM_BROW_L_Y: 0.3,   PARAM_BROW_R_Y: -0.1,  PARAM_BROW_L_ANGLE: 0.2,   PARAM_BROW_R_ANGLE: -0.1,  PARAM_BROW_L_FORM: 0.1,   PARAM_BROW_R_FORM: -0.2,  PARAM_MOUTH_FORM: -0.2,  PARAM_TERE: 0 },
    concerned:  { PARAM_EYE_FORM: 0.2,   PARAM_EYE_BALL_FORM: 0,    PARAM_BROW_L_Y: -0.2,  PARAM_BROW_R_Y: -0.2,  PARAM_BROW_L_ANGLE: 0.35,  PARAM_BROW_R_ANGLE: 0.35,  PARAM_BROW_L_FORM: -0.4,  PARAM_BROW_R_FORM: -0.4,  PARAM_MOUTH_FORM: -0.4,  PARAM_TERE: 0 },
    embarrassed:{ PARAM_EYE_FORM: 0.6,   PARAM_EYE_BALL_FORM: 0.2,  PARAM_BROW_L_Y: 0.1,   PARAM_BROW_R_Y: 0.1,   PARAM_BROW_L_ANGLE: 0.25,  PARAM_BROW_R_ANGLE: 0.25,  PARAM_BROW_L_FORM: -0.4,  PARAM_BROW_R_FORM: -0.4,  PARAM_MOUTH_FORM: 0.3,   PARAM_TERE: 1 },
    proud:      { PARAM_EYE_FORM: 0.2,   PARAM_EYE_BALL_FORM: 0,    PARAM_BROW_L_Y: 0.2,   PARAM_BROW_R_Y: 0.2,   PARAM_BROW_L_ANGLE: -0.1,  PARAM_BROW_R_ANGLE: -0.1,  PARAM_BROW_L_FORM: 0.1,   PARAM_BROW_R_FORM: 0.1,   PARAM_MOUTH_FORM: 0.9,   PARAM_TERE: 0 },
    curious:    { PARAM_EYE_FORM: 0.1,   PARAM_EYE_BALL_FORM: -0.3, PARAM_BROW_L_Y: 0.45,  PARAM_BROW_R_Y: 0.05,  PARAM_BROW_L_ANGLE: 0.1,   PARAM_BROW_R_ANGLE: -0.05, PARAM_BROW_L_FORM: 0.2,   PARAM_BROW_R_FORM: -0.1,  PARAM_MOUTH_FORM: 0.2,   PARAM_TERE: 0 },
  },
  izumi_anime_01: {
    neutral:    { PARAM_EYE_FORM: 0,     PARAM_EYE_BALL_FORM: 0,    PARAM_BROW_L_Y: 0,     PARAM_BROW_R_Y: 0,     PARAM_BROW_L_ANGLE: 0,     PARAM_BROW_R_ANGLE: 0,     PARAM_BROW_L_FORM: 0,     PARAM_BROW_R_FORM: 0,     PARAM_MOUTH_FORM: 0,     PARAM_TERE: 0 },
    happy:      { PARAM_EYE_FORM: 0.8,   PARAM_EYE_BALL_FORM: 0.3,  PARAM_BROW_L_Y: 0.45,  PARAM_BROW_R_Y: 0.45,  PARAM_BROW_L_ANGLE: 0.3,   PARAM_BROW_R_ANGLE: 0.3,   PARAM_BROW_L_FORM: 0.5,   PARAM_BROW_R_FORM: 0.5,   PARAM_MOUTH_FORM: 1.5,   PARAM_TERE: 0 },
    angry:      { PARAM_EYE_FORM: -1,    PARAM_EYE_BALL_FORM: -0.5, PARAM_BROW_L_Y: -0.5,  PARAM_BROW_R_Y: -0.5,  PARAM_BROW_L_ANGLE: -0.7,  PARAM_BROW_R_ANGLE: -0.7,  PARAM_BROW_L_FORM: -0.7,  PARAM_BROW_R_FORM: -0.7,  PARAM_MOUTH_FORM: -2,    PARAM_TERE: 0 },
    sad:        { PARAM_EYE_FORM: 0.5,   PARAM_EYE_BALL_FORM: 0.2,  PARAM_BROW_L_Y: -0.35, PARAM_BROW_R_Y: -0.35, PARAM_BROW_L_ANGLE: 0.4,   PARAM_BROW_R_ANGLE: 0.4,   PARAM_BROW_L_FORM: -0.6,  PARAM_BROW_R_FORM: -0.6,  PARAM_MOUTH_FORM: -1.2,  PARAM_TERE: 0 },
    surprised:  { PARAM_EYE_FORM: -0.2,  PARAM_EYE_BALL_FORM: -1,   PARAM_BROW_L_Y: 0.7,   PARAM_BROW_R_Y: 0.7,   PARAM_BROW_L_ANGLE: 0.1,   PARAM_BROW_R_ANGLE: 0.1,   PARAM_BROW_L_FORM: 0.6,   PARAM_BROW_R_FORM: 0.6,   PARAM_MOUTH_FORM: -0.8,  PARAM_TERE: 0 },
    blushing:   { PARAM_EYE_FORM: 0.4,   PARAM_EYE_BALL_FORM: 0.1,  PARAM_BROW_L_Y: 0.15,  PARAM_BROW_R_Y: 0.15,  PARAM_BROW_L_ANGLE: 0.3,   PARAM_BROW_R_ANGLE: 0.3,   PARAM_BROW_L_FORM: -0.5,  PARAM_BROW_R_FORM: -0.5,  PARAM_MOUTH_FORM: -0.3,  PARAM_TERE: 1 },
    analytical: { PARAM_EYE_FORM: -0.15, PARAM_EYE_BALL_FORM: 0,    PARAM_BROW_L_Y: -0.15, PARAM_BROW_R_Y: -0.15, PARAM_BROW_L_ANGLE: -0.15, PARAM_BROW_R_ANGLE: -0.15, PARAM_BROW_L_FORM: -0.2,  PARAM_BROW_R_FORM: -0.2,  PARAM_MOUTH_FORM: -0.1,  PARAM_TERE: 0 },
    friendly:   { PARAM_EYE_FORM: 0.45,  PARAM_EYE_BALL_FORM: 0.2,  PARAM_BROW_L_Y: 0.2,   PARAM_BROW_R_Y: 0.2,   PARAM_BROW_L_ANGLE: 0.15,  PARAM_BROW_R_ANGLE: 0.15,  PARAM_BROW_L_FORM: 0.2,   PARAM_BROW_R_FORM: 0.2,   PARAM_MOUTH_FORM: 0.8,   PARAM_TERE: 0 },
    engaged:    { PARAM_EYE_FORM: 0.3,   PARAM_EYE_BALL_FORM: 0.1,  PARAM_BROW_L_Y: 0.3,   PARAM_BROW_R_Y: 0.3,   PARAM_BROW_L_ANGLE: 0.15,  PARAM_BROW_R_ANGLE: 0.15,  PARAM_BROW_L_FORM: 0.15,  PARAM_BROW_R_FORM: 0.15,  PARAM_MOUTH_FORM: 0.55,  PARAM_TERE: 0 },
    calm:       { PARAM_EYE_FORM: 0.15,  PARAM_EYE_BALL_FORM: 0,    PARAM_BROW_L_Y: 0.05,  PARAM_BROW_R_Y: 0.05,  PARAM_BROW_L_ANGLE: 0.05,  PARAM_BROW_R_ANGLE: 0.05,  PARAM_BROW_L_FORM: 0.05,  PARAM_BROW_R_FORM: 0.05,  PARAM_MOUTH_FORM: 0.3,   PARAM_TERE: 0 },
    excited:    { PARAM_EYE_FORM: 1,     PARAM_EYE_BALL_FORM: 0.4,  PARAM_BROW_L_Y: 0.6,   PARAM_BROW_R_Y: 0.6,   PARAM_BROW_L_ANGLE: 0.35,  PARAM_BROW_R_ANGLE: 0.35,  PARAM_BROW_L_FORM: 0.6,   PARAM_BROW_R_FORM: 0.6,   PARAM_MOUTH_FORM: 2,     PARAM_TERE: 0 },
    thinking:   { PARAM_EYE_FORM: -0.1,  PARAM_EYE_BALL_FORM: 0,    PARAM_BROW_L_Y: 0.3,   PARAM_BROW_R_Y: -0.1,  PARAM_BROW_L_ANGLE: 0.2,   PARAM_BROW_R_ANGLE: -0.1,  PARAM_BROW_L_FORM: 0.1,   PARAM_BROW_R_FORM: -0.2,  PARAM_MOUTH_FORM: -0.2,  PARAM_TERE: 0 },
    concerned:  { PARAM_EYE_FORM: 0.2,   PARAM_EYE_BALL_FORM: 0,    PARAM_BROW_L_Y: -0.2,  PARAM_BROW_R_Y: -0.2,  PARAM_BROW_L_ANGLE: 0.35,  PARAM_BROW_R_ANGLE: 0.35,  PARAM_BROW_L_FORM: -0.4,  PARAM_BROW_R_FORM: -0.4,  PARAM_MOUTH_FORM: -0.4,  PARAM_TERE: 0 },
    embarrassed:{ PARAM_EYE_FORM: 0.6,   PARAM_EYE_BALL_FORM: 0.2,  PARAM_BROW_L_Y: 0.1,   PARAM_BROW_R_Y: 0.1,   PARAM_BROW_L_ANGLE: 0.25,  PARAM_BROW_R_ANGLE: 0.25,  PARAM_BROW_L_FORM: -0.4,  PARAM_BROW_R_FORM: -0.4,  PARAM_MOUTH_FORM: 0.3,   PARAM_TERE: 1 },
    proud:      { PARAM_EYE_FORM: 0.2,   PARAM_EYE_BALL_FORM: 0,    PARAM_BROW_L_Y: 0.2,   PARAM_BROW_R_Y: 0.2,   PARAM_BROW_L_ANGLE: -0.1,  PARAM_BROW_R_ANGLE: -0.1,  PARAM_BROW_L_FORM: 0.1,   PARAM_BROW_R_FORM: 0.1,   PARAM_MOUTH_FORM: 0.9,   PARAM_TERE: 0 },
    curious:    { PARAM_EYE_FORM: 0.1,   PARAM_EYE_BALL_FORM: -0.3, PARAM_BROW_L_Y: 0.45,  PARAM_BROW_R_Y: 0.05,  PARAM_BROW_L_ANGLE: 0.1,   PARAM_BROW_R_ANGLE: -0.05, PARAM_BROW_L_FORM: 0.2,   PARAM_BROW_R_FORM: -0.1,  PARAM_MOUTH_FORM: 0.2,   PARAM_TERE: 0 },
  },
  kei_vowels_pro: {
    // ParamEyeLSmile/ParamEyeRSmile: 0=normal eye, 1=smile-squint (curved)
    // ParamBrowLY/RY: -1=low/furrowed, 0=neutral, 1=raised high
    // ParamBrowLForm/RForm: -1=angry inner-raised, 0=flat, 1=worried-arch
    // ParamCheek: 0=no blush, 1=full rosy blush
    // ParamEyeLOpen/ROpen: 0=closed, 1=normal, >1=wide open
    neutral:    { ParamBrowLY: 0,     ParamBrowRY: 0,     ParamBrowLForm: 0,    ParamBrowRForm: 0,    ParamCheek: 0,    ParamEyeLSmile: 0,    ParamEyeRSmile: 0    },
    happy:      { ParamBrowLY: 0.6,   ParamBrowRY: 0.6,   ParamBrowLForm: 0.7,  ParamBrowRForm: 0.7,  ParamCheek: 0.75, ParamEyeLSmile: 0.9,  ParamEyeRSmile: 0.9  },
    excited:    { ParamBrowLY: 0.9,   ParamBrowRY: 0.9,   ParamBrowLForm: 0.8,  ParamBrowRForm: 0.8,  ParamCheek: 0.7,  ParamEyeLSmile: 1.0,  ParamEyeRSmile: 1.0  },
    proud:      { ParamBrowLY: 0.3,   ParamBrowRY: 0.3,   ParamBrowLForm: 0.2,  ParamBrowRForm: 0.2,  ParamCheek: 0.2,  ParamEyeLSmile: 0.5,  ParamEyeRSmile: 0.5  },
    friendly:   { ParamBrowLY: 0.55,  ParamBrowRY: 0.55,  ParamBrowLForm: 0.55, ParamBrowRForm: 0.55, ParamCheek: 0.5,  ParamEyeLSmile: 0.75, ParamEyeRSmile: 0.75 },
    engaged:    { ParamBrowLY: 0.4,   ParamBrowRY: 0.4,   ParamBrowLForm: 0.35, ParamBrowRForm: 0.35, ParamCheek: 0.15, ParamEyeLSmile: 0.3,  ParamEyeRSmile: 0.3  },
    calm:       { ParamBrowLY: 0.05,  ParamBrowRY: 0.05,  ParamBrowLForm: 0.05, ParamBrowRForm: 0.05, ParamCheek: 0,    ParamEyeLSmile: 0.15, ParamEyeRSmile: 0.15 },
    curious:    { ParamBrowLY: 0.7,   ParamBrowRY: 0.1,   ParamBrowLForm: 0.4,  ParamBrowRForm: -0.2, ParamCheek: 0.1,  ParamEyeLSmile: 0.05, ParamEyeRSmile: 0    },
    thinking:   { ParamBrowLY: 0.45,  ParamBrowRY: -0.15, ParamBrowLForm: 0.3,  ParamBrowRForm: -0.35,ParamCheek: 0,    ParamEyeLSmile: 0,    ParamEyeRSmile: 0    },
    analytical: { ParamBrowLY: -0.25, ParamBrowRY: -0.25, ParamBrowLForm: -0.3, ParamBrowRForm: -0.3, ParamCheek: 0,    ParamEyeLSmile: 0,    ParamEyeRSmile: 0    },
    surprised:  { ParamBrowLY: 1.0,   ParamBrowRY: 1.0,   ParamBrowLForm: 0.4,  ParamBrowRForm: 0.4,  ParamCheek: 0.1,  ParamEyeLSmile: 0,    ParamEyeRSmile: 0    },
    sad:        { ParamBrowLY: -0.5,  ParamBrowRY: -0.5,  ParamBrowLForm: -0.7, ParamBrowRForm: -0.7, ParamCheek: 0,    ParamEyeLSmile: 0,    ParamEyeRSmile: 0    },
    concerned:  { ParamBrowLY: -0.35, ParamBrowRY: -0.35, ParamBrowLForm: -0.6, ParamBrowRForm: -0.6, ParamCheek: 0,    ParamEyeLSmile: 0,    ParamEyeRSmile: 0    },
    angry:      { ParamBrowLY: -0.7,  ParamBrowRY: -0.7,  ParamBrowLForm: -1.0, ParamBrowRForm: -1.0, ParamCheek: 0,    ParamEyeLSmile: 0,    ParamEyeRSmile: 0    },
    blushing:   { ParamBrowLY: 0.3,   ParamBrowRY: 0.3,   ParamBrowLForm: -0.4, ParamBrowRForm: -0.4, ParamCheek: 1.0,  ParamEyeLSmile: 0.55, ParamEyeRSmile: 0.55 },
    embarrassed:{ ParamBrowLY: 0.2,   ParamBrowRY: 0.2,   ParamBrowLForm: -0.5, ParamBrowRForm: -0.5, ParamCheek: 0.9,  ParamEyeLSmile: 0.4,  ParamEyeRSmile: 0.4  },
  },
  haru_greeter: {
    neutral:    { ParamBrowLY: 0,     ParamBrowRY: 0,     ParamBrowLAngle: 0,     ParamBrowRAngle: 0,     ParamBrowLForm: 0,     ParamBrowRForm: 0,     ParamMouthForm: 0,     ParamTere: 0,   ParamTear: 0,   ParamFaceForm: 0,     ParamBodyUpper: 0 },
    happy:      { ParamBrowLY: 0.4,   ParamBrowRY: 0.4,   ParamBrowLAngle: 0.3,   ParamBrowRAngle: 0.3,   ParamBrowLForm: 0.5,   ParamBrowRForm: 0.5,   ParamMouthForm: 1.5,   ParamTere: 0,   ParamTear: 0,   ParamFaceForm: 0.3,   ParamBodyUpper: 8 },
    angry:      { ParamBrowLY: -0.5,  ParamBrowRY: -0.5,  ParamBrowLAngle: -0.6,  ParamBrowRAngle: -0.6,  ParamBrowLForm: -0.7,  ParamBrowRForm: -0.7,  ParamMouthForm: -1.5,  ParamTere: 0,   ParamTear: 0,   ParamFaceForm: -0.2,  ParamBodyUpper: -5 },
    sad:        { ParamBrowLY: -0.3,  ParamBrowRY: -0.3,  ParamBrowLAngle: 0.45,  ParamBrowRAngle: 0.45,  ParamBrowLForm: -0.6,  ParamBrowRForm: -0.6,  ParamMouthForm: -0.8,  ParamTere: 0,   ParamTear: 0.8, ParamFaceForm: 0.1,   ParamBodyUpper: -8 },
    surprised:  { ParamBrowLY: 0.7,   ParamBrowRY: 0.7,   ParamBrowLAngle: 0.1,   ParamBrowRAngle: 0.1,   ParamBrowLForm: 0.5,   ParamBrowRForm: 0.5,   ParamMouthForm: -0.5,  ParamTere: 0,   ParamTear: 0,   ParamFaceForm: -0.3,  ParamBodyUpper: 10 },
    blushing:   { ParamBrowLY: 0.15,  ParamBrowRY: 0.15,  ParamBrowLAngle: 0.3,   ParamBrowRAngle: 0.3,   ParamBrowLForm: -0.4,  ParamBrowRForm: -0.4,  ParamMouthForm: 0.4,   ParamTere: 1,   ParamTear: 0,   ParamFaceForm: 0.15,  ParamBodyUpper: 0 },
    calm:       { ParamBrowLY: 0,     ParamBrowRY: 0,     ParamBrowLAngle: 0,     ParamBrowRAngle: 0,     ParamBrowLForm: 0,     ParamBrowRForm: 0,     ParamMouthForm: 0.3,   ParamTere: 0,   ParamTear: 0,   ParamFaceForm: 0,     ParamBodyUpper: 0 },
    analytical: { ParamBrowLY: -0.15, ParamBrowRY: -0.15, ParamBrowLAngle: -0.15, ParamBrowRAngle: -0.15, ParamBrowLForm: -0.15, ParamBrowRForm: -0.15, ParamMouthForm: 0,     ParamTere: 0,   ParamTear: 0,   ParamFaceForm: -0.1,  ParamBodyUpper: -3 },
    friendly:   { ParamBrowLY: 0.3,   ParamBrowRY: 0.3,   ParamBrowLAngle: 0.2,   ParamBrowRAngle: 0.2,   ParamBrowLForm: 0.3,   ParamBrowRForm: 0.3,   ParamMouthForm: 1.0,   ParamTere: 0,   ParamTear: 0,   ParamFaceForm: 0.2,   ParamBodyUpper: 5 },
    engaged:    { ParamBrowLY: 0.25,  ParamBrowRY: 0.25,  ParamBrowLAngle: 0.15,  ParamBrowRAngle: 0.15,  ParamBrowLForm: 0.15,  ParamBrowRForm: 0.15,  ParamMouthForm: 0.6,   ParamTere: 0,   ParamTear: 0,   ParamFaceForm: 0.15,  ParamBodyUpper: 3 },
    excited:    { ParamBrowLY: 0.55,  ParamBrowRY: 0.55,  ParamBrowLAngle: 0.35,  ParamBrowRAngle: 0.35,  ParamBrowLForm: 0.6,   ParamBrowRForm: 0.6,   ParamMouthForm: 2,     ParamTere: 0,   ParamTear: 0,   ParamFaceForm: 0.35,  ParamBodyUpper: 12 },
    thinking:   { ParamBrowLY: 0.3,   ParamBrowRY: -0.1,  ParamBrowLAngle: 0.2,   ParamBrowRAngle: -0.1,  ParamBrowLForm: 0.1,   ParamBrowRForm: -0.2,  ParamMouthForm: -0.2,  ParamTere: 0,   ParamTear: 0,   ParamFaceForm: 0,     ParamBodyUpper: -2 },
    concerned:  { ParamBrowLY: -0.25, ParamBrowRY: -0.25, ParamBrowLAngle: 0.4,   ParamBrowRAngle: 0.4,   ParamBrowLForm: -0.5,  ParamBrowRForm: -0.5,  ParamMouthForm: -0.5,  ParamTere: 0,   ParamTear: 0,   ParamFaceForm: 0,     ParamBodyUpper: -4 },
    embarrassed:{ ParamBrowLY: 0.1,   ParamBrowRY: 0.1,   ParamBrowLAngle: 0.25,  ParamBrowRAngle: 0.25,  ParamBrowLForm: -0.35, ParamBrowRForm: -0.35, ParamMouthForm: 0.5,   ParamTere: 1,   ParamTear: 0,   ParamFaceForm: 0.1,   ParamBodyUpper: 0 },
    proud:      { ParamBrowLY: 0.25,  ParamBrowRY: 0.25,  ParamBrowLAngle: -0.1,  ParamBrowRAngle: -0.1,  ParamBrowLForm: 0.15,  ParamBrowRForm: 0.15,  ParamMouthForm: 1.1,   ParamTere: 0,   ParamTear: 0,   ParamFaceForm: 0.1,   ParamBodyUpper: 6 },
    curious:    { ParamBrowLY: 0.45,  ParamBrowRY: 0.05,  ParamBrowLAngle: 0.1,   ParamBrowRAngle: -0.05, ParamBrowLForm: 0.25,  ParamBrowRForm: -0.1,  ParamMouthForm: 0.3,   ParamTere: 0,   ParamTear: 0,   ParamFaceForm: 0.1,   ParamBodyUpper: 2 },
  },
};

const MODEL_PARAMS: Record<string, { eye: string[]; hasVowels?: boolean; hasMotions?: boolean }> = {
  'haru':            { eye: ['PARAM_EYE_L_OPEN', 'PARAM_EYE_R_OPEN'] },
  'izumi_anime_01':  { eye: ['PARAM_EYE_L_OPEN', 'PARAM_EYE_R_OPEN'] },
  'kei_vowels_pro':  { eye: ['ParamEyeLOpen', 'ParamEyeROpen'], hasVowels: true, hasMotions: true },
  'haru_greeter':    { eye: [] },
};

const KEI_SHAPES: Record<string, Record<string, number>> = {
  Silence: { ParamMouthOpenY: 0, ParamA: 0, ParamI: 0, ParamU: 0, ParamE: 0, ParamO: 0 },
  A:       { ParamMouthOpenY: 1, ParamA: 1, ParamI: 0, ParamU: 0, ParamE: 0, ParamO: 0 },
  I:       { ParamMouthOpenY: 1, ParamA: 0, ParamI: 1, ParamU: 0, ParamE: 0, ParamO: 0 },
  U:       { ParamMouthOpenY: 1, ParamA: 0, ParamI: 0, ParamU: 1, ParamE: 0, ParamO: 0 },
  E:       { ParamMouthOpenY: 1, ParamA: 0, ParamI: 0, ParamU: 0, ParamE: 1, ParamO: 0 },
  O:       { ParamMouthOpenY: 1, ParamA: 0, ParamI: 0, ParamU: 0, ParamE: 0, ParamO: 1 },
};

const VOWEL_CYCLE = ['A', 'O', 'I', 'A', 'U', 'E', 'A', 'O'] as const;

// Emotion → best gesture group PER MODEL
// haru has: Tap, Flick, FlickRight, FlickLeft, Flick3, Shake
// izumi has: Tap, FlickRight, FlickLeft, Shake (no Flick, no Flick3!)
const HARU_EMOTION_GROUP: Record<string, string> = {
  neutral: 'Tap', happy: 'Tap', excited: 'Shake', proud: 'Tap',
  friendly: 'Tap', engaged: 'Flick', surprised: 'Flick3',
  sad: 'FlickLeft', concerned: 'FlickLeft', thinking: 'FlickRight',
  curious: 'Flick', calm: 'Tap', analytical: 'FlickRight',
  blushing: 'Tap', embarrassed: 'Flick3',
};
const IZUMI_EMOTION_GROUP: Record<string, string> = {
  neutral: 'Tap', happy: 'Tap', excited: 'Shake', proud: 'Tap',
  friendly: 'Tap', engaged: 'FlickRight', surprised: 'Shake',
  sad: 'FlickLeft', concerned: 'FlickLeft', thinking: 'FlickRight',
  curious: 'FlickRight', calm: 'Tap', analytical: 'FlickRight',
  blushing: 'Tap', embarrassed: 'FlickLeft',
};
const HARU_ALL_GROUPS   = ['Tap', 'Flick', 'FlickRight', 'FlickLeft', 'Flick3', 'Shake'];
const IZUMI_ALL_GROUPS  = ['Tap', 'FlickRight', 'FlickLeft', 'Shake'];

// Expression (.exp3.json) name maps for haru and izumi_anime_01
const HARU_EXPRESSIONS: Record<string, string> = {
  happy:      'Smile',      excited:    'Smile',      proud:      'Smile',
  friendly:   'Smile',      engaged:    'Smile',      curious:    'Smile',
  angry:      'Angry',
  sad:        'Sad',        concerned:  'Sad',
  surprised:  'Surprised',
  blushing:   'Blushing',   embarrassed:'Blushing',
  neutral:    'Normal',     calm:       'Normal',     analytical: 'Normal',  thinking: 'Normal',
};
const IZUMI_EXPRESSIONS: Record<string, string> = {
  happy:      'Smile.exp3.json',      excited:    'Smile.exp3.json',
  proud:      'Smile.exp3.json',      friendly:   'Smile.exp3.json',
  engaged:    'Smile.exp3.json',      curious:    'Smile.exp3.json',
  angry:      'Angry.exp3.json',
  sad:        'Sad.exp3.json',        concerned:  'Sad.exp3.json',
  surprised:  'Surprised.exp3.json',
  blushing:   'Blushing.exp3.json',   embarrassed:'Blushing.exp3.json',
  neutral:    'Normal.exp3.json',     calm:       'Normal.exp3.json',
  analytical: 'f01.exp3.json',        thinking:   'f01.exp3.json',
};

// Greeter: 26 motions segmented by energy level

// Expressiveness multiplier per emotion (scales sway/gesture amplitude)
const EXPR_SCALE: Record<string, number> = {
  excited: 2.5, happy: 2.0, surprised: 2.2, proud: 1.6, angry: 1.8,
  sad: 0.5, concerned: 0.6, calm: 0.4, neutral: 1.0, analytical: 0.7,
  thinking: 0.6, curious: 1.2, friendly: 1.5, engaged: 1.3,
  blushing: 0.8, embarrassed: 0.7,
};

interface MicroExpression {
  params: Record<string, number>;
  duration: number;
  elapsed: number;
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function modelKeyFromPath(path: string): string {
  return path.split('/').filter(Boolean)[1] || '';
}

export class Live2DManager {
  private canvas:      HTMLCanvasElement  = null;
  private glManager:   LAppGlManager      = null;
  private texManager:  LAppTextureManager = null;
  private model:       LAppModel          = null;
  private frameBuffer: WebGLFramebuffer   = null;
  private rafId:       number             = null;
  private ro:          ResizeObserver     = null;
  private needResize   = false;
  private modelReady   = false;
  private modelPath:   string             = null;
  private modelKey:    string             = null;

  private amplitudeRef: { current: number } = { current: 0 };
  private scaleRef:    { current: number } = { current: 1 };
  private idCache: Map<string, CubismIdHandle> = new Map();

  // Eye blink
  private blinkTimer = 0;
  private blinkPhase = 0;
  private blinkValue = 1.0;
  private nextBlink  = 2.5 + Math.random() * 4;
  private pendingDoubleBlink = false;

  // Micro-saccade
  private saccadeTimer    = 2.5 + Math.random() * 3.5;
  private saccadePhase    = 0;
  private saccadeElapsed  = 0;
  private saccadeTargetX  = 0;
  private saccadeTargetY  = 0;
  private saccadeCurrentX = 0;
  private saccadeCurrentY = 0;

  // Breath
  private breathPhase = Math.random() * Math.PI * 2;

  // Multi-harmonic sway
  private swayPhase  = Math.random() * Math.PI * 2;
  private swayPhase2 = Math.random() * Math.PI * 2;
  private swayPhase3 = Math.random() * Math.PI * 2;

  // Kei vowels
  private vowelPhase    = 0;
  private vowelIdx      = 0;
  private vowelSmoothed = 0;
  private prevVowelValues: Record<string, number> = {};

  // Phoneme timeline
  private phonemeTimeline:   PhonemeEvent[] = [];
  private phonemeStartTime:  number         = 0;
  private phonemeCurrentIdx: number         = 0;

  // Emotion
  private currentEmotion:  string                 = 'neutral';
  private emotionTargets:  Record<string, number> = {};
  private emotionCurrent:  Record<string, number> = {};
  private emotionIntensity: number                = 1.0;

  // Micro-expression
  private microExpr: MicroExpression | null = null;

  // Speaking
  private isSpeaking:          boolean = false;
  private lipSyncSmoothed:     number  = 0;   // Smoothed amplitude for haru/izumi mouth open
  private speakingLingerTimer: number  = 0;
  private readonly SPEAKING_LINGER     = 1.2;
  private speechIntensity:     number  = 0;

  private pendingExpression: string | null = null;
  private speakGestureTimer:   number  = 0;  // haru_greeter: re-fires talking motion mid-speech

  // ── Public API ──────────────────────────────────────────────────────────────

  async initialize(canvasEl: HTMLCanvasElement, modelPath: string, amplitudeRef?: { current: number }, scaleRef?: { current: number }): Promise<boolean> {
    this.canvas    = canvasEl;
    this.modelPath = modelPath;
    this.modelKey  = modelKeyFromPath(modelPath);
    if (amplitudeRef) this.amplitudeRef = amplitudeRef;
    if (scaleRef)     this.scaleRef     = scaleRef;

    this.glManager = new LAppGlManager();
    if (!this.glManager.initialize(this.canvas)) { console.error('WebGL2 unavailable'); return false; }

    this.resizeCanvas();
    LAppPal.updateTime();

    const opt = new Option();
    opt.logFunction  = LAppPal.printMessage;
    opt.loggingLevel = LAppDefine.CubismLoggingLevel;
    CubismFramework.startUp(opt);
    CubismFramework.initialize();

    this.texManager = new LAppTextureManager();
    this.texManager.setGlManager(this.glManager);

    const gl = this.gl();
    this.frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.patchShaderManager();
    this.loadModel();

    this.setEmotion(DEFAULT_MOOD[this.modelKey] ?? 'neutral');

    this.ro = new ResizeObserver(() => { this.needResize = true; });
    this.ro.observe(this.canvas);
    this.startLoop();
    console.log('Live2D initialized:', modelPath);
    return true;
  }

  async switchModel(modelPath: string): Promise<void> {
    this.modelPath  = modelPath;
    this.modelKey   = modelKeyFromPath(modelPath);
    this.modelReady = false;
    this.model      = null;
    this._resetState();
    this.loadModel();
    this.setEmotion(DEFAULT_MOOD[this.modelKey] ?? 'neutral');
    console.log('Switching to:', modelPath);
  }

  /**
   * Called by AvatarCanvas whenever the CSS transform scale changes.
   * Forces a canvas buffer resize so the WebGL output matches the new
   * visual size — prevents blurriness on desktop zoom-in.
   */
  public notifyScaleChange(): void {
    this.resizeCanvas();
    // Also update the viewport on the next frame so the model matrix is
    // recalculated at the correct aspect ratio.
    this.needResize = false; // resizeCanvas already ran; clear the flag
    const gl = this.glManager?.getGl();
    if (gl) gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }

  public setSpeakingState(speaking: boolean): void {
    this.isSpeaking = speaking;
    if (speaking) {
      this.speakingLingerTimer = 0;
      this.speakGestureTimer   = 0;  // fire immediately on speech start
      this._triggerSpeakGesture();
    } else {
      this.speakingLingerTimer = this.SPEAKING_LINGER;
    }
  }

  public setPhonemeTimeline(events: PhonemeEvent[]): void {
    this.phonemeTimeline   = [...events].sort((a, b) => a.time - b.time);
    this.phonemeStartTime  = performance.now() / 1000;
    this.phonemeCurrentIdx = 0;
  }

  public setEmotion(emotion: string, intensity: number = 1.0): void {
    this.currentEmotion   = emotion;
    this.emotionIntensity = Math.max(0, Math.min(1, intensity));
    const modelEmotions   = EMOTION_PARAMS[this.modelKey];
    if (!modelEmotions) return;
    const targets = modelEmotions[emotion] ?? modelEmotions['neutral'] ?? {};
    this.emotionTargets = { ...targets };
    // Trigger built-in expression files for models that have them
    if (this.modelReady && this.model) {
      if (this.modelKey === 'haru') {
        const exprName = HARU_EXPRESSIONS[emotion];
        if (exprName) (this.model as any).setExpression?.(exprName);
      } else if (this.modelKey === 'izumi_anime_01') {
        const exprName = IZUMI_EXPRESSIONS[emotion];
        if (exprName) (this.model as any).setExpression?.(exprName);
      }
    } else {
      // Defer expression application until model is ready
      if (this.modelKey === 'haru') this.pendingExpression = HARU_EXPRESSIONS[emotion] ?? null;
      else if (this.modelKey === 'izumi_anime_01') this.pendingExpression = IZUMI_EXPRESSIONS[emotion] ?? null;
    }
    this._flashMicroExpression(emotion);
  }

  public flashExpression(emotion: string, durationSec: number = 0.4): void {
    const modelEmotions = EMOTION_PARAMS[this.modelKey];
    if (!modelEmotions) return;
    const targets = modelEmotions[emotion] ?? {};
    const boosted: Record<string, number> = {};
    for (const [k, v] of Object.entries(targets)) boosted[k] = v * 1.4;
    this.microExpr = { params: boosted, duration: durationSec, elapsed: 0 };
  }

  updateLipSync(amplitude: number): void {
    this.amplitudeRef.current = amplitude;
  }

  destroy(): void {
    this.ro?.disconnect();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.model = null;
    this.modelReady = false;
    this.texManager?.release();
    this.glManager?.release();
    CubismFramework.dispose();
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private gl() { return this.glManager.getGl(); }

  private id(name: string): CubismIdHandle {
    if (!this.idCache.has(name)) this.idCache.set(name, CubismFramework.getIdManager().getId(name));
    return this.idCache.get(name);
  }

  private _resetState(): void {
    this.vowelPhase = 0; this.vowelIdx = 0; this.vowelSmoothed = 0; this.prevVowelValues = {};
    this.phonemeTimeline = []; this.phonemeStartTime = 0; this.phonemeCurrentIdx = 0;
    this.emotionTargets = {}; this.emotionCurrent = {};
    this.isSpeaking = false; this.speakingLingerTimer = 0; this.speechIntensity = 0; this.lipSyncSmoothed = 0;
    this.speakGestureTimer = 0;
    this.microExpr = null; this.blinkTimer = 0; this.blinkPhase = 0; this.blinkValue = 1;
    this.pendingExpression = null;
    this.swayPhase  = Math.random() * Math.PI * 2;
    this.swayPhase2 = Math.random() * Math.PI * 2;
    this.swayPhase3 = Math.random() * Math.PI * 2;
    this.breathPhase = Math.random() * Math.PI * 2;
    this.idleGestureTimer = 8 + Math.random() * 10;
    this.saccadeTimer = 2.5 + Math.random() * 3.5;
    this.saccadePhase = 0; this.saccadeCurrentX = 0; this.saccadeCurrentY = 0;
  }

  private _triggerSpeakGesture(): void {
    if (!this.modelReady || !this.model) return;
    if (this.modelKey === 'haru') {
      const group = HARU_EMOTION_GROUP[this.currentEmotion] ?? 'Tap';
      (this.model as any).startRandomMotion?.(group, 2);
      // Trigger the built-in expression file to reinforce the emotion visually
      const exprName = HARU_EXPRESSIONS[this.currentEmotion];
      if (exprName) (this.model as any).setExpression?.(exprName);
    } else if (this.modelKey === 'izumi_anime_01') {
      // Use izumi-specific groups (no Flick or Flick3)
      const group = IZUMI_EMOTION_GROUP[this.currentEmotion] ?? 'Tap';
      (this.model as any).startRandomMotion?.(group, 2);
      // Trigger built-in expression file for izumi
      const exprName = IZUMI_EXPRESSIONS[this.currentEmotion];
      if (exprName) (this.model as any).setExpression?.(exprName);
    } else if (this.modelKey === 'haru_greeter') {
      // Map emotions to the most fitting motion group
      // Expressive = animated, energetic gestures (happy, excited, proud, friendly)
      // Casual     = relaxed, conversational (neutral, engaged, calm)
      // Thoughtful = slower, introspective (thinking, sad, concerned, analytical)
      const greeterSpeakGroup: Record<string, string> = {
        happy: 'Expressive', excited: 'Expressive', proud: 'Expressive',
        friendly: 'Expressive', surprised: 'Expressive', blushing: 'Expressive',
        neutral: 'Casual', engaged: 'Casual', calm: 'Casual', curious: 'Casual',
        thinking: 'Thoughtful', sad: 'Thoughtful', concerned: 'Thoughtful',
        analytical: 'Thoughtful', embarrassed: 'Thoughtful',
      };
      (this.model as any).startRandomMotion?.(greeterSpeakGroup[this.currentEmotion] ?? 'Casual', 2);
    } else if (this.modelKey === 'kei_vowels_pro') {
      // Kei has 4 motions in group "" (EN/JP/KO/ZH) — eye + hair animation
      (this.model as any).startRandomMotion?.('', 2);
    }
  }

  private _triggerIdleGesture(): void {
    if (!this.modelReady || !this.model || this.isSpeaking) return;
    if (this.modelKey === 'haru') {
      (this.model as any).startRandomMotion?.(pick(HARU_ALL_GROUPS), 1);
      const exprName = HARU_EXPRESSIONS[this.currentEmotion];
      if (exprName && Math.random() < 0.5) (this.model as any).setExpression?.(exprName);
    } else if (this.modelKey === 'izumi_anime_01') {
      (this.model as any).startRandomMotion?.(pick(IZUMI_ALL_GROUPS), 1);
      const exprName = IZUMI_EXPRESSIONS[this.currentEmotion];
      if (exprName && Math.random() < 0.5) (this.model as any).setExpression?.(exprName);
    } else if (this.modelKey === 'haru_greeter') {
      // During idle: prefer Idle (calm breathing) or Casual (gentle gestures)
      // Never fire Expressive during idle — it looks wrong when not speaking
      const idleGroup = Math.random() < 0.4 ? 'Idle' : 'Casual';
      (this.model as any).startRandomMotion?.(idleGroup, 1);
    } else if (this.modelKey === 'kei_vowels_pro') {
      // Only trigger kei motions occasionally during idle (they have audio attached)
      if (Math.random() < 0.3) (this.model as any).startRandomMotion?.('', 1);
    }
  }

  private _flashMicroExpression(emotion: string): void {
    if (emotion === 'neutral' || emotion === 'calm') return;
    const modelEmotions = EMOTION_PARAMS[this.modelKey];
    if (!modelEmotions) return;
    const targets = modelEmotions[emotion] ?? {};
    if (!Object.keys(targets).length) return;
    const boosted: Record<string, number> = {};
    for (const [k, v] of Object.entries(targets)) boosted[k] = v * 1.5;
    // Longer duration (0.35s) and stronger boost so the flash is actually visible
    this.microExpr = { params: boosted, duration: 0.35, elapsed: 0 };
  }

  private patchShaderManager(): void {
    const gl = this.gl();
    CubismShaderManager_WebGL.getInstance().setGlContext(gl);
    const shader = CubismShaderManager_WebGL.getInstance().getShader(gl);
    if (!shader) return;
    Object.assign(shader, shaderSources);
    (shader as any).generateShaders = function (this: any) {
      if (this._isShaderLoading) return;
      this._isShaderLoading = true;
      this._isShaderLoaded  = false;
      this._shaderSets.length = this._shaderCount;
      for (let i = 0; i < this._shaderCount; i++) this._shaderSets[i] = new CubismShaderSet();
      try { this.registerShader(); this.registerBlendShader(); this._isShaderLoaded = true; this._isShaderLoading = false; console.log('Shaders compiled'); }
      catch (e) { this._isShaderLoading = false; console.error('Shader error:', e); }
    };
  }

  private makeShim() {
    const self = this;
    return {
      getGl:             () => self.glManager.getGl(),
      getGlManager:      () => self.glManager,
      getTextureManager: () => self.texManager,
      getFrameBuffer:    () => self.frameBuffer,
      getCanvas:         () => self.canvas,
      getLive2DManager:  () => null,
      createShader:      () => null,
    };
  }

  private loadModel(): void {
    const lastSlash = this.modelPath.lastIndexOf('/');
    const mdl = new LAppModel();
    mdl.setSubdelegate(this.makeShim() as any);
    mdl.setAmplitudeRef(this.amplitudeRef);
    mdl.setPostSchedulerHook((cm, dt) => this.applyParams(cm, dt));
    mdl.loadAssets(this.modelPath.substring(0, lastSlash + 1), this.modelPath.substring(lastSlash + 1));
    this.model = mdl;
  }

  private resizeCanvas(): void {
    const dpr        = window.devicePixelRatio || 1;
    const cssScale   = this.scaleRef?.current ?? 1;
    // Multiply by cssScale so the WebGL framebuffer resolution matches the
    // physically-rendered size after CSS transform: scale().  Without this,
    // zooming in on desktop just stretches the fixed-size buffer, causing blur.
    const pixelScale = dpr * cssScale;
    this.canvas.width  = Math.max(this.canvas.clientWidth,  1) * pixelScale;
    this.canvas.height = Math.max(this.canvas.clientHeight, 1) * pixelScale;
    const gl = this.glManager?.getGl();
    if (gl) gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }

  private startLoop(): void {
    const tick = () => { this.rafId = requestAnimationFrame(tick); this.frame(); };
    tick();
  }

  private frame(): void {
    const gl = this.gl();
    if (gl.isContextLost()) return;
    if (this.needResize) { this.resizeCanvas(); this.needResize = false; }
    LAppPal.updateTime();
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearDepth(1.0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    if (!this.model) return;
    if ((this.model as any)._state < LOAD_COMPLETE) return;
    if (!this.modelReady) {
      this.model.setAmplitudeRef(this.amplitudeRef);
      console.log('Model ready:', this.modelPath);
      this.modelReady = true;
      // Apply any deferred expression
      if (this.pendingExpression) {
        (this.model as any).setExpression?.(this.pendingExpression);
        this.pendingExpression = null;
      }
    }
    CubismWebGLOffscreenManager.getInstance().beginFrameProcess(gl);
    const { width, height } = this.canvas;
    const proj = new CubismMatrix44();
    const cm = this.model.getModel();
    if (cm) {
      if (cm.getCanvasWidth() > 1.0 && width < height) { this.model.getModelMatrix().setWidth(2.0); proj.scale(1.0, width / height); }
      else proj.scale(height / width, 1.0);
    }
    this.model.update();
    this.model.draw(proj);
    CubismWebGLOffscreenManager.getInstance().endFrameProcess(gl);
    CubismWebGLOffscreenManager.getInstance().releaseStaleRenderTextures(gl);
  }

  /**
   * Post-scheduler hook — runs every frame after Live2D's internal scheduler.
   * Everything here is layered ON TOP of the native motion data.
   *
   * System order:
   *   1. Speaking linger + speech intensity smoothing
   *   2. Idle gesture scheduler
   *   3. Kei vowel lip sync (phoneme or amplitude)
   *   4. Eye blink with natural timing (haru/izumi)
   *   5. Micro-saccade eye darts — simulates conscious attention
   *   6. Breath oscillator — organic chest movement
   *   7. Multi-harmonic head/body sway — emotion-scaled, speech-amplified
   *   8. Emotion parameter lerp — fast for urgent, slow for calm
   *   9. Micro-expression flash — 180ms overshoot impulse on emotion change
   */
  private applyParams(cm: import('@framework/model/cubismmodel').CubismModel, _dt: number): void {
    const dt = LAppPal.getDeltaTime();
    const params = MODEL_PARAMS[this.modelKey] || { eye: [] };

    // ── 1. Speaking linger & speech intensity ─────────────────────────────────
    if (this.speakingLingerTimer > 0) { this.speakingLingerTimer -= dt; if (this.speakingLingerTimer < 0) this.speakingLingerTimer = 0; }
    const rawAmp = this.amplitudeRef.current ?? 0;
    const atkFactor = this.isSpeaking ? 0.5 : 0.1;
    this.speechIntensity = Math.max(0, Math.min(1, this.speechIntensity + (rawAmp - this.speechIntensity) * atkFactor));

    // ── 2. Gesture schedulers ─────────────────────────────────────────────────
    if (!this.isSpeaking) {
      this.idleGestureTimer -= dt;
      if (this.idleGestureTimer <= 0) { this._triggerIdleGesture(); this.idleGestureTimer = 10 + Math.random() * 14; }
    } else if (this.modelKey === 'haru_greeter') {
      // Re-fire a new talking motion every few seconds so the animation never dies mid-speech
      this.speakGestureTimer -= dt;
      if (this.speakGestureTimer <= 0) {
        this._triggerSpeakGesture();
        // Duration varies by emotion: expressive motions are longer; cycle them naturally
        const base = this.currentEmotion === 'excited' || this.currentEmotion === 'happy' ? 3.5
                   : this.currentEmotion === 'thinking' || this.currentEmotion === 'concerned' ? 4.5
                   : 4.0;
        this.speakGestureTimer = base + Math.random() * 1.5;
      }
    }

    // ── 3. Kei vowel lip sync ─────────────────────────────────────────────────
    if (params.hasVowels) {
      if (this.phonemeTimeline.length > 0) {
        const elapsed = (performance.now() / 1000) - this.phonemeStartTime;
        while (this.phonemeCurrentIdx < this.phonemeTimeline.length - 1 && this.phonemeTimeline[this.phonemeCurrentIdx + 1].time <= elapsed) this.phonemeCurrentIdx++;
        const targetShape = KEI_SHAPES[this.phonemeTimeline[this.phonemeCurrentIdx]?.phoneme ?? 'Silence'] ?? KEI_SHAPES.Silence;
        for (const [p, t] of Object.entries(targetShape)) {
          const prev = this.prevVowelValues[p] ?? 0;
          const next = prev + (t - prev) * 0.55;  // faster smoothing for snappier lip sync
          this.prevVowelValues[p] = next;
          try { cm.setParameterValueById(this.id(p), next); } catch (_) {}
        }
      } else {
        this.vowelSmoothed = Math.max(0, Math.min(1, this.vowelSmoothed + (rawAmp - this.vowelSmoothed) * 0.4));
        const amp = this.vowelSmoothed;
        let targetShape: Record<string, number>;
        if (amp > 0.05) {
          this.vowelPhase += dt * (3.5 + amp * 4.5);
          if (this.vowelPhase >= 1.0) { this.vowelPhase -= 1.0; this.vowelIdx = (this.vowelIdx + 1) % VOWEL_CYCLE.length; }
          const base = KEI_SHAPES[VOWEL_CYCLE[this.vowelIdx]];
          targetShape = {};
          for (const k of Object.keys(base)) targetShape[k] = base[k] * amp;
        } else {
          targetShape = KEI_SHAPES.Silence;
        }
        for (const [p, t] of Object.entries(targetShape)) {
          const prev = this.prevVowelValues[p] ?? 0;
          const next = prev + (t - prev) * 0.5;
          this.prevVowelValues[p] = next;
          try { cm.setParameterValueById(this.id(p), next); } catch (_) {}
        }
      }
    }

    // ── 3b. Haru / Izumi full lip sync control ─────────────────────────────────
    // We take COMPLETE ownership of PARAM_MOUTH_OPEN_Y for haru and izumi ONLY.
    // haru_greeter is EXCLUDED — its baked motions contain full talking animations
    // with ParamMouthOpenY values up to 8.0. Overriding them would kill the animation.
    if (this.modelKey === 'haru' || this.modelKey === 'izumi_anime_01') {
      const rawAmpClamped = Math.max(0, Math.min(1, rawAmp));
      // Asymmetric smoothing: fast attack (mouth snaps open with audio peak),
      // faster release (mouth closes crisply between syllables).
      // No floor offset — mouth must fully close on silence for crisp lip sync.
      const attackRate  = rawAmpClamped > this.lipSyncSmoothed ? 0.45 : 0.08;
      this.lipSyncSmoothed = this.lipSyncSmoothed + (rawAmpClamped - this.lipSyncSmoothed) * attackRate;
      const floor     = this.isSpeaking ? 0.18 : 0;
      const mouthOpen = Math.min(1, floor + this.lipSyncSmoothed * 0.9);
      try { cm.setParameterValueById(this.id('PARAM_MOUTH_OPEN_Y'), mouthOpen); } catch (_) {}
    }
    if (params.eye.length > 0) {
      this.blinkTimer += dt;
      const blinkBase = this.isSpeaking ? 2.8 : 4.2;
      if (this.blinkPhase === 0 && this.blinkTimer >= this.nextBlink) {
        this.blinkPhase = 1; this.blinkTimer = 0;
        this.pendingDoubleBlink = Math.random() < 0.18;
      }
      if (this.blinkPhase === 1) { this.blinkValue -= dt / 0.07; if (this.blinkValue <= 0) { this.blinkValue = 0; this.blinkPhase = 2; this.blinkTimer = 0; } }
      if (this.blinkPhase === 2) { if (this.blinkTimer >= 0.035) { this.blinkPhase = 3; this.blinkTimer = 0; } }
      if (this.blinkPhase === 3) {
        this.blinkValue += dt / 0.11;
        if (this.blinkValue >= 1) {
          this.blinkValue = 1; this.blinkPhase = 0; this.blinkTimer = 0;
          this.nextBlink = this.pendingDoubleBlink ? 0.18 : blinkBase + Math.random() * 3.0;
          this.pendingDoubleBlink = false;
        }
      }
      params.eye.forEach(eId => { try { cm.setParameterValueById(this.id(eId), this.blinkValue); } catch (_) {} });
    }

    // ── 5. Micro-saccade ──────────────────────────────────────────────────────
    this.saccadeTimer -= dt;
    if (this.saccadeTimer <= 0 && this.saccadePhase === 0) {
      // Wider saccade range when speaking or in expressive emotion
      const saccadeRange = this.isSpeaking ? 0.28 : 0.22;
      this.saccadeTargetX = (Math.random() * 2 - 1) * saccadeRange;
      this.saccadeTargetY = (Math.random() * 2 - 1) * (saccadeRange * 0.65);
      this.saccadePhase = 1; this.saccadeElapsed = 0;
      // More frequent saccades when speaking
      this.saccadeTimer = this.isSpeaking ? 1.2 + Math.random() * 2.0 : 2.0 + Math.random() * 3.0;
    }
    if (this.saccadePhase === 1) {
      this.saccadeElapsed += dt;
      const t = Math.min(1, this.saccadeElapsed / 0.12);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      this.saccadeCurrentX += (this.saccadeTargetX - this.saccadeCurrentX) * ease * 0.5;
      this.saccadeCurrentY += (this.saccadeTargetY - this.saccadeCurrentY) * ease * 0.5;
      if (this.saccadeElapsed >= 0.24) { this.saccadePhase = 0; this.saccadeCurrentX *= 0.3; this.saccadeCurrentY *= 0.3; }
    } else {
      this.saccadeCurrentX *= (1 - dt * 0.8);
      this.saccadeCurrentY *= (1 - dt * 0.8);
    }
    try { cm.addParameterValueById('PARAM_EYE_BALL_X', this.saccadeCurrentX); cm.addParameterValueById('PARAM_EYE_BALL_Y', this.saccadeCurrentY); } catch (_) {}
    try { cm.addParameterValueById('ParamEyeBallX',    this.saccadeCurrentX); cm.addParameterValueById('ParamEyeBallY',    this.saccadeCurrentY); } catch (_) {}

    // ── 6. Breath oscillator ──────────────────────────────────────────────────
    const breathSpeed = this.isSpeaking ? 0.35 : 0.22;
    const breathAmp   = this.isSpeaking ? 0.10 + this.speechIntensity * 0.04 : 0.06;
    this.breathPhase += dt * breathSpeed * Math.PI * 2;
    const breathVal = Math.sin(this.breathPhase) * breathAmp;
    try { cm.addParameterValueById('PARAM_BREATH', breathVal); } catch (_) {}
    try { cm.addParameterValueById('ParamBreath',  breathVal); } catch (_) {}
    try { cm.addParameterValueById('PARAM_BUST_Y', breathVal * 0.4); } catch (_) {}

    // ── 7. Multi-harmonic head/body sway ──────────────────────────────────────
    // haru_greeter: motions contain fully baked body/head animation for every frame.
    // Adding our own sway on top doubles the movement and looks abnormal. Skip it.
    const isGreeter = this.modelKey === 'haru_greeter';
    const expressScale = EXPR_SCALE[this.currentEmotion] ?? 1.0;
    const speakMul  = this.isSpeaking ? 1 + this.speechIntensity * 2.0 : 1.0;
    const baseSpeed = this.isSpeaking ? 1.6 : 0.35;
    this.swayPhase  += dt * baseSpeed * speakMul;
    this.swayPhase2 += dt * baseSpeed * 0.618 * speakMul;
    this.swayPhase3 += dt * baseSpeed * 1.272 * speakMul;

    const swayAmpX = (this.isSpeaking ? 2.0 + this.speechIntensity * 3.5 : 0.6) * expressScale;
    const swayAmpY = swayAmpX * 0.55;
    const bodyAmpX = (this.isSpeaking ? 0.8 + this.speechIntensity * 1.8 : 0.2) * expressScale;
    const angleZAmp = (this.isSpeaking ? 1.0 + this.speechIntensity * 1.5 : 0.25) * expressScale;

    const aX = Math.sin(this.swayPhase)  * swayAmpX + Math.sin(this.swayPhase2) * swayAmpX * 0.3 + Math.sin(this.swayPhase3) * swayAmpX * 0.1;
    const aY = Math.sin(this.swayPhase  * 0.7) * swayAmpY + Math.sin(this.swayPhase2 * 0.5) * swayAmpY * 0.25;
    const aZ = Math.sin(this.swayPhase3 * 0.9) * angleZAmp;
    const bX = Math.sin(this.swayPhase  * 0.85) * bodyAmpX;

    if (!isGreeter) {
      try { cm.addParameterValueById('ParamAngleX', aX); cm.addParameterValueById('ParamAngleY', aY); cm.addParameterValueById('ParamAngleZ', aZ); cm.addParameterValueById('ParamBodyAngleX', bX); } catch (_) {}
      try { cm.addParameterValueById('PARAM_ANGLE_X', aX); cm.addParameterValueById('PARAM_ANGLE_Y', aY); cm.addParameterValueById('PARAM_ANGLE_Z', aZ); cm.addParameterValueById('PARAM_BODY_ANGLE_X', bX); } catch (_) {}
    }

    // ── 7b. Kei: full facial expression control + body + hair ──────────────────
    if (this.modelKey === 'kei_vowels_pro') {
      // Kei's motions only animate eye open/scale — they don't touch brows, cheek,
      // or smile params at all. So we use setParameterValueById (not add) for full
      // direct control. emotionCurrent is already lerped in section 8 below.
      const ec = this.emotionCurrent;
      try {
        cm.setParameterValueById('ParamBrowLY',    ec['ParamBrowLY']    ?? 0);
        cm.setParameterValueById('ParamBrowRY',    ec['ParamBrowRY']    ?? 0);
        cm.setParameterValueById('ParamBrowLForm', ec['ParamBrowLForm'] ?? 0);
        cm.setParameterValueById('ParamBrowRForm', ec['ParamBrowRForm'] ?? 0);
        cm.setParameterValueById('ParamCheek',     ec['ParamCheek']    ?? 0);
        cm.setParameterValueById('ParamEyeLSmile', ec['ParamEyeLSmile'] ?? 0);
        cm.setParameterValueById('ParamEyeRSmile', ec['ParamEyeRSmile'] ?? 0);
      } catch (_) {}

      // Eye open adjustment: widen for surprised/excited, narrow for angry
      const eyeWideMap: Record<string, number> = {
        surprised: 0.35, excited: 0.25, curious: 0.15,
        angry: -0.25, analytical: -0.15, sad: -0.1,
      };
      const eyeWide = (eyeWideMap[this.currentEmotion] ?? 0) * this.emotionIntensity;
      if (Math.abs(eyeWide) > 0.01) {
        try {
          cm.addParameterValueById('ParamEyeLOpen', eyeWide);
          cm.addParameterValueById('ParamEyeROpen', eyeWide);
        } catch (_) {}
      }

      // Natural eye squint during speech when already smiling
      if (this.isSpeaking && (ec['ParamEyeLSmile'] ?? 0) > 0.25) {
        const squint = this.speechIntensity * 0.18;
        try {
          cm.addParameterValueById('ParamEyeLSmile', squint);
          cm.addParameterValueById('ParamEyeRSmile', squint);
        } catch (_) {}
      }

      // Body Y/Z for organic sway
      const bodyY = Math.sin(this.swayPhase2 * 0.7) * (this.isSpeaking ? 1.5 + this.speechIntensity * 2.0 : 0.4) * expressScale;
      const bodyZ = Math.sin(this.swayPhase3 * 0.6) * (this.isSpeaking ? 1.0 + this.speechIntensity * 1.2 : 0.2) * expressScale;
      try { cm.addParameterValueById('ParamBodyAngleY', bodyY); cm.addParameterValueById('ParamBodyAngleZ', bodyZ); } catch (_) {}

      // Head Z tilt for personality
      const headTilt = Math.sin(this.swayPhase2 * 0.45) * (this.isSpeaking ? 1.2 + this.speechIntensity * 1.5 : 0.3) * expressScale;
      try { cm.addParameterValueById('ParamAngleZ', headTilt * 0.5); } catch (_) {}

      // Hair physics sway
      const hairFrontAmp = swayAmpX * 0.40;
      const hairSideAmp  = swayAmpX * 0.60;
      const hairBackAmp  = swayAmpX * 0.75;
      const hairFuwaAmp  = swayAmpX * 0.25;
      try {
        cm.addParameterValueById('ParamHairFront',     Math.sin(this.swayPhase  * 0.9 + 0.3) * hairFrontAmp);
        cm.addParameterValueById('ParamHairFrontFuwa', Math.sin(this.swayPhase2 * 0.7 + 0.5) * hairFuwaAmp);
        cm.addParameterValueById('ParamHairSide',      Math.sin(this.swayPhase  * 0.8 + 0.4) * hairSideAmp);
        cm.addParameterValueById('ParamHairSide2',     Math.sin(this.swayPhase  * 0.8 - 0.4) * hairSideAmp);
        cm.addParameterValueById('ParamHairSideFuwa',  Math.sin(this.swayPhase2 * 0.6 + 0.2) * hairFuwaAmp);
        cm.addParameterValueById('ParamHairBack',      Math.sin(this.swayPhase3 * 0.75 + 0.6) * hairBackAmp);
        cm.addParameterValueById('ParamHairBackFuwa',  Math.sin(this.swayPhase2 * 0.5  + 0.8) * hairFuwaAmp);
      } catch (_) {}
    }

    // ── 8. Emotion expression lerp ────────────────────────────────────────────
    // haru_greeter: skip entirely — baked motions carry all expressions.
    // kei_vowels_pro: lerp runs to update emotionCurrent, but applyParam
    //   is handled above in 7b via setParameterValueById (not add).
    const MOUTH_PARAMS = new Set(['PARAM_MOUTH_FORM', 'ParamMouthForm']);
    const urgentSet   = new Set(['angry', 'surprised', 'excited']);
    const emotionSpeed = urgentSet.has(this.currentEmotion) ? 0.18 : 0.09;
    const eFactor = 1 - Math.pow(1 - emotionSpeed, dt / 0.01667);
    const isKei = this.modelKey === 'kei_vowels_pro';
    for (const [paramId, rawTarget] of Object.entries(this.emotionTargets)) {
      const target = rawTarget * this.emotionIntensity;
      const curr   = this.emotionCurrent[paramId] ?? 0;
      const next   = curr + (target - curr) * eFactor;
      this.emotionCurrent[paramId] = next;
      // Kei: applied via set in 7b above — skip the add here to avoid double-write
      if (isKei || isGreeter) continue;
      const scale = MOUTH_PARAMS.has(paramId) ? 0.25 : 1.0;
      try { cm.addParameterValueById(this.id(paramId), next * scale); } catch (_) {}
    }

    // ── 9. Micro-expression flash ─────────────────────────────────────────────
    if (this.microExpr && !isGreeter) {
      this.microExpr.elapsed += dt;
      const t = this.microExpr.elapsed / this.microExpr.duration;
      if (t >= 1) {
        this.microExpr = null;
      } else {
        const env = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
        for (const [paramId, val] of Object.entries(this.microExpr.params)) {
          if (isKei) {
            // Kei: use set since we own these params — gives the flash full visibility
            try { cm.setParameterValueById(this.id(paramId), val * env); } catch (_) {}
          } else {
            const scale = MOUTH_PARAMS.has(paramId) ? 0.2 : 0.6;
            try { cm.addParameterValueById(this.id(paramId), val * env * scale); } catch (_) {}
          }
        }
      }
    }
  }
}
