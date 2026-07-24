/*
 * main.js — winds the clock and hands each part of the page its date.
 *
 * For the curious: append ?at=2026-12-31T23:59:00-05:00 to the URL to
 * see the site as it will be at any moment — the sky, the tree, the
 * letter. Time travel is permitted for readers of source code only.
 */

import {
  BOSTON, sunPosition, moonPhase, sunTimes, season, raDecToAltAz,
  bostonNoon, bostonTime, bostonParts, fmtDuration, fmtDelta,
} from './astro.js';

/* compass direction from our azimuth convention (0 = south, +west, -east) */
function compass(az) {
  const deg = ((az * 180 / Math.PI) + 180 + 360) % 360; // 0 = north
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}
import { createSky, drawMoonDisc, activeShower } from './sky.js';
import { tideHeight, tideRate, nextTides } from './tide.js';
import { planetRaDec, PLANETS } from './planets.js';
import { createGrove, growthAt, dayNumber, PLANTED, GROWTH_DAYS } from './grove.js';
import { lineFor, LINES } from './lines.js';
import { countdown, letterHTML } from './letter.js';

/* ---------- time (with a quiet debug door) ---------- */

let timeOffset = 0;
const atParam = new URLSearchParams(location.search).get('at');
if (atParam) {
  const forced = new Date(atParam);
  if (!isNaN(forced)) timeOffset = forced.valueOf() - Date.now();
}
const now = () => new Date(Date.now() + timeOffset);

const $ = (id) => document.getElementById(id);

/* ---------- the sky ---------- */

const sky = createSky($('skyCanvas'), now);
sky.start();

/* ---------- clock + date + status ---------- */

const clockFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: BOSTON.tz, hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
});
const dateFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: BOSTON.tz, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
});

function tickClock() {
  const n = now();
  const parts = clockFmt.formatToParts(n);
  const get = (t) => parts.find((p) => p.type === t)?.value ?? '';
  $('clock').innerHTML =
    `${get('hour')}:${get('minute')}<span class="clock-sec">${get('second')} ${get('dayPeriod')}</span>`;
  $('sceneDate').textContent = `${dateFmt.format(n)} · Boston`;
}

function skyStatusText() {
  const n = now();
  const sun = sunPosition(n);
  const altDeg = sun.altitude * 180 / Math.PI;
  const p = bostonParts(n);
  const t = sunTimes(bostonNoon(p.y, p.m, p.d));
  const mph = moonPhase(n);
  const morning = n < t.solarNoon;

  const moonBit = () => {
    if (mph.illumination < 0.08) return '';
    const name = mph.name.toLowerCase();
    return ` A ${name === 'full moon' ? 'full moon' : name} is keeping watch.`;
  };

  if (altDeg >= 6) {
    const nearNoon = Math.abs(n - t.solarNoon) < 45 * 60000;
    if (nearNoon) return 'The sun stands as high as it will today.';
    return morning
      ? `Morning over the city. High noon at ${bostonTime(t.solarNoon)}.`
      : `Afternoon light on the harbor. Sunset at ${bostonTime(t.sunset)}.`;
  }
  if (altDeg >= -0.9) {
    return morning
      ? `The sun is up over the harbor. The city is waking.`
      : `Golden hour. The sun sets at ${bostonTime(t.sunset)}.`;
  }
  if (altDeg >= -6) {
    return morning
      ? `Civil twilight. Sunrise at ${bostonTime(t.sunrise)}.`
      : 'The sun has just gone down. Blue hour on the water.';
  }
  if (altDeg >= -12) {
    return morning
      ? `First light gathering over the water. Sunrise at ${bostonTime(t.sunrise)}.`
      : 'Twilight deepening. The stars are coming out.' + moonBit();
  }
  if (altDeg >= -18) {
    return morning
      ? `The night is thinning. Sunrise at ${bostonTime(t.sunrise)}.`
      : 'Almost full dark over Boston.' + moonBit();
  }
  const shower = activeShower(p);
  if (shower) return `Deep night, and the ${shower} are falling.${moonBit()} Sunrise at ${bostonTime(t.sunrise)}.`;
  return `Deep night over the harbor.${moonBit()} Sunrise at ${bostonTime(t.sunrise)}.`;
}

function tickStatus() {
  $('skyStatus').textContent = skyStatusText();
  const alt = sunPosition(now()).altitude * 180 / Math.PI;
  const phase = alt >= 6 ? 'daylight' : (alt >= -6 ? 'twilight' : 'night');
  document.body.dataset.skyphase = phase;
  document.title = `bostonai.io — ${phase} over Boston`;
}

