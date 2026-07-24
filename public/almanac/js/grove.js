/*
 * grove.js — one tree, planted July 3, 2026.
 *
 * The tree's shape was fixed the day it was planted (a seeded PRNG),
 * so it is the same tree every visit — it only gets older. Growth is
 * a pure function of the date: 182 days from sprout to full crown,
 * finishing December 31, 2026. After that it simply lives here,
 * changing with the seasons like everything else on this page.
 */

import { bostonParts, mulberry32, daysBetween } from './astro.js';

export const PLANTED = new Date(Date.UTC(2026, 6, 3, 4, 0)); // July 3, 2026, midnight EDT
export const GROWTH_DAYS = 181; // day 0 = July 3 … day 181 = Dec 31

const TAU = Math.PI * 2;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export function growthAt(now) {
  return clamp01(daysBetween(PLANTED, now) / GROWTH_DAYS);
}
export function dayNumber(now) {
  return Math.floor(daysBetween(PLANTED, now)) + 1; // day 1 = July 3
}

/* ---------- structure (fixed at planting) ---------- */

const MAXD = 8;

function buildTree() {
  const rng = mulberry32(20260703);
  let leafId = 0;

  function branch(depth, baseAngle) {
    const spread = 0.30 + rng() * 0.35;
    const node = {
      depth,
      // relative angle to the parent
      ang: baseAngle + (rng() - 0.5) * 0.22,
      lenF: depth === 0 ? 1 : 0.66 + rng() * 0.16,
      birth: depth === 0 ? 0 : (depth + rng() * 0.7) / (MAXD + 1.6),
      sway: rng() * TAU,
      children: [],
      leafSeed: rng(),
      leafId: leafId++,
    };
    if (depth < MAXD) {
      const kids = depth < 2 ? 2 : (rng() < 0.16 ? 3 : 2);
      for (let i = 0; i < kids; i++) {
        const dir = kids === 1 ? 0 : (i / (kids - 1)) * 2 - 1; // -1..1
        node.children.push(branch(depth + 1, dir * spread));
      }
    }
    return node;
  }
  return branch(0, 0);
}

const TREE = buildTree();

/* ---------- foliage by calendar ---------- */

function foliage(parts) {
  const { m, d } = parts; // m is 0-based
  // returns { colors: [[r,g,b]...], density: 0..1, blossom: bool, snow: bool }
  if (m === 2) return { colors: [[168, 196, 120]], density: 0.25 + (d / 31) * 0.3, snow: d < 10 };
  if (m === 3) return { colors: [[224, 186, 196], [232, 214, 218], [176, 202, 130]], density: 0.85, blossom: true };
  if (m === 4) return { colors: [[124, 176, 96], [104, 160, 84]], density: 1 };
  if (m >= 5 && m <= 7) return { colors: [[84, 138, 72], [70, 122, 62], [96, 150, 78]], density: 1 };
  if (m === 8) {
    const t = d / 30;
    return { colors: [[84, 138, 72], [160, 140, 58], [190, 120, 48]], density: 1, mix: t };
  }
  if (m === 9) {
    const drop = d > 18 ? (d - 18) / 13 * 0.45 : 0;
    return { colors: [[206, 128, 44], [186, 84, 40], [212, 160, 56]], density: 1 - drop };
  }
  if (m === 10) return { colors: [[150, 96, 48], [128, 84, 46]], density: Math.max(0.04, 0.5 - (d / 30) * 0.48) };
  // Dec, Jan, Feb — bare, a few stubborn oak leaves
  return { colors: [[112, 86, 54]], density: 0.03, snow: true };
}

function holidayLights(parts) {
  // Dec 21 – Jan 6, every year the tree stands
  return (parts.m === 11 && parts.d >= 21) || (parts.m === 0 && parts.d <= 6);
}

const LIGHT_COLORS = ['rgba(255,214,130,', 'rgba(255,120,110,', 'rgba(150,214,255,', 'rgba(190,255,160,'];

/* ---------- renderer ---------- */

