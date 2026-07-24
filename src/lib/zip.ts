/** Export the virtual workspace as a real .zip so a refresh never loses a build. */

import { strToU8, zipSync } from 'fflate'
import type { VirtualFS } from './vfs'

export function downloadWorkspaceZip(vfs: VirtualFS): number {
  const files = vfs.listFiles()
  if (files.length === 0) return 0

  const entries: Record<string, Uint8Array> = {}
  for (const file of files) {
    entries[file.path.replace(/^\//, '')] = strToU8(vfs.readFile(file.path))
  }

  const bytes = zipSync(entries, { level: 6 })
  const blob = new Blob([bytes.slice().buffer], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  anchor.href = url
  anchor.download = `bostonai-workspace-${stamp}.zip`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 5_000)
  return files.length
}
