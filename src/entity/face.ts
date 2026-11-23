// Ported from AaronGrace978/The-Entity (src/entity/face-default.ts).
/** SDF primitives and the original procedural Entity head. Mirrors `defaultFaceSdf` in `FACE_GLSL`. */

export type V3 = [number, number, number];

export const len3 = (x: number, y: number, z: number) => Math.hypot(x, y, z);
export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

export function ellipsoid(px: number, py: number, pz: number, rx: number, ry: number, rz: number) {
  const k0 = len3(px / rx, py / ry, pz / rz);
  const k1 = len3(px / (rx * rx), py / (ry * ry), pz / (rz * rz));
  return (k0 * (k0 - 1)) / k1;
}

export function capsule(p: V3, a: V3, b: V3, r: number) {
  const pa = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  const ba = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const h = clamp((pa[0] * ba[0] + pa[1] * ba[1] + pa[2] * ba[2]) / (ba[0] ** 2 + ba[1] ** 2 + ba[2] ** 2), 0, 1);
  return len3(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - r;
}

export function cylY(px: number, py: number, pz: number, r: number, h: number) {
  const dx = Math.hypot(px, pz) - r;
  const dy = Math.abs(py) - h;
  return Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
}

export function smin(a: number, b: number, k: number) {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b + (a - b) * h - k * h * (1 - h);
}
export const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);

export function defaultFaceSdf(x: number, y: number, z: number, mouth = 0): number {
  const ax = Math.abs(x);
  const q: V3 = [ax, y, z];
  let d = ellipsoid(x, y - 0.15, z + 0.05, 0.78, 0.95, 0.9);
  d = smin(d, ellipsoid(x, y + 0.42, z - 0.12, 0.56, 0.52, 0.62), 0.25);
  d = smin(d, ellipsoid(x, y + 0.8, z - 0.42, 0.22, 0.16, 0.18), 0.15);
  d = smin(d, ellipsoid(ax - 0.38, y + 0.08, z - 0.52, 0.22, 0.16, 0.2), 0.18);
  d = smin(d, capsule(q, [0.08, 0.3, 0.8], [0.42, 0.3, 0.66], 0.075), 0.12);
  d = smax(d, -ellipsoid(ax - 0.27, y - 0.14, z - 0.84, 0.17, 0.11, 0.16), 0.08);
  d = smin(d, len3(ax - 0.27, y - 0.13, z - 0.62) - 0.13, 0.03);
  d = smin(d, capsule([x, y, z], [0, 0.22, 0.86], [0, -0.12, 1.0], 0.06), 0.1);
  d = smin(d, ellipsoid(x, y + 0.14, z - 0.97, 0.1, 0.08, 0.09), 0.06);
  d = smin(d, ellipsoid(ax - 0.08, y + 0.16, z - 0.89, 0.06, 0.05, 0.06), 0.05);
  d = smin(d, ellipsoid(x, y + 0.34 - mouth * 0.02, z - 0.85, 0.2, 0.045, 0.08), 0.06);
  d = smin(d, ellipsoid(x, y + 0.45 + mouth * 0.06, z - 0.83, 0.18, 0.05, 0.08), 0.06);
  d = smax(d, -ellipsoid(x, y + 0.395 + mouth * 0.02, z - 0.93, 0.16, 0.008 + mouth * 0.05, 0.1), 0.02);
  d = smin(d, cylY(x, y + 1.15, z + 0.08, 0.42, 0.45), 0.2);
  return d;
}

/**
 * Finds where a ray from `origin` along unit `dir` crosses the head surface, by bisection.
 * Used to shrink-wrap a sphere onto the face.
 */
export function surfaceAlong(origin: V3, dir: V3, maxT = 2.5): number {
  let lo = 0
  let hi = maxT
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2
    const d = defaultFaceSdf(origin[0] + dir[0] * mid, origin[1] + dir[1] * mid, origin[2] + dir[2] * mid)
    if (d < 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
