/*
 * astro.js — plain-arithmetic astronomy for one city.
 *
 * Solar position/times use the simplified NOAA/Astronomy-Answers equations
 * (the same approach as SunCalc). Accurate to a minute or two, which is
 * plenty for a sky. Lunar position uses a truncated lunar theory, good to
 * a fraction of a degree. No dependencies, no network, just math.
 */

export const BOSTON = { lat: 42.3601, lon: -71.0589, tz: 'America/New_York' };

const rad = Math.PI / 180;
const DAY_MS = 86400000;
const J1970 = 2440588;
const J2000 = 2451545;

const toJulian = (date) => date.valueOf() / DAY_MS - 0.5 + J1970;
const fromJulian = (j) => new Date((j + 0.5 - J1970) * DAY_MS);
const toDays = (date) => toJulian(date) - J2000;

// Obliquity of the ecliptic
const e = rad * 23.4397;

function rightAscension(l, b) {
  return Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
}
function declination(l, b) {
  return Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
}
function azimuth(H, phi, dec) {
  return Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
}
function altitude(H, phi, dec) {
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
}
function siderealTime(d, lw) {
  return rad * (280.16 + 360.9856235 * d) - lw;
}

function solarMeanAnomaly(d) {
  return rad * (357.5291 + 0.98560028 * d);
}
function eclipticLongitude(M) {
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const P = rad * 102.9372; // perihelion of Earth
  return M + C + P + Math.PI;
}
function sunCoords(d) {
  const M = solarMeanAnomaly(d);
  const L = eclipticLongitude(M);
  return { dec: declination(L, 0), ra: rightAscension(L, 0), L };
}

/** Sun altitude/azimuth (radians). Azimuth: 0 = south, +west, -east. */
export function sunPosition(date, lat = BOSTON.lat, lon = BOSTON.lon) {
  const lw = rad * -lon;
  const phi = rad * lat;
  const d = toDays(date);
  const c = sunCoords(d);
  const H = siderealTime(d, lw) - c.ra;
  return { azimuth: azimuth(H, phi, c.dec), altitude: altitude(H, phi, c.dec) };
}

/**
 * The sun's ecliptic longitude in degrees [0, 360).
 * 0 = March equinox, 90 = June solstice, 180 = September equinox, 270 = December solstice.
 */
export function solarLongitude(date) {
  const L = eclipticLongitude(solarMeanAnomaly(toDays(date)));
  const deg = ((L / rad) % 360 + 360) % 360;
  return deg;
}

const J0 = 0.0009;
const julianCycle = (d, lw) => Math.round(d - J0 - lw / (2 * Math.PI));
const approxTransit = (Ht, lw, n) => J0 + (Ht + lw) / (2 * Math.PI) + n;
const solarTransitJ = (ds, M, L) => J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
const hourAngle = (h, phi, dec) =>
  Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));

function getSetJ(h, lw, phi, dec, n, M, L) {
  const w = hourAngle(h, phi, dec);
  const a = approxTransit(w, lw, n);
  return solarTransitJ(a, M, L);
}

/**
 * Sun event times for the solar day nearest to `date`.
 * Pass a Date near local noon to get that calendar day's events.
 */
export function sunTimes(date, lat = BOSTON.lat, lon = BOSTON.lon) {
  const lw = rad * -lon;
  const phi = rad * lat;
  const d = toDays(date);
  const n = julianCycle(d, lw);
  const ds = approxTransit(0, lw, n);
  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L, 0);
  const Jnoon = solarTransitJ(ds, M, L);

  const result = { solarNoon: fromJulian(Jnoon) };
  const angles = [
    [-0.833, 'sunrise', 'sunset'],
    [-6, 'civilDawn', 'civilDusk'],
    [-12, 'nauticalDawn', 'nauticalDusk'],
    [-18, 'astroDawn', 'astroDusk'],
  ];
  for (const [angle, riseName, setName] of angles) {
    const Jset = getSetJ(angle * rad, lw, phi, dec, n, M, L);
    const Jrise = Jnoon - (Jset - Jnoon);
    result[riseName] = fromJulian(Jrise);
    result[setName] = fromJulian(Jset);
  }
  return result;
}

function moonCoords(d) {
  const L = rad * (218.316 + 13.176396 * d); // ecliptic longitude
  const M = rad * (134.963 + 13.064993 * d); // mean anomaly
  const F = rad * (93.272 + 13.229350 * d); // mean distance

  const l = L + rad * 6.289 * Math.sin(M);
  const b = rad * 5.128 * Math.sin(F);
  const dt = 385001 - 20905 * Math.cos(M); // km

  return { ra: rightAscension(l, b), dec: declination(l, b), dist: dt };
}

