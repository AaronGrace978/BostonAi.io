/** In-browser virtual filesystem — no real disk access. */

export class PathError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PathError'
  }
}

export function normalizeVfsPath(input: string): string {
  if (!input || typeof input !== 'string') throw new PathError('Path required')
  if (input.includes('\0')) throw new PathError('Null byte in path')
  let p = input.replace(/\\/g, '/').trim()
  if (/^[a-zA-Z]:/.test(p) || p.startsWith('//')) {
    throw new PathError('Absolute / drive paths are not allowed in the web VFS')
  }
  if (!p.startsWith('/')) p = '/' + p
  const parts: string[] = []
  for (const seg of p.split('/')) {
    if (!seg || seg === '.') continue
    if (seg === '..') {
      if (parts.length === 0) throw new PathError('Path traversal blocked')
      parts.pop()
      continue
    }
    if (!/^[a-zA-Z0-9._@+=-]+$/.test(seg)) {
      throw new PathError(`Illegal path segment: ${seg}`)
    }
    parts.push(seg)
  }
  return '/' + parts.join('/')
}

export type VfsNode =
  | { type: 'file'; content: string; updatedAt: number }
  | { type: 'dir'; updatedAt: number }

export class VirtualFS {
  private nodes = new Map<string, VfsNode>()

  constructor() {
    this.nodes.set('/', { type: 'dir', updatedAt: Date.now() })
  }

  reset(): void {
    this.nodes.clear()
    this.nodes.set('/', { type: 'dir', updatedAt: Date.now() })
  }

  exists(path: string): boolean {
    return this.nodes.has(normalizeVfsPath(path))
  }

  mkdir(path: string): void {
    const full = normalizeVfsPath(path)
    const parts = full.split('/').filter(Boolean)
    let cur = ''
    for (const seg of parts) {
      cur += '/' + seg
      const existing = this.nodes.get(cur)
      if (existing?.type === 'file') throw new PathError(`${cur} is a file`)
      if (!existing) this.nodes.set(cur, { type: 'dir', updatedAt: Date.now() })
    }
  }

  writeFile(path: string, content: string): void {
    const full = normalizeVfsPath(path)
    if (full === '/') throw new PathError('Cannot write root')
    const parent = full.slice(0, full.lastIndexOf('/')) || '/'
    if (!this.nodes.has(parent)) this.mkdir(parent)
    const parentNode = this.nodes.get(parent)
    if (parentNode?.type !== 'dir') throw new PathError('Parent is not a directory')
    const existing = this.nodes.get(full)
    if (existing?.type === 'dir') throw new PathError('Path is a directory')
    if (content.length > 1_500_000) throw new PathError('File too large (1.5MB max)')
    this.nodes.set(full, { type: 'file', content, updatedAt: Date.now() })
  }

  readFile(path: string): string {
    const full = normalizeVfsPath(path)
    const node = this.nodes.get(full)
    if (!node) throw new PathError(`Not found: ${full}`)
    if (node.type !== 'file') throw new PathError(`Not a file: ${full}`)
    return node.content
  }

  list(path = '/'): string[] {
    const full = normalizeVfsPath(path)
    const node = this.nodes.get(full)
    if (!node) throw new PathError(`Not found: ${full}`)
    if (node.type !== 'dir') throw new PathError(`Not a directory: ${full}`)
    const prefix = full === '/' ? '/' : full + '/'
    const names = new Set<string>()
    for (const key of this.nodes.keys()) {
      if (key === full) continue
      if (!key.startsWith(prefix)) continue
      const rest = key.slice(prefix.length)
      const name = rest.split('/')[0]
      if (name) names.add(name)
    }
    return [...names].sort()
  }

  tree(path = '/', depth = 6): string {
    const lines: string[] = []
    const walk = (p: string, indent: string, d: number) => {
      if (d < 0) return
      for (const name of this.list(p)) {
        const child = p === '/' ? `/${name}` : `${p}/${name}`
        const node = this.nodes.get(child)
        if (!node) continue
        if (node.type === 'dir') {
          lines.push(`${indent}${name}/`)
          walk(child, indent + '  ', d - 1)
        } else {
          lines.push(`${indent}${name} (${node.content.length} chars)`)
        }
      }
    }
    lines.push(path === '/' ? '/' : path)
    walk(path, '  ', depth)
    return lines.join('\n')
  }

  /** Snapshot of successful writes this session (for completion gates). */
  listFiles(): Array<{ path: string; chars: number }> {
    const out: Array<{ path: string; chars: number }> = []
    for (const [path, node] of this.nodes) {
      if (node.type === 'file') out.push({ path, chars: node.content.length })
    }
    return out.sort((a, b) => a.path.localeCompare(b.path))
  }
}
