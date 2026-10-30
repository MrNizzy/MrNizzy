/**
 * GLSL for the pixel tide. All the motion happens here: one instanced quad is
 * drawn once per grid cell and the vertex shader works out where the cell is,
 * how high the water stands under it, how big the pixel is and what colour it
 * gets. The CPU only writes a handful of uniforms per frame.
 *
 * Three's ShaderMaterial already provides `modelViewMatrix`, `projectionMatrix`
 * and `position`; the rest is declared below. Three compiles for WebGL 2, so
 * `gl_InstanceID` is available and the grid needs no per-instance attributes.
 *
 * Colours are plain sRGB values blended in sRGB and written to the canvas
 * as they are (no colour-space chunk), so a pixel that has fully faded out is
 * byte-for-byte the page canvas colour behind the transparent canvas.
 */

export const TIDE_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  // World-space point under the cursor (y unused) and how strongly it ripples.
  uniform vec3 uPointer;
  uniform float uPointerStrength;
  // Grid: columns per row, cell pitch, pixel size and the z of the front row.
  uniform float uCols;
  uniform float uGap;
  uniform float uSize;
  uniform float uFront;
  // Colour ramp by height, and the fog that blends toward the canvas colour.
  uniform vec3 uTrough;
  uniform vec3 uMid;
  uniform vec3 uCrest;
  uniform vec3 uFogColor;
  uniform vec2 uFogRange;
  // 1 = the full ramp, lower values mix every pixel toward the canvas colour.
  uniform float uIntensity;

  varying vec3 vColor;

  float tideHeight(vec2 p, float t) {
    return sin(p.x * 0.35 + t * 0.9) * 0.55
         + cos(p.y * 0.42 + t * 0.7) * 0.45
         + sin((p.x + p.y) * 0.18 - t * 0.5) * 0.35;
  }

  void main() {
    // Instance -> grid cell. The +0.5 keeps floor() safe from the rounding of
    // GPU division when id is an exact multiple of uCols.
    float id = float(gl_InstanceID);
    float row = floor((id + 0.5) / uCols);
    float col = id - row * uCols;
    vec2 cell = vec2((col - uCols * 0.5) * uGap, uFront - row * uGap);

    float h = tideHeight(cell, uTime);

    // Cursor ripple, easing in and out through uPointerStrength.
    float d = distance(cell, uPointer.xz);
    h += exp(-d * d * 0.08) * sin(d * 1.6 - uTime * 5.0) * 0.9 * uPointerStrength;

    // Crests are slightly bigger pixels.
    float s = 0.55 + max(0.0, h) * 0.35;
    vec3 world = vec3(cell.x, h, cell.y) + position * (uSize * s);

    vec4 mv = modelViewMatrix * vec4(world, 1.0);
    gl_Position = projectionMatrix * mv;

    // trough -> mid -> crest by height.
    float k = clamp((h + 1.4) / 2.8, 0.0, 1.0);
    vec3 c = mix(uTrough, uMid, clamp(k * 2.0, 0.0, 1.0));
    c = mix(c, uCrest, clamp(k * 2.0 - 1.0, 0.0, 1.0));

    // Linear fog on view depth, same curve as three's own fog chunk.
    float fog = smoothstep(uFogRange.x, uFogRange.y, -mv.z);
    vColor = mix(uFogColor, c, uIntensity * (1.0 - fog));
  }
`;

export const TIDE_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;
