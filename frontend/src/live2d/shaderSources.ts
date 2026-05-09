/**
 * shaderSources.ts
 *
 * Imports all GLSL shader files as raw strings using Vite's ?raw suffix.
 * This bypasses the fetch()-based loading in cubismshader_webgl.ts,
 * which fails in Vite dev mode because the SPA fallback returns index.html
 * for unrecognised extensions like .vert and .frag.
 */

import vertShaderSrc                              from '../../public/shaders/webgl/vertshadersrc.vert?raw';
import vertShaderSrcMasked                        from '../../public/shaders/webgl/vertshadersrcmasked.vert?raw';
import vertShaderSrcSetupMask                     from '../../public/shaders/webgl/vertshadersrcsetupmask.vert?raw';
import fragShaderSrcSetupMask                     from '../../public/shaders/webgl/fragshadersrcsetupmask.frag?raw';
import fragShaderSrcPremultipliedAlpha            from '../../public/shaders/webgl/fragshadersrcpremultipliedalpha.frag?raw';
import fragShaderSrcMaskPremultipliedAlpha        from '../../public/shaders/webgl/fragshadersrcmaskpremultipliedalpha.frag?raw';
import fragShaderSrcMaskInvertedPremultipliedAlpha from '../../public/shaders/webgl/fragshadersrcmaskinvertedpremultipliedalpha.frag?raw';
import vertShaderSrcCopy                          from '../../public/shaders/webgl/vertshadersrccopy.vert?raw';
import fragShaderSrcCopy                          from '../../public/shaders/webgl/fragshadersrccopy.frag?raw';
import fragShaderSrcColorBlend                    from '../../public/shaders/webgl/fragshadersrccolorblend.frag?raw';
import fragShaderSrcAlphaBlend                    from '../../public/shaders/webgl/fragshadersrcalphablend.frag?raw';
import vertShaderSrcBlend                         from '../../public/shaders/webgl/vertshadersrcblend.vert?raw';
import fragShaderSrcBlend                         from '../../public/shaders/webgl/fragshadersrcpremultipliedalphablend.frag?raw';

export const shaderSources = {
  _vertShaderSrc:                               vertShaderSrc,
  _vertShaderSrcMasked:                         vertShaderSrcMasked,
  _vertShaderSrcSetupMask:                      vertShaderSrcSetupMask,
  _fragShaderSrcSetupMask:                      fragShaderSrcSetupMask,
  _fragShaderSrcPremultipliedAlpha:             fragShaderSrcPremultipliedAlpha,
  _fragShaderSrcMaskPremultipliedAlpha:         fragShaderSrcMaskPremultipliedAlpha,
  _fragShaderSrcMaskInvertedPremultipliedAlpha: fragShaderSrcMaskInvertedPremultipliedAlpha,
  _vertShaderSrcCopy:                           vertShaderSrcCopy,
  _fragShaderSrcCopy:                           fragShaderSrcCopy,
  _fragShaderSrcColorBlend:                     fragShaderSrcColorBlend,
  _fragShaderSrcAlphaBlend:                     fragShaderSrcAlphaBlend,
  _vertShaderSrcBlend:                          vertShaderSrcBlend,
  _fragShaderSrcBlend:                          fragShaderSrcBlend,
};
