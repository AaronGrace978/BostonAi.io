/*
 * sky.js — the sky over Boston, drawn from arithmetic.
 *
 * Everything in the scene is a pure function of the clock:
 * the sun and moon sit where they actually are over the city,
 * stars come out with astronomical twilight, windows light up
 * in the evening, and the season decides what falls through
 * the air. A given minute in Boston always looks the same.
 */

import {
  sunPosition, moonPosition, moonPhase, bostonParts, mulberry32,
} from './astro.js';

/* ---------- small helpers ---------- */

const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const mixc = (c1, c2, t) => [
  Math.round(lerp(c1[0], c2[0], t)),
  Math.round(lerp(c1[1], c2[1], t)),
  Math.round(lerp(c1[2], c2[2], t)),
];
const css = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/* ---------- sky palette keyed by sun altitude (degrees) ---------- */
/* [altitude, [zenith, upper, lower, horizon], glowStrength] */

const PALETTE = [
  [-30, [[4, 7, 15], [6, 10, 21], [10, 15, 30], [16, 22, 42]], 0.00],
  [-18, [[5, 8, 17], [7, 11, 24], [11, 17, 34], [19, 26, 48]], 0.02],
  [-12, [[7, 11, 24], [10, 15, 32], [17, 24, 46], [39, 40, 66]], 0.10],
  [-6, [[13, 19, 40], [24, 29, 58], [56, 48, 80], [122, 78, 78]], 0.35],
  [-2, [[24, 33, 64], [48, 50, 88], [116, 84, 96], [203, 116, 76]], 0.70],
  [1, [[42, 62, 105], [86, 88, 122], [172, 122, 106], [235, 148, 84]], 0.95],
  [6, [[70, 108, 160], [116, 136, 172], [190, 162, 140], [238, 180, 118]], 0.65],
  [15, [[96, 143, 199], [140, 172, 210], [186, 204, 222], [216, 224, 228]], 0.25],
  [35, [[110, 158, 212], [152, 185, 220], [196, 213, 228], [224, 231, 234]], 0.10],
];

function skyColors(altDeg) {
  if (altDeg <= PALETTE[0][0]) return { stops: PALETTE[0][1], glow: PALETTE[0][2] };
  if (altDeg >= PALETTE[PALETTE.length - 1][0]) {
    const last = PALETTE[PALETTE.length - 1];
    return { stops: last[1], glow: last[2] };
  }
  for (let i = 0; i < PALETTE.length - 1; i++) {
    const [a0, s0, g0] = PALETTE[i];
    const [a1, s1, g1] = PALETTE[i + 1];
    if (altDeg >= a0 && altDeg <= a1) {
      const t = (altDeg - a0) / (a1 - a0);
      return {
        stops: s0.map((c, j) => mixc(c, s1[j], t)),
        glow: lerp(g0, g1, t),
      };
    }
  }
  return { stops: PALETTE[0][1], glow: 0 };
}

/* ---------- moon disc (shared with the almanac card) ---------- */

/**
 * Draw a phase-correct moon. phase: 0 new → 0.5 full → 1 new.
 * rotation: radians; after rotation the +x axis is "toward the light".
 * opts.orient: 'auto' (upright: waxing lit right, waning lit left)
 *              or 'sun' (lit limb always toward +x — use with rotation).
 */