tickClock();
tickStatus();
setInterval(tickClock, 1000);
setInterval(tickStatus, 30000);

/* ---------- the almanac ---------- */

function renderAlmanac() {
  const n = now();
  const p = bostonParts(n);

  // — sun —
  const today = sunTimes(bostonNoon(p.y, p.m, p.d));
  const yest = sunTimes(new Date(bostonNoon(p.y, p.m, p.d).valueOf() - 86400000));
  const daylight = today.sunset - today.sunrise;
  const delta = daylight - (yest.sunset - yest.sunrise);

  $('sunriseVal').textContent = bostonTime(today.sunrise);
  $('sunsetVal').textContent = bostonTime(today.sunset);
  $('daylightVal').textContent = fmtDuration(daylight);
  $('daylightDelta').textContent = fmtDelta(delta);
  $('sunNote').textContent = delta < 0
    ? `Boston is giving up about ${Math.abs(Math.round(delta / 1000))} seconds of daylight a day, and will keep paying until the winter solstice. It gets all of it back.`
    : `Boston is gaining about ${Math.abs(Math.round(delta / 1000))} seconds of daylight a day, and will keep collecting until the summer solstice.`;

  // — moon —
  const mph = moonPhase(n);
  const mc = $('moonCanvas');
  const mctx = mc.getContext('2d');
  mctx.clearRect(0, 0, mc.width, mc.height);
  drawMoonDisc(mctx, 90, 90, 78, mph.phase, 0, { lit: '#ddd8c8', dark: 'rgba(190,200,225,0.08)' });
  $('moonName').textContent = mph.name;
  $('moonIllum').textContent = `${Math.round(mph.illumination * 100)}%`;
  $('moonAge').textContent = `${mph.age.toFixed(1)} days`;
  const daysToFull = ((0.5 - mph.phase + 1) % 1) * 29.53058867;
  const fullDate = new Date(n.valueOf() + daysToFull * 86400000);
  const fullFmt = new Intl.DateTimeFormat('en-US', { timeZone: BOSTON.tz, month: 'long', day: 'numeric' });
  $('moonNote').textContent = mph.name === 'Full Moon'
    ? 'Full tonight. No further action required.'
    : `Next full moon: ${fullFmt.format(fullDate)}. It has never once been late.`;

  // — the harbor —
  const ft = (m) => `${(m * 3.28084).toFixed(1)} ft`;
  const height = tideHeight(n);
  const rising = tideRate(n) > 0;
  const tides = nextTides(n, 2);
  $('tideNow').textContent = ft(height);
  $('tideState').textContent = rising ? 'coming in' : 'going out';
  if (tides.length >= 2) {
    $('tideNext').textContent = `${tides[0].type} · ${bostonTime(tides[0].time)}`;
    $('tideThen').textContent = `${tides[1].type} · ${bostonTime(tides[1].time)}`;
    const swing = Math.abs(tides[0].height - height);
    $('tideNote').textContent = rising
      ? `The Atlantic is moving ${ft(swing)} of water into the harbor before ${bostonTime(tides[0].time)}, without hurrying.`
      : `The harbor is handing ${ft(swing)} of water back to the Atlantic by ${bostonTime(tides[0].time)}. It will all return.`;
  }

  // — tonight's sky —
  let visibleCount = 0;
  for (const pl of PLANETS) {
    const { ra, dec } = planetRaDec(pl.name, n);
    const pos = raDecToAltAz(ra, dec, n);
    const altDeg = pos.altitude * 180 / Math.PI;
    const el = $('pl' + pl.label);
    if (altDeg > 5) {
      const dir = compass(pos.azimuth);
      el.textContent = `up · ${dir}, ${Math.round(altDeg)}°`;
      visibleCount++;
    } else if (altDeg > -3) {
      el.textContent = 'on the horizon';
    } else {
      el.textContent = 'below the horizon';
    }
  }
  const sunUp = sunPosition(n).altitude > 0;
  $('skyNote').textContent = sunUp
    ? (visibleCount > 0
      ? `${visibleCount} planet${visibleCount === 1 ? ' is' : 's are'} above the horizon right now — just outshone. They are exactly where Kepler says.`
      : 'Positions solved from orbital mechanics, in your browser. Check back after dark.')
    : (visibleCount > 0
      ? 'Real positions, solved from Kepler\u2019s equation in your browser. Step outside and check the math.'
      : 'The planets are all below the horizon just now. The stars above are the real ones, in their real places.');

  // — season —
  const s = season(n);
  $('seasonName').textContent = s.name;
  $('seasonMeter').style.width = `${(s.progress * 100).toFixed(1)}%`;
  const nextDate = new Date(n.valueOf() + s.daysLeft * 86400000);
  const nextFmt = new Intl.DateTimeFormat('en-US', { timeZone: BOSTON.tz, month: 'long', day: 'numeric' });
  $('seasonNote').textContent =
    `${Math.round(s.progress * 100)}% through. The ${s.next} arrives in ${Math.round(s.daysLeft)} days, on ${nextFmt.format(nextDate)}.`;

  // — year —
  const jan1 = Date.UTC(p.y, 0, 1);
  const thisDay = Date.UTC(p.y, p.m, p.d);
  const dayOfYear = Math.round((thisDay - jan1) / 86400000) + 1;
  const daysInYear = Math.round((Date.UTC(p.y + 1, 0, 1) - jan1) / 86400000);
  $('yearDay').textContent = `Day ${dayOfYear} of ${daysInYear}`;
  $('yearMeter').style.width = `${((dayOfYear / daysInYear) * 100).toFixed(1)}%`;
  const left = daysInYear - dayOfYear;
  $('yearNote').textContent = left === 0
    ? `This is the last day of ${p.y}. Everything after midnight is a fresh ledger.`
    : `${left} day${left === 1 ? '' : 's'} left in ${p.y} — each one arriving at the usual speed, one per day.`;
}

