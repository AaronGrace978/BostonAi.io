// Ported from AaronGrace978/The-Entity (src/entity/AsciiEntity.tsx), without the face scan.
// A sphere is shrink-wrapped onto the head SDF, displaced with Perlin noise driven by the live
// stream signal, rendered into a tiny target and converted to a glyph ramp.
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { surfaceAlong } from './face'
import { hash1, perlin3 } from './noise'
import { signal } from './signal'

const RAMP = ' .:-=+*S%#@'
const GLITCH = '#$%&@!?/\\|<>{}[]01'
const FONT_PX = 10

export default function AsciiEntity() {
  const host = useRef<HTMLDivElement>(null)
  const pre = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const el = host.current!
    const out = pre.current!
    const small = window.matchMedia('(max-width: 760px)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false })
    } catch {
      out.textContent = '\n\n   [ WebGL unavailable: the entity is speaking without a face ]'
      return
    }
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20)
    camera.position.set(0, -0.25, 6.4)

    const geo = new THREE.SphereGeometry(1, small ? 56 : 84, small ? 40 : 64)
    const pos = geo.attributes.position as THREE.BufferAttribute
    const base = new Float32Array(pos.count * 3)
    const center: [number, number, number] = [0, -0.1, 0.15]
    for (let i = 0; i < pos.count; i++) {
      const d = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize()
      const t = surfaceAlong(center, [d.x, d.y, d.z], 2.6)
      const vx = center[0] + d.x * t
      const vy = center[1] + d.y * t
      const vz = center[2] + d.z * t
      pos.setXYZ(i, vx, vy, vz)
      base[i * 3] = vx
      base[i * 3 + 1] = vy
      base[i * 3 + 2] = vz
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    const normals = new Float32Array(geo.attributes.normal.array as Float32Array)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true })
    const head = new THREE.Mesh(geo, mat)
    scene.add(head)
    const key = new THREE.DirectionalLight(0xffffff, 2.3)
    key.position.set(1.8, 1.4, 2.2)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.55)
    fill.position.set(-2, -0.3, 1.5)
    scene.add(fill)
    const rim = new THREE.DirectionalLight(0xffffff, 1.0)
    rim.position.set(-2.5, 0.5, -1.5)
    scene.add(rim)
    scene.add(new THREE.AmbientLight(0xffffff, 0.08))

    let cols = 80
    let rows = 40
    let target = new THREE.WebGLRenderTarget(cols, rows)
    let pixels = new Uint8Array(cols * rows * 4)

    const measure = document.createElement('canvas').getContext('2d')!
    const resize = () => {
      const font = getComputedStyle(out).fontFamily
      measure.font = `${FONT_PX}px ${font}`
      const charW = measure.measureText('M').width || FONT_PX * 0.6
      cols = Math.max(20, Math.floor(el.clientWidth / charW))
      rows = Math.max(10, Math.floor(el.clientHeight / FONT_PX))
      const cap = small ? 90 : 160
      if (cols > cap) {
        const scale = cap / cols
        cols = cap
        rows = Math.max(10, Math.round(rows * scale))
      }
      const fontPx = el.clientHeight / rows
      out.style.fontSize = `${fontPx}px`
      out.style.lineHeight = `${fontPx}px`
      target.dispose()
      target = new THREE.WebGLRenderTarget(cols, rows)
      pixels = new Uint8Array(cols * rows * 4)
      camera.aspect = el.clientWidth / Math.max(1, el.clientHeight)
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    const arr = pos.array as Float32Array
    let time = 0
    let twitch = 0
    let twitchBand = 0
    let twitchShift = 0
    let last = performance.now()
    let raf = 0

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      time += reduced ? dt * 0.25 : dt
      const o = signal.tick(dt)
      const unc = 1 - o.confidence
      const tpsN = Math.min(2.5, o.tokensPerSecond / 60)
      const calm = 1 - o.success * 0.85

      const freq = 1.6 + o.activity * 3.5 + tpsN * 1.5 + o.error * 5 + unc * 3
      const amp = (0.012 + o.activity * 0.05 + o.error * 0.16 + unc * 0.12) * calm
      const speed = 0.4 + o.activity * 1.6 + tpsN * 1.2 + o.error * 3
      const melt = o.error * 0.35

      if (twitch > 0) twitch -= dt
      else if (Math.random() < dt * (o.activity * 2.5 + o.error * 9 + unc * 3)) {
        twitch = 0.06 + Math.random() * 0.12
        twitchBand = -1.2 + Math.random() * 2.2
        twitchShift = (Math.random() - 0.5) * (0.15 + o.error * 0.5)
      }

      for (let i = 0; i < arr.length; i += 3) {
        const bx = base[i]
        const by = base[i + 1]
        const bz = base[i + 2]
        const n = perlin3(bx * freq, by * freq + time * speed * 0.3, bz * freq + time * speed)
        const d = n * amp
        let x = bx + normals[i] * d
        let y = by + normals[i + 1] * d
        const z = bz + normals[i + 2] * d
        if (o.speak > 0.01 && bz > 0.3 && Math.abs(bx) < 0.24 && by > -0.55 && by < -0.32) {
          y -= o.speak * 0.065 * (1 - Math.abs(bx) / 0.24)
        }
        if (melt > 0) {
          const drip = Math.max(0, perlin3(bx * 3, 0, bz * 3 + time * 0.5) + 0.2)
          y -= melt * drip * (1.2 - by) * 0.35
          x += Math.sin(by * 9 + time * 14) * melt * 0.12
        }
        if (twitch > 0 && Math.abs(by - twitchBand) < 0.16) x += twitchShift
        arr[i] = x
        arr[i + 1] = y
        arr[i + 2] = z
      }
      pos.needsUpdate = true
      geo.computeVertexNormals()

      head.rotation.y += (signal.look.x * 0.4 + Math.sin(time * 0.3) * 0.25 - head.rotation.y) * Math.min(1, dt * 3)
      head.rotation.x += (-signal.look.y * 0.25 + Math.sin(time * 0.21) * 0.05 - head.rotation.x) * Math.min(1, dt * 3)

      renderer.setRenderTarget(target)
      renderer.render(scene, camera)
      renderer.readRenderTargetPixels(target, 0, 0, cols, rows, pixels)
      renderer.setRenderTarget(null)

      const glitchP = o.error * 0.25 + unc * 0.08
      const maxIdx = RAMP.length - 1
      const tear = o.error * 6 + unc * 1.5
      const lines: string[] = new Array(rows)
      for (let r = 0; r < rows; r++) {
        const srcRow = rows - 1 - r
        const shift = Math.random() < o.error * 0.3 ? Math.round((Math.random() - 0.5) * tear * 2) : 0
        let line = ''
        for (let c = 0; c < cols; c++) {
          const sc = Math.min(cols - 1, Math.max(0, c + shift))
          const k = (srcRow * cols + sc) * 4
          const lum = (0.3 * pixels[k] + 0.59 * pixels[k + 1] + 0.11 * pixels[k + 2]) / 255
          let ch = RAMP[Math.min(maxIdx, Math.round(Math.pow(lum, 1.1) * maxIdx))]
          if (ch !== ' ' && glitchP > 0 && Math.random() < glitchP) {
            ch = GLITCH[Math.floor(hash1(r * 131 + c + time) * GLITCH.length)]
          }
          line += ch
        }
        lines[r] = line
      }
      out.textContent = lines.join('\n')

      const hue = 150 - Math.min(1, o.error * 1.6) * 150 + o.success * 45
      out.style.color = `hsl(${hue} 100% ${62 + o.success * 18}%)`
      out.style.textShadow = `0 0 ${4 + o.activity * 6 + o.error * 8}px hsl(${hue} 100% 50% / 0.75)`
    }

    const onMove = (e: PointerEvent) => {
      signal.look.x = (e.clientX / window.innerWidth) * 2 - 1
      signal.look.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      ro.disconnect()
      target.dispose()
      geo.dispose()
      mat.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={host} className="ent-canvas" aria-hidden>
      <pre ref={pre} className="ent-ascii" style={{ fontSize: FONT_PX, lineHeight: `${FONT_PX}px` }} />
    </div>
  )
}