export function drawMoonDisc(ctx, cx, cy, r, phase, rotation = 0, opts = {}) {
  const litColor = opts.lit || '#e6e2d4';
  const darkColor = opts.dark || 'rgba(190,200,225,0.10)';

  const waning = phase > 0.5;
  const p = waning ? 1 - phase : phase;
  const rx = Math.cos(TAU * p) * r;
  const side = (opts.orient === 'sun') ? 1 : (waning ? -1 : 1);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.scale(side, 1);

  // dark disc
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fillStyle = darkColor;
  ctx.fill();

  // lit region: right semicircle closed by the terminator half-ellipse
  ctx.beginPath();
  ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI / 2 - (i / steps) * Math.PI;
    ctx.lineTo(rx * Math.cos(a) * 1, r * Math.sin(a));
  }
  ctx.closePath();
  ctx.fillStyle = litColor;
  ctx.fill();

  // a few soft maria for texture
  if (r > 14) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.clip();
    ctx.fillStyle = 'rgba(120,125,140,0.16)';
    const spots = [
      [-0.30, -0.25, 0.24], [0.18, -0.05, 0.30], [-0.10, 0.34, 0.18],
      [0.38, 0.30, 0.13], [-0.42, 0.12, 0.11],
    ];
    for (const [sx, sy, sr] of spots) {
      ctx.beginPath();
      ctx.arc(sx * r, sy * r, sr * r, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/* ---------- skyline geometry ---------- */
/* Stylized silhouette, facing the city: Zakim to the left, downtown,
   the Common's gap, then Back Bay. Fractions of canvas width/skyline height. */

function buildSkyline(w, horizonY, skyH) {
  const buildings = [];
  const px = (f) => f * w;
  const B = (x, bw, hFrac, kind = 'box', opts = {}) => {
    buildings.push({
      x: px(x), w: px(bw), h: hFrac * skyH, kind,
      top: horizonY - hFrac * skyH, ...opts,
    });
  };

  // — back row (hazy) —
  const back = [];
  let bx = 0.01;
  const backRng = mulberry32(4242);
  while (bx < 0.99) {
    const bw = 0.018 + backRng() * 0.03;
    const bh = 0.10 + backRng() * 0.34;
    back.push({ x: px(bx), w: px(bw), h: bh * skyH, top: horizonY - bh * skyH });
    bx += bw + 0.004 + backRng() * 0.02;
  }

  // — front row —
  // Zakim bridge
  B(0.030, 0.130, 0.40, 'zakim');
  // North End low brick
  B(0.165, 0.022, 0.13); B(0.190, 0.018, 0.17); B(0.211, 0.024, 0.11);
  // Custom House Tower
  B(0.245, 0.034, 0.62, 'customhouse');
  // downtown cluster
  B(0.288, 0.030, 0.44);
  B(0.322, 0.040, 0.55, 'box', { crown: true });
  B(0.366, 0.030, 0.36);
  B(0.400, 0.042, 0.58);
  B(0.447, 0.034, 0.60, 'slant');
  B(0.485, 0.024, 0.30);
  // the Common — trees
  B(0.523, 0.075, 0.055, 'trees');
  // Back Bay brownstones
  B(0.606, 0.058, 0.085, 'brownstones');
  // 200 Clarendon (Hancock)
  B(0.672, 0.046, 0.74, 'hancock');
  // 111 Huntington
  B(0.726, 0.036, 0.55, 'crownlattice');
  // Prudential
  B(0.770, 0.052, 0.66, 'pru');
  // mid boxes
  B(0.830, 0.030, 0.30);
  B(0.863, 0.026, 0.22);
  // Kenmore + the sign
  B(0.896, 0.034, 0.13, 'citgo');
  B(0.936, 0.024, 0.16);
  B(0.963, 0.030, 0.10);

  // windows: a deterministic lit-map per building
  for (const b of buildings) {
    if (['trees', 'zakim', 'brownstones', 'citgo'].includes(b.kind)) continue;
    const cw = 4.5, ch = 7;
    const cols = Math.max(1, Math.floor((b.w - 4) / cw));
    const rows = Math.max(1, Math.floor((b.h - 8) / ch));
    const seeds = new Float32Array(cols * rows);
    const wrng = mulberry32(Math.round(b.x * 7919 + b.h * 13));
    for (let i = 0; i < seeds.length; i++) seeds[i] = wrng();
    b.windows = { cols, rows, cw, ch, seeds };
  }

  return { buildings, back };
}

/* ---------- stars ---------- */

function buildStars(w, skyBottom) {
  const rng = mulberry32(1630); // Boston, est.
  const stars = [];
  const count = Math.round((w * skyBottom) / 3800);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rng() * w,
      y: rng() * skyBottom * 0.96,
      r: 0.4 + rng() * 1.1,
      tw: 0.5 + rng() * 2.2,
      ph: rng() * TAU,
      warm: rng() < 0.12,
    });
  }
  return stars;
}

