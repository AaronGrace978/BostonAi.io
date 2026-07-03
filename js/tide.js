/*
 * tide.js — a real harmonic tide prediction for Boston Harbor.
 *
 * The water level is the sum of 28 cosine waves. Their frequencies are
 * the standard tidal constituents (M2, N2, S2, K1, O1, ...) at NOAA
 * station 8443970 (Boston); amplitudes and phases were fitted by least
 * squares against NOAA's own published predictions for 2026-2027, which
 * folds the slow nodal corrections into the constants. Agreement with
 * the official tables over those two years: about 1.5 cm RMS.
 *
 * Heights are meters above MLLW, computed entirely in your browser.
 */

export const TIDE_EPOCH_MS = 1767225600000;
export const TIDE_MEAN = 1.5860;
export const TIDE_TERMS = [
  [0.5058680455, 1.3314, -0.741931], // M2
  [0.4963669269, 0.2959, -0.290952], // N2
  [0.5235987756, 0.2078, -2.549370], // S2
  [0.2625161771, 0.1564, 2.962753], // K1
  [0.2433518685, 0.1336, -2.403425], // O1
  [0.5153691817, 0.0809, 1.743590], // L2
  [0.5250323541, 0.0736, 1.130366], // K2
  [0.4976384516, 0.0639, 0.953413], // NU2
  [0.0007167823, 0.0490, 2.519744], // SA
  [0.2610825985, 0.0470, 2.521712], // P1
  [0.4868657908, 0.0398, -0.010307], // 2N2
  [1.5176042762, 0.0265, -1.418446], // M6
  [0.0014335663, 0.0220, 1.812826], // SSA
  [0.2338507498, 0.0219, -2.257451], // Q1
  [1.0117361260, 0.0217, 1.821427], // M4
  [0.5140976569, 0.0182, 0.597534], // LAM2
  [0.5228820212, 0.0181, -2.018302], // T2
  [0.2720173045, 0.0114, 3.033990], // J1
  [1.0022349375, 0.0104, 1.972177], // MN4
  [0.4881373155, 0.0097, 1.362965], // MU2
  [1.0294668211, 0.0087, -0.127743], // MS4
  [0.7492199315, 0.0072, -1.514458], // 2MK3
  [0.2530150410, 0.0067, 3.114841], // M1
  [0.2816804508, 0.0065, -0.940594], // OO1
  [0.7683842226, 0.0064, -2.612812], // MK3
  [0.2351222920, 0.0058, -0.994236], // RHO
  [2.0234722520, 0.0053, 0.443353], // M8
  [0.2617993878, 0.0050, 0.853094], // S1
];

/** Water height (m above MLLW) at a given time. */
export function tideHeight(date) {
  const t = (date.valueOf() - TIDE_EPOCH_MS) / 3600000; // hours since epoch
  let h = TIDE_MEAN;
  for (const [w, a, p] of TIDE_TERMS) h += a * Math.cos(w * t + p);
  return h;
}

/** Rate of change (m/hour) — positive means the tide is coming in. */
export function tideRate(date) {
  const t = (date.valueOf() - TIDE_EPOCH_MS) / 3600000;
  let r = 0;
  for (const [w, a, p] of TIDE_TERMS) r -= a * w * Math.sin(w * t + p);
  return r;
}

/**
 * The next few high/low tides after `date`.
 * Scans for sign changes of the rate, then bisects each to the minute.
 */
export function nextTides(date, count = 4) {
  const out = [];
  const stepMs = 10 * 60000;
  let t0 = date.valueOf();
  let r0 = tideRate(new Date(t0));
  for (let i = 0; i < 24 * 12 && out.length < count; i++) {
    const t1 = t0 + stepMs;
    const r1 = tideRate(new Date(t1));
    if ((r0 > 0) !== (r1 > 0)) {
      let lo = t0, hi = t1;
      for (let k = 0; k < 24; k++) {
        const mid = (lo + hi) / 2;
        if ((tideRate(new Date(mid)) > 0) === (r0 > 0)) lo = mid; else hi = mid;
      }
      const when = new Date((lo + hi) / 2);
      out.push({ type: r0 > 0 ? 'high' : 'low', time: when, height: tideHeight(when) });
    }
    t0 = t1; r0 = r1;
  }
  return out;
}

/**
 * Where the water stands within its local swing, 0 (low) .. 1 (high).
 * Uses the surrounding low/high rather than all-time extremes, so the
 * scene breathes with each individual tide.
 */
export function tideFraction(date) {
  const h = tideHeight(date);
  // find the bracketing extremes
  const next = nextTides(date, 2);
  if (next.length < 2) return 0.5;
  const a = next[0], b = next[1];
  const hi = a.type === 'high' ? a.height : b.height;
  const lo = a.type === 'low' ? a.height : b.height;
  const span = hi - lo;
  if (span <= 0.01) return 0.5;
  return Math.min(1, Math.max(0, (h - lo) / span));
}
