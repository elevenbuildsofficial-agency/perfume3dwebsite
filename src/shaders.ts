export const vertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vLocal;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vLocal = position;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const environment = /* glsl */ `
float band(vec3 r, float center, float width) {
  return exp(-pow((r.x - center) / width, 2.0)) * (0.65 + 0.35 * smoothstep(-0.8, 0.6, r.y));
}
`;

export const glassFragment = /* glsl */ `
uniform vec3 uColorA;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vLocal;
${environment}
void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(cameraPosition - vWorld);
  float fresnel = pow(1.0 - abs(dot(n, v)), 2.2);
  vec3 r = reflect(-v, n);
  float right = band(r, 0.65, 0.15);
  float left = band(r, -0.65, 0.09) * 0.50;
  float thin = band(r, 0.84, 0.035) * 0.6;
  vec3 tint = mix(vec3(0.72, 0.83, 0.65), uColorA, 0.14);
  vec3 col = mix(tint * 0.48, vec3(1.0, 0.98, 0.84), clamp(right + left + thin, 0.0, 1.0));
  col += fresnel * 0.48;
  float base = 0.055 + (1.0 - smoothstep(0.05, 0.24, vLocal.y)) * 0.14;
  float alpha = clamp(base + fresnel * 0.50 + right * 0.48 + left * 0.26 + thin * 0.32, 0.0, 0.91);
  gl_FragColor = vec4(col, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export const liquidFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;
uniform float uHeight;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vLocal;
${environment}
void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(cameraPosition - vWorld);
  float head = abs(dot(n, v));
  float fresnel = pow(1.0 - head, 2.2);
  float height = clamp(vLocal.y / uHeight, 0.0, 1.0);
  vec3 col = mix(uColorB, uColorA, smoothstep(0.0, 0.94, height));
  float core = pow(head, 5.0);
  col = mix(col * 0.63, col * 1.40 + vec3(0.12, 0.10, 0.025), core * 0.68);
  col += fresnel * uColorA * 0.28;
  float caustic = pow(0.5 + 0.5 * sin(vLocal.y * 14.0 + uTime * 1.5 + vLocal.x * 3.0), 18.0);
  col += caustic * 0.045;
  vec3 r = reflect(-v, n);
  col += vec3(0.9, 0.9, 0.6) * band(r, 0.58, 0.12) * 0.18;
  gl_FragColor = vec4(col, 0.89);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export const brassFragment = /* glsl */ `
uniform vec3 uBrass;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vLocal;
${environment}
void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(cameraPosition - vWorld);
  vec3 r = reflect(-v, n);
  float bands = band(r, 0.55, 0.24) + band(r, -0.55, 0.18) * 0.55;
  float spec = pow(max(dot(reflect(-normalize(vec3(2.0, 4.0, 5.0)), n), v), 0.0), 40.0);
  float grain = sin(vLocal.y * 1600.0) * 0.012;
  float top = max(n.y, 0.0) * 0.40;
  vec3 col = uBrass * (0.40 + bands * 1.20 + top + grain) + vec3(1.0, 0.9, 0.57) * spec * 0.6;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export const mistVertex = /* glsl */ `
uniform float uTime;
attribute float aSeed;
varying float vOpacity;
void main() {
  vec3 p = position;
  p.y = mod(p.y + uTime * (0.06 + aSeed * 0.06) + 3.0, 6.0) - 3.0;
  p.x += sin(uTime * 0.15 + aSeed * 30.0) * 0.12;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (1.0 + aSeed * 2.5) * (6.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
  vOpacity = (1.0 - abs(p.y) / 3.0) * 0.18;
}`;

export const mistFragment = /* glsl */ `
uniform vec3 uColor;
varying float vOpacity;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  float a = (1.0 - smoothstep(0.0, 0.5, d)) * vOpacity;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), 0.4), a);
  #include <colorspace_fragment>
}`;