/* ---------- the renderer ---------- */

export function createSky(canvas, getNow) {
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0, dpr = 1;
  let horizonY = 0, skyH = 0;
  let skyline = null, stars = null;
  let raf = 0, lastStatic = 0;
  let running = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    horizonY = Math.round(h * 0.82);
    skyH = h * 0.34;
    skyline = buildSkyline(w, horizonY, skyH);
    stars = buildStars(w, horizonY);
  }

  /* map an alt/az (radians, az: 0=S, -E, +W) to canvas position */
  function toXY(az, alt) {
    const x = w * (0.5 + az / (Math.PI * 1.5));
    const y = horizonY - Math.sin(alt) * horizonY * 0.92;
    return [x, y];
  }

  function draw() {
    const now = getNow();
    const t = now.valueOf() / 1000;
    const parts = bostonParts(now);

    const sun = sunPosition(now);
    const moon = moonPosition(now);
    const mph = moonPhase(now);
    const sunAltDeg = sun.altitude * 180 / Math.PI;

    const { stops, glow } = skyColors(sunAltDeg);
    const night = smooth(-4, -15, sunAltDeg);   // 0 day → 1 deep night
    const dayness = smooth(-6, 10, sunAltDeg);  // 0 night → 1 day

    const [sunX, sunY] = toXY(sun.azimuth, sun.altitude);
    const [moonX, moonY] = toXY(moon.azimuth, moon.altitude);

    /* — sky — */
    const g = ctx.createLinearGradient(0, 0, 0, horizonY);
    g.addColorStop(0, css(stops[0]));
    g.addColorStop(0.45, css(stops[1]));
    g.addColorStop(0.78, css(stops[2]));
    g.addColorStop(1, css(stops[3]));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, horizonY + 1);

    /* — horizon glow toward the sun — */
    if (glow > 0.03) {
      const gx = clamp(sunX, -w * 0.2, w * 1.2);
      const rg = ctx.createRadialGradient(gx, horizonY, 0, gx, horizonY, w * 0.55);
      const warm = mixc(stops[3], [255, 190, 120], 0.5);
      rg.addColorStop(0, css(warm, 0.55 * glow));
      rg.addColorStop(1, css(warm, 0));
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, horizonY + 1);
    }

    /* — stars — */
    if (night > 0.02) {
      for (const s of stars) {
        const tw = reduced ? 0.75 : 0.55 + 0.45 * Math.sin(t * s.tw + s.ph);
        const a = night * tw * (0.35 + s.r * 0.4);
        if (a < 0.03) continue;
        ctx.fillStyle = s.warm ? `rgba(255,224,178,${a})` : `rgba(214,224,255,${a})`;
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
      // an occasional meteor, on a fixed schedule
      if (!reduced) {
        const cycle = Math.floor(t / 90);
        const into = t - cycle * 90;
        const crng = mulberry32(cycle);
        if (crng() < 0.3 && into < 1.1) {
          const p = into / 1.1;
          const mx = w * (0.15 + crng() * 0.7) + p * 130;
          const my = horizonY * (0.08 + crng() * 0.3) + p * 60;
          const a = Math.sin(p * Math.PI) * night * 0.85;
          ctx.strokeStyle = `rgba(230,238,255,${a})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(mx - 46, my - 21);
          ctx.lineTo(mx, my);
          ctx.stroke();
        }
      }
    }

    /* — moon — */
    const moonUp = moon.altitude > -0.02;
    if (moonUp) {
      const mr = Math.max(10, Math.min(17, w * 0.013));
      const rot = Math.atan2(sunY - moonY, sunX - moonX);
      if (night > 0.1 && mph.illumination > 0.12) {
        const halo = ctx.createRadialGradient(moonX, moonY, mr, moonX, moonY, mr * 6);
        halo.addColorStop(0, `rgba(224,226,214,${0.16 * night * mph.illumination})`);
        halo.addColorStop(1, 'rgba(224,226,214,0)');
        ctx.fillStyle = halo;
        ctx.fillRect(moonX - mr * 6, moonY - mr * 6, mr * 12, mr * 12);
      }
      drawMoonDisc(ctx, moonX, moonY, mr, mph.phase, rot, {
        orient: 'sun',
        lit: dayness > 0.5 ? 'rgba(240,242,244,0.85)' : '#e6e2d4',
        dark: dayness > 0.5 ? 'rgba(240,242,244,0.06)' : 'rgba(190,200,225,0.10)',
      });
    }

    /* — sun — */
    if (sunAltDeg > -2.5) {
      const sr = Math.max(13, Math.min(20, w * 0.015));
      const low = smooth(20, -1, sunAltDeg);
      const cSun = mixc([255, 251, 235], [255, 130, 60], low * 0.85);
      const gr = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sr * 7);
      gr.addColorStop(0, css(cSun, 0.55));
      gr.addColorStop(0.25, css(cSun, 0.18));
      gr.addColorStop(1, css(cSun, 0));
      ctx.fillStyle = gr;
      ctx.fillRect(sunX - sr * 7, sunY - sr * 7, sr * 14, sr * 14);
      ctx.beginPath();
      ctx.arc(sunX, sunY, sr, 0, TAU);
      ctx.fillStyle = css(cSun);
      ctx.fill();
    }

    /* — an airplane into Logan, every few minutes — */
    if (!reduced) {
      const pcyc = Math.floor(t / 210);
      const pinto = t - pcyc * 210;
      const prng = mulberry32(pcyc * 7 + 3);
      if (prng() < 0.55 && pinto < 55) {
        const dir = prng() < 0.5 ? 1 : -1;
        const py = horizonY * (0.12 + prng() * 0.35);
        const p = pinto / 55;
        const pxx = dir > 0 ? p * (w + 40) - 20 : w + 20 - p * (w + 40);
        const blink = Math.sin(t * 6) > 0.4;
        ctx.fillStyle = `rgba(235,235,235,${0.35 + night * 0.4})`;
        ctx.fillRect(pxx, py, 2.2, 2.2);
        if (blink) {
          ctx.fillStyle = 'rgba(255,80,80,0.9)';
          ctx.fillRect(pxx + (dir > 0 ? -4 : 5), py, 1.8, 1.8);
        }
      }
    }

    /* — haze band above the horizon — */
    const haze = ctx.createLinearGradient(0, horizonY - skyH * 0.9, 0, horizonY);
    haze.addColorStop(0, css(stops[3], 0));
    haze.addColorStop(1, css(stops[3], 0.35));
    ctx.fillStyle = haze;
    ctx.fillRect(0, horizonY - skyH * 0.9, w, skyH * 0.9);

    /* — skyline — */
    const backCol = mixc(mixc(stops[3], [8, 11, 20], 0.55), stops[3], dayness * 0.55);
    const frontCol = mixc([8, 10, 18], mixc(stops[3], [40, 48, 62], 0.6), dayness * 0.8);
    drawSkyline(ctx, t, parts, night, dayness, backCol, frontCol);

    /* — water — */
    drawWater(ctx, t, stops, night, dayness, glow, sunX, sunAltDeg, moonX, moonUp, mph, reduced);

    /* — season in the air — */
    if (!reduced) drawSeasonParticles(ctx, t, parts, night);
  }

  function drawSkyline(ctx, t, parts, night, dayness, backCol, frontCol) {
    // back row
    ctx.fillStyle = css(backCol, 0.9);
    for (const b of skyline.back) {
      ctx.fillRect(b.x, b.top, b.w, b.h + 2);
    }

    const fc = css(frontCol);
    const hour = parts.hour + parts.minute / 60;
    // how many windows are lit at this hour
    let litFrac = 0;
    if (hour >= 17 && hour < 22) litFrac = 0.28 + 0.34 * smooth(17, 19.5, hour);
    else if (hour >= 22 || hour < 1) litFrac = 0.30;
    else if (hour >= 1 && hour < 5) litFrac = 0.07;
    else if (hour >= 5 && hour < 8) litFrac = 0.25 * smooth(8, 5.5, hour);
    const winAlpha = smooth(2, -7, (dayness - 0.5) * 20) * 0.9; // fade with daylight
    const windowsOn = night > 0.05 || dayness < 0.75;

    for (const b of skyline.buildings) {
      switch (b.kind) {
        case 'zakim': drawZakim(ctx, b, fc, night, t); break;
        case 'trees': drawTreeline(ctx, b, fc); break;
        case 'brownstones': drawBrownstones(ctx, b, fc); break;
        case 'citgo': drawCitgo(ctx, b, fc, night, t); break;
        case 'customhouse': drawCustomHouse(ctx, b, fc, night); break;
        case 'hancock': {
          ctx.fillStyle = fc;
          ctx.fillRect(b.x, b.top, b.w, b.h + 2);
          beacon(ctx, b.x + b.w / 2, b.top - 2, night, t, 0);
          break;
        }
        case 'crownlattice': {
          ctx.fillStyle = fc;
          ctx.fillRect(b.x, b.top, b.w, b.h + 2);
          ctx.beginPath(); // rounded crown
          ctx.arc(b.x + b.w / 2, b.top, b.w * 0.52, Math.PI, 0);
          ctx.fill();
          break;
        }
        case 'pru': {
          ctx.fillStyle = fc;
          ctx.fillRect(b.x, b.top, b.w, b.h + 2);
          ctx.fillRect(b.x + b.w * 0.42, b.top - 26, 2, 26); // mast
          beacon(ctx, b.x + b.w * 0.42 + 1, b.top - 26, night, t, 1.5);
          break;
        }
        case 'slant': {
          ctx.fillStyle = fc;
          ctx.beginPath();
          ctx.moveTo(b.x, b.top + 10);
          ctx.lineTo(b.x + b.w, b.top);
          ctx.lineTo(b.x + b.w, b.top + b.h + 2);
          ctx.lineTo(b.x, b.top + b.h + 2);
          ctx.closePath();
          ctx.fill();
          break;
        }
        default: {
          ctx.fillStyle = fc;
          ctx.fillRect(b.x, b.top, b.w, b.h + 2);
          if (b.crown) {
            ctx.fillRect(b.x + b.w * 0.25, b.top - 5, b.w * 0.5, 5);
          }
        }
      }

      // windows
      if (b.windows && windowsOn && winAlpha > 0.02) {
        const { cols, rows, cw, ch, seeds } = b.windows;
        const ox = b.x + (b.w - cols * cw) / 2 + 1;
        const oy = b.top + 5;
        ctx.fillStyle = `rgba(255,214,150,${0.62 * winAlpha})`;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (seeds[r * cols + c] < litFrac) {
              ctx.fillRect(ox + c * cw, oy + r * ch, 1.8, 3);
            }
          }
        }
      }
    }
  }

  function beacon(ctx, x, y, night, t, ph) {
    const a = (0.25 + night * 0.6) * (0.45 + 0.55 * Math.max(0, Math.sin(t * 1.4 + ph)));
    ctx.fillStyle = `rgba(255,64,64,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.8, 0, TAU);
    ctx.fill();
  }

  function drawZakim(ctx, b, fc, night, t) {
    const cx1 = b.x + b.w * 0.30, cx2 = b.x + b.w * 0.70;
    const topY = b.top, deckY = horizonY - 6;
    ctx.strokeStyle = fc;
    ctx.fillStyle = fc;
    // towers: inverted-Y obelisks
    for (const cx of [cx1, cx2]) {
      ctx.beginPath();
      ctx.moveTo(cx - 6, deckY + 6);
      ctx.lineTo(cx - 1.6, topY);
      ctx.lineTo(cx + 1.6, topY);
      ctx.lineTo(cx + 6, deckY + 6);
      ctx.closePath();
      ctx.fill();
    }
    // deck
    ctx.fillRect(b.x - 8, deckY, b.w + 16, 3);
    // cables
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = css([180, 195, 230], 0.16 + night * 0.22);
    for (let i = 1; i <= 7; i++) {
      const f = i / 8;
      for (const [cx, dir] of [[cx1, -1], [cx1, 1], [cx2, -1], [cx2, 1]]) {
        ctx.beginPath();
        ctx.moveTo(cx, topY + (deckY - topY) * 0.12);
        ctx.lineTo(cx + dir * f * b.w * 0.30, deckY);
        ctx.stroke();
      }
    }
    // the Zakim's blue lighting at night: retrace the cables in blue
    if (night > 0.25) {
      ctx.strokeStyle = `rgba(110,165,255,${0.28 * night})`;
      ctx.lineWidth = 0.8;
      for (let i = 1; i <= 7; i++) {
        const f = i / 8;
        for (const [cx, dir] of [[cx1, -1], [cx1, 1], [cx2, -1], [cx2, 1]]) {
          ctx.beginPath();
          ctx.moveTo(cx, topY + (deckY - topY) * 0.12);
          ctx.lineTo(cx + dir * f * b.w * 0.30, deckY);
          ctx.stroke();
        }
      }
    }
    beacon(ctx, cx1, topY - 2, night, t, 0.7);
    beacon(ctx, cx2, topY - 2, night, t, 2.1);
  }

  function drawTreeline(ctx, b, fc) {
    ctx.fillStyle = fc;
    const n = 7;
    for (let i = 0; i < n; i++) {
      const tx = b.x + (i / (n - 1)) * b.w;
      const tr = 5 + ((i * 37) % 5);
      ctx.beginPath();
      ctx.arc(tx, horizonY - tr - 2, tr, 0, TAU);
      ctx.fill();
    }
    ctx.fillRect(b.x, horizonY - 4, b.w, 4);
  }

  function drawBrownstones(ctx, b, fc) {
    ctx.fillStyle = fc;
    ctx.fillRect(b.x, b.top, b.w, b.h + 2);
    // chimneys and bays
    for (let i = 0; i < 6; i++) {
      const cx = b.x + (i + 0.5) * (b.w / 6);
      ctx.fillRect(cx - 1, b.top - 4 - (i % 2) * 2, 2.4, 6);
    }
  }

  function drawCitgo(ctx, b, fc, night, t) {
    ctx.fillStyle = fc;
    ctx.fillRect(b.x, b.top, b.w, b.h + 2);
    // the sign, pulsing gently after dark
    const sw = b.w * 0.72, sh = sw * 0.8;
    const sx = b.x + (b.w - sw) / 2, sy = b.top - sh - 3;
    const pulse = 0.55 + 0.45 * Math.sin(t * 0.9);
    const a = night * (0.35 + 0.5 * pulse);
    if (a > 0.03) {
      ctx.fillStyle = `rgba(240,240,248,${a * 0.5})`;
      ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = `rgba(232,60,44,${a})`;
      ctx.beginPath();
      ctx.moveTo(sx + sw * 0.18, sy + sh * 0.78);
      ctx.lineTo(sx + sw * 0.5, sy + sh * 0.2);
      ctx.lineTo(sx + sw * 0.82, sy + sh * 0.78);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = fc;
      ctx.fillRect(sx, sy, sw, sh);
    }
    ctx.fillStyle = fc;
    ctx.fillRect(sx + sw / 2 - 1, sy + sh, 2, 3);
  }

  function drawCustomHouse(ctx, b, fc, night) {
    ctx.fillStyle = fc;
    const baseH = b.h * 0.30;
    // base colonnade block
    ctx.fillRect(b.x - b.w * 0.35, horizonY - baseH, b.w * 1.7, baseH);
    // shaft
    ctx.fillRect(b.x, b.top + b.h * 0.16, b.w, b.h);
    // pyramid top
    ctx.beginPath();
    ctx.moveTo(b.x - 1, b.top + b.h * 0.16);
    ctx.lineTo(b.x + b.w / 2, b.top);
    ctx.lineTo(b.x + b.w + 1, b.top + b.h * 0.16);
    ctx.closePath();
    ctx.fill();
    // the clock, lit after dark
    const cy = b.top + b.h * 0.30;
    ctx.beginPath();
    ctx.arc(b.x + b.w / 2, cy, b.w * 0.30, 0, TAU);
    ctx.fillStyle = night > 0.15
      ? `rgba(255,228,170,${0.35 + night * 0.5})`
      : 'rgba(220,220,225,0.35)';
    ctx.fill();
  }

  function drawWater(ctx, t, stops, night, dayness, glow, sunX, sunAltDeg, moonX, moonUp, mph, reduced) {
    const wh = h - horizonY;
    // the harbor: mostly the upper sky darkened, with a trace of horizon color
    const base = mixc(stops[1], [6, 9, 18], 0.45);
    const shallow = mixc(base, stops[3], 0.28);
    const deep = mixc(base, [3, 5, 11], 0.58);
    const g = ctx.createLinearGradient(0, horizonY, 0, h);
    g.addColorStop(0, css(shallow));
    g.addColorStop(1, css(deep));
    ctx.fillStyle = g;
    ctx.fillRect(0, horizonY, w, wh);

    // shimmer strokes
    const srng = mulberry32(777);
    const n = Math.round(w / 18);
    for (let i = 0; i < n; i++) {
      const sx = srng() * w;
      const sy = horizonY + 4 + Math.pow(srng(), 1.6) * (wh - 10);
      const len = 6 + srng() * 26;
      const sp = 0.4 + srng() * 1.4;
      const ph = srng() * TAU;
      const flick = reduced ? 0.6 : 0.35 + 0.65 * Math.max(0, Math.sin(t * sp + ph));
      const base = mixc(stops[3], [220, 226, 240], 0.4);
      ctx.fillStyle = css(base, 0.05 + 0.10 * flick * (0.4 + glow));
      ctx.fillRect(sx, sy, len, 1);
    }

    // light column from the brightest thing in the sky
    const column = (cx, tint, strength) => {
      if (strength < 0.03) return;
      const crng = mulberry32(555);
      const colW = w * 0.045;
      for (let i = 0; i < 26; i++) {
        const fy = Math.pow(crng() * 0.98, 1.25);
        const sy = horizonY + 3 + fy * (wh - 8);
        const jitter = (crng() - 0.5) * colW * (0.6 + fy);
        const len = 5 + crng() * 20 * (1 - fy * 0.5);
        const sp = 0.5 + crng() * 1.3;
        const flick = reduced ? 0.6 : 0.3 + 0.7 * Math.max(0, Math.sin(t * sp + crng() * TAU));
        ctx.fillStyle = css(tint, strength * (0.10 + 0.22 * flick) * (1 - fy * 0.55));
        ctx.fillRect(cx + jitter - len / 2, sy, len, 1.4);
      }
    };
    if (sunAltDeg > -1 && sunAltDeg < 30) {
      column(clamp(sunX, 0, w), [255, 176, 108], smooth(30, 2, sunAltDeg) * 0.9 + 0.15);
    }
    if (moonUp && night > 0.2 && mph.illumination > 0.15) {
      column(clamp(moonX, 0, w), [222, 226, 220], night * mph.illumination * 0.7);
    }
  }

  /* ---------- what falls through the air, by season ---------- */

  function drawSeasonParticles(ctx, t, parts, night) {
    const m = parts.m; // 0-based month
    if (m === 11 || m === 0 || m === 1) {
      // snow
      const rng = mulberry32(11);
      const n = Math.round(w / 9);
      for (let i = 0; i < n; i++) {
        const speed = 14 + rng() * 34;
        const x0 = rng() * w;
        const drift = 10 + rng() * 24;
        const ph = rng() * TAU;
        const r = 0.8 + rng() * 1.6;
        const y = ((t * speed + rng() * h * 4) % (h + 20)) - 10;
        const x = (x0 + Math.sin(t * 0.5 + ph) * drift + t * 6 + w) % w;
        ctx.fillStyle = `rgba(235,240,248,${0.25 + r * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }
    } else if (m >= 8 && m <= 10) {
      // falling leaves
      const rng = mulberry32(9);
      const shades = [[196, 122, 54], [176, 84, 44], [206, 154, 60], [150, 92, 48]];
      const n = Math.round(w / 34);
      for (let i = 0; i < n; i++) {
        const speed = 22 + rng() * 30;
        const x0 = rng() * w;
        const sway = 26 + rng() * 40;
        const ph = rng() * TAU;
        const c = shades[Math.floor(rng() * shades.length)];
        const y = ((t * speed + rng() * h * 4) % (h + 24)) - 12;
        const x = (x0 + Math.sin(t * 0.7 + ph) * sway + w) % w;
        const rot = t * (0.8 + rng()) + ph;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = css(c, 0.5);
        ctx.beginPath();
        ctx.ellipse(0, 0, 3.2, 1.6, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    } else if (m >= 5 && m <= 7 && night > 0.35) {
      // fireflies over the water's edge
      const rng = mulberry32(6);
      const n = 22;
      for (let i = 0; i < n; i++) {
        const bx = rng() * w;
        const by = horizonY - 10 - rng() * h * 0.16;
        const rr = 16 + rng() * 30;
        const sp = 0.10 + rng() * 0.16;
        const ph = rng() * TAU;
        const blinkSp = 0.4 + rng() * 0.9;
        const x = bx + Math.cos(t * sp + ph) * rr;
        const y = by + Math.sin(t * sp * 1.4 + ph) * rr * 0.5;
        const blink = Math.max(0, Math.sin(t * blinkSp + ph * 3));
        const a = night * Math.pow(blink, 3) * 0.85;
        if (a < 0.04) continue;
        ctx.fillStyle = `rgba(214,255,140,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.4, 0, TAU);
        ctx.fill();
      }
    } else if (m >= 2 && m <= 4) {
      // spring: petals drift on some days
      const dayKey = parts.y * 10000 + (parts.m + 1) * 100 + parts.d;
      const drng = mulberry32(dayKey);
      if (drng() < 0.5) {
        const rng = mulberry32(33);
        const n = Math.round(w / 46);
        for (let i = 0; i < n; i++) {
          const speed = 12 + rng() * 18;
          const x0 = rng() * w;
          const sway = 30 + rng() * 40;
          const ph = rng() * TAU;
          const y = ((t * speed + rng() * h * 4) % (h + 20)) - 10;
          const x = (x0 + Math.sin(t * 0.6 + ph) * sway + w) % w;
          ctx.fillStyle = 'rgba(232,190,200,0.45)';
          ctx.beginPath();
          ctx.ellipse(x, y, 2.4, 1.4, ph + t * 0.5, 0, TAU);
          ctx.fill();
        }
      }
    }
  }

  /* ---------- loop ---------- */

  function frame() {
    if (!running) return;
    if (reduced) {
      const now = performance.now();
      if (now - lastStatic > 60000 || lastStatic === 0) {
        draw();
        lastStatic = now;
      }
    } else {
      draw();
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  resize();
  window.addEventListener('resize', () => { resize(); lastStatic = 0; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else { lastStatic = 0; start(); }
  });

  return { start, stop, redraw: draw };
}
