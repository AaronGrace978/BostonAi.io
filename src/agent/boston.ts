/** Curated offline Boston knowledge — no network. */

const TOPICS: Record<string, string> = {
  mbta: [
    'MBTA rapid transit (subway): Red, Orange, Blue, Green (B/C/D/E branches), Mattapan Trolley; plus Silver Line BRT and Commuter Rail.',
    'Key hubs: Park Street, Downtown Crossing, South Station, North Station, Airport (Blue), Harvard (Red).',
    'For live arrivals use MBTA v3 API (api-v3.mbta.com) — BostonAI does not call it unless fetch_url is enabled.',
  ].join('\n'),
  neighborhoods: [
    'Boston proper: Back Bay, Beacon Hill, North End, South End, Fenway–Kenmore, Seaport, Chinatown, Downtown, West End.',
    'Nearby cities often treated as "Boston tech": Cambridge (Kendall/MIT, Harvard Sq), Somerville (Union/Davis), Brookline.',
    'Coords for downtown Boston Harbor area: ~42.3601° N, 71.0589° W.',
  ].join('\n'),
  civic: [
    'City of Boston open data: data.boston.gov',
    'Common resident topics: parking (ParkBoston), 311, permits, BOS:311 app, Bluebikes, MassDOT 511.',
    'BostonAI is not an official city service — verify legal/permit advice with primary sources.',
  ].join('\n'),
  weather_harbor: [
    'Harbor & seasons matter: Nor\'easters, humid summers, short winter daylight, fog over the harbor.',
    'The archived bostonai.io almanac computed sun/moon/tide locally in-browser for these coordinates.',
  ].join('\n'),
  builders: [
    'Local builder culture: Cursor Boston meetups, MIT/Harvard/Northeastern talent, Kendall Square labs, Seaport startups.',
    'BostonAI positioning: coding agent + local context — not a generic chat wrapper.',
  ].join('\n'),
}

export function bostonContext(query: string): string {
  const q = query.toLowerCase()
  const hits: string[] = []
  const add = (key: keyof typeof TOPICS, label: string) => {
    if (
      q.includes(key) ||
      (key === 'mbta' && /(transit|subway|t\b|commuter)/.test(q)) ||
      (key === 'neighborhoods' && /(neighborhood|cambridge|somerville|seaport|back bay)/.test(q)) ||
      (key === 'civic' && /(311|permit|parking|city)/.test(q)) ||
      (key === 'weather_harbor' && /(weather|harbor|tide|season)/.test(q)) ||
      (key === 'builders' && /(hackathon|startup|builder|meetup)/.test(q))
    ) {
      hits.push(`### ${label}\n${TOPICS[key]}`)
    }
  }
  add('mbta', 'MBTA / Transit')
  add('neighborhoods', 'Neighborhoods')
  add('civic', 'Civic / city services')
  add('weather_harbor', 'Harbor & seasons')
  add('builders', 'Builder scene')

  if (hits.length === 0) {
    return [
      'No narrow match — general Boston briefing:',
      TOPICS.neighborhoods,
      '',
      TOPICS.mbta,
      '',
      'Tip: ask specifically about mbta, neighborhoods, civic, harbor, or builders.',
    ].join('\n')
  }
  return hits.join('\n\n')
}