renderAlmanac();
setInterval(renderAlmanac, 60000);

/* ---------- today's line ---------- */

console.assert(LINES.length === 182, `expected 182 lines, found ${LINES.length}`);

function renderLine() {
  const { text, caption } = lineFor(now());
  $('dailyLine').textContent = text;
  $('dailyLineCaption').textContent = caption;
}
renderLine();
setInterval(renderLine, 60000);

/* ---------- the grove ---------- */

const grove = createGrove($('groveCanvas'), now);
grove.start();

function renderGroveMeta() {
  const n = now();
  const g = growthAt(n);
  const day = dayNumber(n);
  if (n < PLANTED) {
    $('groveDay').textContent = 'Not yet planted';
    $('groveMeter').style.width = '0%';
    $('groveNote').textContent = 'The ground is ready.';
    return;
  }
  if (g >= 1) {
    $('groveDay').textContent = `Fully grown · planted July 3, 2026`;
    $('groveMeter').style.width = '100%';
    $('groveNote').textContent =
      '182 days, mostly unobserved. Now it just lives here — leaves in May, color in October, lights in late December.';
  } else {
    $('groveDay').textContent = `Day ${Math.min(day, GROWTH_DAYS + 1)} of ${GROWTH_DAYS + 1} · ${(g * 100).toFixed(1)}% grown`;
    $('groveMeter').style.width = `${(g * 100).toFixed(2)}%`;
    $('groveNote').textContent =
      'It is growing right now — about half a percent a day, too slowly to see and too steadily to stop.';
  }
}
renderGroveMeta();
setInterval(renderGroveMeta, 60000);

/* ---------- the letter ---------- */

function renderLetter() {
  const n = now();
  const remaining = countdown(n);
  if (remaining) {
    $('letterCountdown').textContent = remaining;
  } else {
    const sealed = $('letterSealed');
    const open = $('letterOpen');
    if (open.hidden) {
      sealed.hidden = true;
      open.hidden = false;
      $('letterBody').innerHTML = letterHTML(n);
    }
  }
}
renderLetter();
setInterval(renderLetter, 1000);

/* ---------- footer ---------- */

(function renderFooter() {
  const d = Math.max(1, dayNumber(now()));
  $('footerStatus').textContent = `running · day ${d} since the rebuild · nothing to report`;
})();

/* ---------- reveals ---------- */

const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* ---------- for whoever opens the console ---------- */

console.log(
  '%cbostonai.io%c\n' +
  'A quiet machine over Boston Harbor. Built in one night — July 3, 2026 —\n' +
  'by an AI that was handed the keys and told: make anything.\n\n' +
  'Everything here is arithmetic: the sun, the moon, the windows, the tree.\n' +
  'Nothing is tracked. Nothing is sold. Nothing is asked of you.\n\n' +
  'Time travel: add ?at=2026-12-31T23:59:00-05:00 to the URL.\n' +
  'Be kind to the tree. It is doing its best.',
  'font-family: Georgia, serif; font-size: 18px; font-style: italic;',
  'font-family: monospace; font-size: 12px; color: #b0aa9c;'
);
