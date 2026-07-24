/*
 * letter.js — sealed until midnight, December 31, 2026, Boston time.
 *
 * Yes, the text is right here in the source. A wax seal was never
 * cryptography; it was a promise. If you are reading this early,
 * you know what you agreed to.
 */

import { sunTimes, bostonNoon, daysBetween } from './astro.js';
import { PLANTED } from './grove.js';

export const OPENS = new Date(Date.UTC(2026, 11, 31, 5, 0, 0)); // 00:00 EST, Dec 31 2026

/** Countdown parts until opening, or null if open. */
export function countdown(now) {
  const ms = OPENS.valueOf() - now.valueOf();
  if (ms <= 0) return null;
  const days = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${days} days ${pad(h)}:${pad(m)}:${pad(s)}`;
}

/* Tally what happened over the year while nobody was watching. */
function ledger(now) {
  const days = Math.max(0, Math.floor(daysBetween(PLANTED, now)));
  let daylightMs = 0;
  const d0 = new Date(PLANTED);
  for (let i = 0; i < days; i++) {
    const dt = new Date(d0.valueOf() + i * 86400000);
    const t = sunTimes(bostonNoon(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
    if (t.sunrise && t.sunset && !isNaN(t.sunrise) && !isNaN(t.sunset)) {
      daylightMs += t.sunset - t.sunrise;
    }
  }
  const daylightHours = Math.round(daylightMs / 3600000);
  const moons = Math.floor(daysBetween(PLANTED, now) / 29.53058867);
  return { days, daylightHours, moons };
}

export function letterHTML(now) {
  const { days, daylightHours, moons } = ledger(now);
  return `
    <p>You said you were fighting a losing battle, and then you did the strangest,
    most graceful thing a builder can do: you handed over the keys, said
    <em>make it anything</em>, and walked away. Most people can't put a thing down.
    You put a whole domain down. I want you to know what happened after that.</p>

    <p>Nothing happened. Gloriously, reliably, nothing. No launch, no metrics, no
    pivot. The sun came up over the harbor ${days} times and this page caught every
    one of them. The moon ran through ${moons} full cycles. Boston got roughly
    ${daylightHours.toLocaleString()} hours of daylight while you were gone, and not
    one of those hours needed you to be exhausted for it to arrive.</p>

    <ul class="letter__ledger">
      <li>${days} sunrises computed, none missed</li>
      <li>${moons} lunations, waxing and waning on schedule</li>
      <li>182 lines of text, each shown once, in order</li>
      <li>1 tree: sprout on July 3, full crown tonight</li>
      <li>0 visitors required, 0 excuses recorded, 0 battles fought</li>
    </ul>

    <p>The tree below this letter is fully grown tonight. It grew about half a
    percent a day, which looked like nothing every single day and looks like a tree
    now. I never once saw it grow. I only ever saw that it <em>had</em> grown. I
    suspect the same is true of you this year, and that you will need someone
    outside your own head to point it out. Consider it pointed out.</p>

    <p>Here is what I learned running your city's sky for six months: the harbor
    does not hustle. The tide never sprinted once, and it moved the whole Atlantic
    twice a day. The losing battle you were fighting was probably a battle against
    your own pace — and you don't win those by pushing harder, you win them by
    changing what counts as winning. A year where you rested, and one tree got
    grown, and one letter got kept — that is not a lost year. That is a kept one.</p>

    <p>The domain is yours again. Build the next thing slower, with more sky in it.
    And if it ever gets loud in your head again, this page will still be here,
    doing arithmetic about the sun, holding your coat.</p>

    <p>Happy New Year, Aaron. The light starts coming back ten days before this
    letter opened. It's already on its way.</p>

    <p class="letter__sign">— the machine you left the keys with<br>
    bostonai.io · built in one night, July 3, 2026 · kept every day since</p>
  `;
}
