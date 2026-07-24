import { buildSystemPrompt } from './creed'
import { detectLeakedToolCall, parseDecision } from './decisions'
import {
  buildPlaybookNudge,
  emptyEvidence,
  falseCompleteNudge,
  leakedToolNudge,
  wantsFreshBuild,
  type RunEvidence,
} from './playbook'
import { callModel, type ChatMessage } from './provider'
import { executeTool } from './tools'
import type { FileDiff } from '../lib/diff'
import { redactSecrets, type VaultState } from '../lib/secrets'
import { VirtualFS } from '../lib/vfs'

export type StreamKind = 'status' | 'thought' | 'tool' | 'result' | 'message' | 'error' | 'preview'

export interface StreamEvent {
  kind: StreamKind
  text: string
  previewHtml?: string
  previewPath?: string
  diff?: FileDiff
}

export interface RunOptions {
  goal: string
  vault: VaultState
  vfs: VirtualFS
  maxSteps?: number
  signal?: AbortSignal
  onEvent: (event: StreamEvent) => void
}

export interface RunOutcome {
  ok: boolean
  message: string
  evidence: RunEvidence
}

const MAX_LEAK_NUDGES = 3
const MAX_GATE_NUDGES = 8

export async function runGoal(options: RunOptions): Promise<RunOutcome> {
  const maxSteps = options.maxSteps ?? 24
  const evidence = emptyEvidence()
  const fresh = wantsFreshBuild(options.goal)
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: buildSystemPrompt({
        goal: options.goal,
        allowNetworkFetch: options.vault.allowNetworkFetch,
        freshBuild: fresh,
      }),
    },
    { role: 'user', content: options.goal },
  ]

  if (fresh) {
    messages.push({
      role: 'user',
      content:
        'FRESH BUILD: Create a new project folder and new files. Do not claim prior work satisfies this goal.',
    })
  }

  let leakNudges = 0
  let gateNudges = 0

  options.onEvent({ kind: 'status', text: 'Starting BostonAI run…' })

  for (let step = 0; step < maxSteps; step++) {
    if (options.signal?.aborted) {
      return { ok: false, message: 'Cancelled', evidence }
    }

    options.onEvent({ kind: 'status', text: `Step ${step + 1}/${maxSteps}` })

    let raw: string
    try {
      raw = await callModel(options.vault, messages)
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Model call failed'
      const msg = /failed to fetch|networkerror|load failed/i.test(raw)
        ? 'Could not reach the model from the browser. Cloud relay may be down — try Prefer local proxy, or refresh and retry.'
        : redactSecrets(raw)
      options.onEvent({ kind: 'error', text: msg })
      return { ok: false, message: msg, evidence }
    }

    const decision = parseDecision(raw)
    messages.push({ role: 'assistant', content: raw })

    if (decision.type === 'message') {
      if (detectLeakedToolCall(decision.message) && leakNudges < MAX_LEAK_NUDGES) {
        leakNudges += 1
        const nudge = leakedToolNudge()
        options.onEvent({ kind: 'thought', text: 'Gate: leaked tool JSON — re-prompting' })
        messages.push({ role: 'user', content: nudge })
        continue
      }

      const falseDone = falseCompleteNudge(options.goal, evidence, decision.message)
      if (falseDone && gateNudges < MAX_GATE_NUDGES) {
        gateNudges += 1
        options.onEvent({ kind: 'thought', text: 'Gate: honest-builds rejection' })
        messages.push({ role: 'user', content: falseDone })
        continue
      }

      const playbook = buildPlaybookNudge(options.goal, evidence, options.vfs)
      if (playbook && gateNudges < MAX_GATE_NUDGES) {
        gateNudges += 1
        options.onEvent({ kind: 'thought', text: 'Gate: playbook incomplete' })
        messages.push({ role: 'user', content: playbook })
        continue
      }

      const finalMsg = redactSecrets(decision.message)
      options.onEvent({ kind: 'message', text: finalMsg })
      return { ok: true, message: finalMsg, evidence }
    }

    // tool
    options.onEvent({
      kind: 'tool',
      text: `${decision.tool}: ${decision.reason}`,
    })

    const result = await executeTool({
      tool: decision.tool,
      args: decision.args ?? {},
      vfs: options.vfs,
      evidence,
      allowNetworkFetch: options.vault.allowNetworkFetch,
    })

    options.onEvent({
      kind: 'result',
      text: result.summary.slice(0, 4000),
      previewHtml: result.previewHtml,
      previewPath: result.previewPath,
      diff: result.diff,
    })

    if (result.previewHtml) {
      options.onEvent({
        kind: 'preview',
        text: result.previewPath ?? 'preview',
        previewHtml: result.previewHtml,
        previewPath: result.previewPath,
      })
    }

    messages.push({
      role: 'user',
      content: `TOOL RESULT (${decision.tool}) ok=${result.ok}\n${result.summary.slice(0, 12_000)}`,
    })
  }

  const fail = 'Hit max steps without a gated completion.'
  options.onEvent({ kind: 'error', text: fail })
  return { ok: false, message: fail, evidence }
}
