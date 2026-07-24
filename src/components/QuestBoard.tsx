interface Quest {
  title: string
  tag: string
  brief: string
  goal: string
}

const QUESTS: Quest[] = [
  {
    title: 'Neon Snake',
    tag: 'arcade',
    brief: 'The classic, re-skinned for the Harbor.',
    goal:
      'Build a neon snake game with a cyberpunk Boston skin — amber snake on a dark grid, arrow keys and WASD, score counter, speed ramps up as you eat, game-over screen with a restart button.',
  },
  {
    title: 'T-Line Runner',
    tag: 'arcade',
    brief: 'Dodge Red Line trains in a neon tunnel.',
    goal:
      'Build an endless runner where a courier sprints through a neon subway tunnel dodging oncoming Red Line trains. Spacebar or click to jump, score by distance, speed increases over time, game-over with best score.',
  },
  {
    title: 'Harbor Tides',
    tag: 'ambient',
    brief: 'Layered waves that breathe with the clock.',
    goal:
      'Build an animated Boston Harbor tide scene — layered neon wave bands on a canvas that slowly rise and fall over a day cycle, a glowing digital clock, and a moon that drifts across the sky.',
  },
  {
    title: 'Synthwave Landing',
    tag: 'web',
    brief: 'A page for a fictional netrunner collective.',
    goal:
      'Build a synthwave landing page for a fictional Boston netrunner collective — animated grid horizon hero, glowing headline, three feature cards, and a styled contact form (no backend, just the front end).',
  },
  {
    title: 'Freedom Trail Trivia',
    tag: 'quiz',
    brief: 'Eight questions of Boston history.',
    goal:
      'Build a Freedom Trail trivia quiz — 8 multiple-choice questions about Boston history, one at a time with neon styling, instant right/wrong feedback, final score screen, and a restart button.',
  },
  {
    title: 'Citgo Clock',
    tag: 'toy',
    brief: 'The Kenmore sign, but it tells time.',
    goal:
      'Build a pixel-art rendition of the Citgo sign that works as a real clock — the triangle pulses once per second, the current time glows beneath it, and the background shifts between day and night.',
  },
]

export function QuestBoard({
  onPick,
  disabled,
}: {
  onPick: (goal: string) => void
  disabled: boolean
}) {
  return (
    <div className="quests">
      <div className="quests__head">Quest board · pick a job, then run it</div>
      <div className="quests__grid">
        {QUESTS.map(quest => (
          <button
            key={quest.title}
            type="button"
            className="quest"
            disabled={disabled}
            onClick={() => onPick(quest.goal)}
          >
            <span className="quest__tag">{quest.tag}</span>
            <span className="quest__title">{quest.title}</span>
            <span className="quest__brief">{quest.brief}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