/** Moon altitude/azimuth (radians), same convention as sunPosition. */
export function moonPosition(date, lat = BOSTON.lat, lon = BOSTON.lon) {
  const lw = rad * -lon;
  const phi = rad * lat;
  const d = toDays(date);
  const c = moonCoords(d);
  const H = siderealTime(d, lw) - c.ra;
  let h = altitude(H, phi, c.dec);
  // astronomical refraction near the horizon
  h += rad * 0.017 / Math.tan(h + rad * 10.26 / (h / rad + 5.10));
  return { azimuth: azimuth(H, phi, c.dec), altitude: h, distance: c.dist };
}

const SYNODIC = 29.53058867;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

const PHASE_NAMES = [
  [0.0167, 'New Moon'],
  [0.2333, 'Waxing Crescent'],
  [0.2667, 'First Quarter'],
  [0.4833, 'Waxing Gibbous'],
  [0.5167, 'Full Moon'],
  [0.7333, 'Waning Gibbous'],
  [0.7667, 'Last Quarter'],
  [0.9833, 'Waning Crescent'],
  [1.0001, 'New Moon'],
];

/**
 * Moon phase from the mean synodic cycle.
 * phase: 0 = new, 0.5 = full. illumination: 0..1 lit fraction.
 */
export function moonPhase(date) {
  const age = ((((date.valueOf() - KNOWN_NEW_MOON) / DAY_MS) % SYNODIC) + SYNODIC) % SYNODIC;
  const phase = age / SYNODIC;
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  let name = 'Moon';
  for (const [limit, n] of PHASE_NAMES) {
    if (phase < limit) { name = n; break; }
  }
  return { phase, age, illumination, name, waxing: phase < 0.5 };
}

const SEASONS = [
  { name: 'Spring', next: 'summer solstice' },
  { name: 'Summer', next: 'autumn equinox' },
  { name: 'Autumn', next: 'winter solstice' },
  { name: 'Winter', next: 'spring equinox' },
];

/** Astronomical season for the northern hemisphere, with progress 0..1. */
export function season(date) {
  const lon = solarLongitude(date);
  const idx = Math.floor(lon / 90) % 4;
  const into = lon % 90;
  // the sun's longitude advances ~0.98565 degrees per day
  const daysLeft = (90 - into) / 0.98565;
  return {
    ...SEASONS[idx],
    progress: into / 90,
    daysLeft,
  };
}

/** Fractional days between two dates (b - a). */
export function daysBetween(a, b) {
  return (b.valueOf() - a.valueOf()) / DAY_MS;
}

/** A Date pinned near solar noon in Boston for a given calendar day (UTC fields). */
export function bostonNoon(y, m, d) {
  return new Date(Date.UTC(y, m, d, 16, 45)); // ~noon EST/EDT either way
}

/** Format a Date as time-of-day in Boston, e.g. "5:12 AM". */
export function bostonTime(date, withSeconds = false) {
  if (!date || isNaN(date)) return '—';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: BOSTON.tz,
    hour: 'numeric',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' } : {}),
  }).format(date);
}

/** Format a Date as a full Boston date, e.g. "Friday, July 3, 2026". */
export function bostonDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: BOSTON.tz,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/** Calendar day parts in Boston: { y, m (0-based), d, hour, minute }. */
export function bostonParts(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BOSTON.tz,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (t) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get('year'), m: get('month') - 1, d: get('day'), hour: get('hour'), minute: get('minute') };
}

/** Duration in ms rendered as "15h 12m" (or "15h 12m 08s"). */
export function fmtDuration(ms, withSeconds = false) {
  const sign = ms < 0 ? '−' : '';
  ms = Math.abs(ms);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (withSeconds) return `${sign}${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  return `${sign}${h}h ${String(m).padStart(2, '0')}m`;
}

/** Short delta like "+1m 42s" for daylight change. */
export function fmtDelta(ms) {
  const sign = ms < 0 ? '−' : '+';
  ms = Math.abs(ms);
  const m = Math.floor(ms / 60000);
  const s = Math.round((ms % 60000) / 1000);
  return `${sign}${m}m ${String(s).padStart(2, '0')}s`;
}

/* deterministic PRNG so a given day always looks like itself */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
