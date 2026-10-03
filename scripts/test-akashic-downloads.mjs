import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  chooseInstallers,
  detectOs,
  downloadUrl,
  formatBytes,
  osHint,
} from '../public/akashic/releases.js'

const assets = [
  { name: 'Akashic-Records-1.0.0-linux-amd64.deb', size: 94635572 },
  { name: 'Akashic-Records-1.0.0-linux-arm64.AppImage', size: 120023061 },
  { name: 'Akashic-Records-1.0.0-linux-arm64.deb', size: 89309796 },
  { name: 'Akashic-Records-1.0.0-linux-x86_64.AppImage', size: 119770401 },
  { name: 'Akashic-Records-1.0.0-mac-universal.dmg', size: 211217244 },
  { name: 'Akashic-Records-1.0.0-mac-universal.zip', size: 205617159 },
  { name: 'Akashic-Records-1.0.0-win-arm64-setup.exe', size: 89008485 },
  { name: 'Akashic-Records-1.0.0-win-portable.exe', size: 182237986 },
  { name: 'Akashic-Records-1.0.0-win-setup.exe', size: 182635898 },
  { name: 'Akashic-Records-1.0.0-win-x64-setup.exe', size: 94554580 },
]

test('picks one installer for each desktop', () => {
  const chosen = chooseInstallers(assets)
  assert.equal(chosen.windows.name, 'Akashic-Records-1.0.0-win-setup.exe')
  assert.equal(chosen.mac.name, 'Akashic-Records-1.0.0-mac-universal.dmg')
  assert.equal(chosen.linux.name, 'Akashic-Records-1.0.0-linux-amd64.deb')
  assert.equal(chosen.alternates['windows-x64'].name, 'Akashic-Records-1.0.0-win-x64-setup.exe')
  assert.equal(chosen.alternates['linux-appimage'].name, 'Akashic-Records-1.0.0-linux-x86_64.AppImage')
  assert.equal(
    downloadUrl('v1.0.0', chosen.windows.name),
    'https://github.com/AaronGrace978/Akashic-Records/releases/download/v1.0.0/Akashic-Records-1.0.0-win-setup.exe',
  )
})

test('falls back when the combined Windows setup is absent', () => {
  const chosen = chooseInstallers(assets.filter(asset => !asset.name.endsWith('-win-setup.exe')))
  assert.equal(chosen.windows.name, 'Akashic-Records-1.0.0-win-x64-setup.exe')
})

test('formats release sizes the way the buttons show them', () => {
  assert.equal(formatBytes(182635898), '183 MB')
  assert.equal(formatBytes(94635572), '95 MB')
  assert.equal(formatBytes(0), '')
})

test('detects the computer the page is open on', () => {
  assert.equal(detectOs('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Win32'), 'windows')
  assert.equal(detectOs('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel'), 'mac')
  assert.equal(detectOs('Mozilla/5.0 (X11; Linux x86_64)', 'Linux x86_64'), 'linux')
  assert.equal(detectOs('Mozilla/5.0 (Linux; Android 14)', 'Linux armv8l'), 'mobile')
  assert.equal(detectOs('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 'iPhone'), 'mobile')
  assert.match(osHint('windows'), /Windows/)
  assert.match(osHint('linux'), /AppImage/)
})

test('the download page links at the published v1.0.0 files', () => {
  const page = readFileSync(new URL('../public/akashic/index.html', import.meta.url), 'utf8')
  const lab = readFileSync(new URL('../src/data/portfolio.ts', import.meta.url), 'utf8')
  for (const name of [
    'Akashic-Records-1.0.0-win-setup.exe',
    'Akashic-Records-1.0.0-mac-universal.dmg',
    'Akashic-Records-1.0.0-linux-amd64.deb',
  ]) {
    assert.ok(page.includes(name), name)
    assert.ok(lab.includes(name), name)
  }
})
