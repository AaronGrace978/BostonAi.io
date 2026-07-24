/*
 * planets.js — where the naked-eye planets are, from orbital mechanics.
 *
 * Keplerian elements and century rates from JPL's "Approximate Positions
 * of the Planets" (Standish, valid 1800-2050). Solve Kepler's equation,
 * build heliocentric positions for the planet and for Earth, difference
 * them, and rotate into the sky. Good to a few arcminutes — far finer
 * than a pixel.
 */

const rad = Math.PI / 180;
const J2000 = 2451545;
const DAY_MS = 86400000;
const J1970 = 2440588;

/* [a (au), e, I (deg), L (deg), longPeri (deg), longNode (deg)] + rates per century */
const EL = {
  mercury: [[0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593],
            [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  venus:   [[0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255],
            [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418]],
  earth:   [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
            [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0]],
  mars:    [[1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
            [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  jupiter: [[5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
            [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
  saturn:  [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
            [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
};

function heliocentric(name, T) {
  const [e0, dot] = EL[name];
  const a = e0[0] + dot[0] * T;
  const e = e0[1] + dot[1] * T;
  const I = (e0[2] + dot[2] * T) * rad;
  const L = (e0[3] + dot[3] * T) * rad;
  const wBar = (e0[4] + dot[4] * T) * rad;
  const Om = (e0[5] + dot[5] * T) * rad;

  const w = wBar - Om;
  let M = L - wBar;
  M = ((M + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

  // Kepler's equation, Newton's method
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 8; i++) {
    E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }

  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const cw = Math.cos(w), sw = Math.sin(w);
  const cO = Math.cos(Om), sO = Math.sin(Om);
  const cI = Math.cos(I), sI = Math.sin(I);

  return {
    x: (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    y: (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    z: (sw * sI) * xp + (cw * sI) * yp,
  };
}

const OBL = 23.43928 * rad;

/**
 * Geocentric RA/Dec (degrees) and distance (au) for a planet.
 * name: mercury | venus | mars | jupiter | saturn
 */
export function planetRaDec(name, date) {
  const jd = date.valueOf() / DAY_MS - 0.5 + J1970;
  const T = (jd - J2000) / 36525;
  const p = heliocentric(name, T);
  const e = heliocentric('earth', T);
  const gx = p.x - e.x, gy = p.y - e.y, gz = p.z - e.z;

  // ecliptic → equatorial
  const eqx = gx;
  const eqy = gy * Math.cos(OBL) - gz * Math.sin(OBL);
  const eqz = gy * Math.sin(OBL) + gz * Math.cos(OBL);

  const ra = Math.atan2(eqy, eqx) / rad;
  const dist = Math.sqrt(eqx * eqx + eqy * eqy + eqz * eqz);
  const dec = Math.asin(eqz / dist) / rad;
  return { ra: (ra + 360) % 360, dec, dist };
}

/* Rough visual magnitudes — enough to size a dot. */
export function planetMag(name, date) {
  const jd = date.valueOf() / DAY_MS - 0.5 + J1970;
  const T = (jd - J2000) / 36525;
  const p = heliocentric(name, T);
  const e = heliocentric('earth', T);
  const r = Math.hypot(p.x, p.y, p.z); // sun distance
  const d = Math.hypot(p.x - e.x, p.y - e.y, p.z - e.z); // earth distance
  const base = { mercury: -0.6, venus: -4.4, mars: -1.5, jupiter: -9.4, saturn: -8.9 }[name];
  return base + 5 * Math.log10(r * d);
}

export const PLANETS = [
  { name: 'venus', label: 'Venus', color: [240, 238, 226] },
  { name: 'mars', label: 'Mars', color: [232, 156, 118] },
  { name: 'jupiter', label: 'Jupiter', color: [238, 226, 200] },
  { name: 'saturn', label: 'Saturn', color: [228, 214, 180] },
];