export function createGrove(canvas, getNow) {
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0, dpr = 1, baseY = 0, unit = 0;
  let raf = 0, running = false, lastStatic = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    baseY = h * 0.88;
    // trunk target length — the full crown stacks to ~3x this, so keep headroom
    unit = Math.min(h * 0.235, w * 0.17);
  }

  function draw() {
    const now = getNow();
    const t = now.valueOf() / 1000;
    const parts = bostonParts(now);
    const g = growthAt(now);
    const leaf = foliage(parts);
    const lights = holidayLights(parts);
    const scale = 0.30 + 0.70 * Math.pow(g, 0.85);

    ctx.clearRect(0, 0, w, h);

    /* ground */
    const winter = parts.m === 11 || parts.m <= 1;
    ctx.strokeStyle = 'rgba(214,216,232,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.06, baseY);
    ctx.lineTo(w * 0.94, baseY);
    ctx.stroke();

    if (winter) {
      ctx.fillStyle = 'rgba(226,232,240,0.10)';
      ctx.beginPath();
      ctx.ellipse(w / 2, baseY + 1, w * 0.30, 7, 0, Math.PI, 0);
      ctx.fill();
    } else {
      // grass tufts
      const grng = mulberry32(51);
      ctx.strokeStyle = 'rgba(120,150,96,0.28)';
      for (let i = 0; i < 40; i++) {
        const gx = w * 0.10 + grng() * w * 0.80;
        const gh = 2.5 + grng() * 5;
        const lean = (grng() - 0.5) * 3;
        ctx.beginPath();
        ctx.moveTo(gx, baseY);
        ctx.quadraticCurveTo(gx + lean, baseY - gh * 0.6, gx + lean * 1.6, baseY - gh);
        ctx.stroke();
      }
    }

    // soft root shadow
    const sh = ctx.createRadialGradient(w / 2, baseY, 0, w / 2, baseY, unit * scale * 0.9);
    sh.addColorStop(0, 'rgba(0,0,0,0.28)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh;
    ctx.beginPath();
    ctx.ellipse(w / 2, baseY + 2, unit * scale * 0.9, 6, 0, 0, TAU);
    ctx.fill();

    /* the tree */
    const leaves = [];
    const lightPts = [];

    ctx.save();
    ctx.translate(w / 2, baseY);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4d4238';

    (function drawBranch(node, len, wid) {
      const birthWindow = 1.35 / (MAXD + 1.6);
      const tt = clamp01((g - node.birth) / birthWindow);
      if (tt <= 0) return;
      const drawLen = len * easeOut(tt);

      const swayAmp = reduced ? 0 : 0.012 * (node.depth / MAXD);
      const sway = swayAmp * Math.sin(t * (0.5 + node.depth * 0.13) + node.sway);

      ctx.save();
      ctx.rotate(node.ang + sway + (node.depth === 0 ? 0 : 0));

      ctx.lineWidth = Math.max(0.6, wid * (0.5 + 0.5 * tt));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -drawLen);
      ctx.stroke();

      // winter: snow resting on grown branches
      if (leaf.snow && tt > 0.8 && node.depth >= 2 && node.leafSeed < 0.5) {
        ctx.strokeStyle = 'rgba(230,236,244,0.30)';
        ctx.lineWidth = Math.max(0.5, wid * 0.4);
        ctx.beginPath();
        ctx.moveTo(0, -drawLen * 0.3);
        ctx.lineTo(0, -drawLen * 0.85);
        ctx.stroke();
        ctx.strokeStyle = '#4d4238';
      }

      ctx.translate(0, -drawLen);

      // leaf/light anchors: the canopy frontier — branches whose children
      // haven't fully grown in yet — plus the outer generations when mature
      const childLead = node.children.length
        ? Math.max(...node.children.map((ch) => g - ch.birth))
        : -1;
      const frontier = node.children.length === 0 || childLead < birthWindow * 1.1;
      if (tt > 0.35 && node.depth >= 1 && (frontier || node.depth >= MAXD - 2)) {
        const m = ctx.getTransform();
        const px = m.e / dpr, py = m.f / dpr;
        if (node.leafSeed < leaf.density) {
          leaves.push({ x: px, y: py, seed: node.leafSeed, id: node.leafId, tt, depth: node.depth });
        }
        if (lights && node.leafId % 3 === 0) {
          lightPts.push({ x: px, y: py, id: node.leafId });
        }
      }

      for (const child of node.children) {
        drawBranch(child, len * child.lenF, wid * 0.64);
      }
      ctx.restore();
    })(TREE, unit * scale, Math.max(3, unit * scale * 0.075));

    ctx.restore();

    /* leaves — clusters of leaflets, drawn after wood so they sit on top */
    for (const lf of leaves) {
      let c;
      if (leaf.mix !== undefined) {
        // September: each leaf turns on its own schedule
        c = lf.seed < leaf.mix ? leaf.colors[1 + (lf.id % 2)] : leaf.colors[0];
      } else {
        c = leaf.colors[lf.id % leaf.colors.length];
      }
      const wob = reduced ? 0 : Math.sin(t * 0.8 + lf.id) * 0.7;
      // young canopies carry slightly bigger leaves for their size
      const youth = 1 + Math.max(0, (MAXD - 1 - lf.depth)) * 0.18;
      const size = Math.min(1, lf.tt * 1.5);
      const r = (2.0 + (lf.id % 3) * 0.7) * size * Math.min(youth, 1.8);
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.78)`;
      const n = leaf.density > 0.2 ? 3 : 1;
      for (let k = 0; k < n; k++) {
        const a = lf.id * 2.4 + k * (TAU / 3);
        const dx = Math.cos(a) * r * 1.35;
        const dy = Math.sin(a) * r * 1.05 - r * 0.4;
        ctx.beginPath();
        ctx.ellipse(lf.x + wob + dx, lf.y + dy, r * 1.2, r * 0.8, a, 0, TAU);
        ctx.fill();
      }
    }

    /* holiday lights */
    if (lights) {
      for (const lp of lightPts) {
        const col = LIGHT_COLORS[lp.id % LIGHT_COLORS.length];
        const twinkle = reduced ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(t * 1.6 + lp.id * 1.7));
        ctx.fillStyle = col + (0.18 * twinkle) + ')';
        ctx.beginPath();
        ctx.arc(lp.x, lp.y, 5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = col + (0.95 * twinkle) + ')';
        ctx.beginPath();
        ctx.arc(lp.x, lp.y, 1.6, 0, TAU);
        ctx.fill();
      }
    }

    /* first week: a small stake and marker, like any young street tree */
    if (g < 0.06) {
      ctx.strokeStyle = 'rgba(214,216,232,0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w / 2 + 18, baseY);
      ctx.lineTo(w / 2 + 14, baseY - 34);
      ctx.stroke();
    }
  }

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

  return { start, stop };
}
