/**
 * Picks the one-click Windows, Mac, and Linux installers from a GitHub release.
 * The download page calls this in the browser. Node tests import the same functions.
 */

export const REPO = 'AaronGrace978/Akashic-Records'

export const FALLBACK_TAG = 'v1.0.0'

const RULES = {
  windows: [/-win-setup\.exe$/i, /-win-x64-setup\.exe$/i],
  mac: [/-mac-universal\.dmg$/i, /\.dmg$/i],
  linux: [/-linux-amd64\.deb$/i, /-linux-x86_64\.AppImage$/i],
  'windows-x64': [/-win-x64-setup\.exe$/i],
  'windows-arm64': [/-win-arm64-setup\.exe$/i],
  'windows-portable': [/-win-portable\.exe$/i, /-win-x64-portable\.exe$/i],
  'mac-zip': [/-mac-universal\.zip$/i, /\.zip$/i],
  'linux-appimage': [/-linux-x86_64\.AppImage$/i],
  'linux-appimage-arm64': [/-linux-arm64\.AppImage$/i],
  'linux-arm64': [/-linux-arm64\.deb$/i],
}

export function downloadUrl(tag, name) {
  return `https://github.com/${REPO}/releases/download/${tag}/${name}`
}

export function formatBytes(bytes) {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n <= 0) return ''
  const mb = n / 1_000_000
  if (mb >= 10) return `${Math.round(mb)} MB`
  return `${mb.toFixed(1)} MB`
}

function findAsset(assets, patterns) {
  for (const pattern of patterns) {
    const hit = assets.find(asset => pattern.test(asset.name || ''))
    if (hit) return hit
  }
  return null
}

export function chooseInstallers(assets) {
  const list = Array.isArray(assets) ? assets : []
  const pick = key => findAsset(list, RULES[key] || [])
  return {
    windows: pick('windows'),
    mac: pick('mac'),
    linux: pick('linux'),
    alternates: {
      'windows-x64': pick('windows-x64'),
      'windows-arm64': pick('windows-arm64'),
      'windows-portable': pick('windows-portable'),
      'mac-zip': pick('mac-zip'),
      'linux-appimage': pick('linux-appimage'),
      'linux-appimage-arm64': pick('linux-appimage-arm64'),
      'linux-arm64': pick('linux-arm64'),
    },
  }
}

export function detectOs(ua = '', platform = '') {
  const agent = String(ua)
  const blob = `${platform || ''} ${agent}`
  if (/Android|iPhone|iPad|iPod/i.test(agent)) return 'mobile'
  if (/Win/i.test(blob)) return 'windows'
  if (/Mac/i.test(blob)) return 'mac'
  if (/Linux|X11|CrOS/i.test(blob)) return 'linux'
  return 'other'
}

export function osHint(os) {
  switch (os) {
    case 'windows':
      return 'This computer is Windows. The highlighted button downloads the installer.'
    case 'mac':
      return 'This computer is a Mac. The highlighted button downloads the disk image.'
    case 'linux':
      return 'This computer is Linux. The highlighted button is the Ubuntu and Debian installer. Other distributions can use the AppImage below.'
    case 'mobile':
      return 'Akashic Records installs on a desktop. Open this page on a Windows, Mac, or Linux computer.'
    default:
      return 'Choose the computer you want to install it on.'
  }
}

function setInstaller(key, asset, tag) {
  if (!asset?.name) return
  const href = downloadUrl(tag, asset.name)
  document.querySelectorAll(`[data-installer="${key}"]`).forEach(link => {
    link.href = href
  })
  const size = formatBytes(asset.size)
  document.querySelectorAll(`[data-size-for="${key}"]`).forEach(node => {
    node.textContent = size
  })
}

function currentOs() {
  const forced = new URLSearchParams(location.search).get('os')
  if (forced && ['windows', 'mac', 'linux', 'mobile', 'other'].includes(forced)) return forced
  const platform = navigator.userAgentData?.platform || navigator.platform || ''
  return detectOs(navigator.userAgent, platform)
}

function markComputer(os) {
  document.documentElement.dataset.os = os
  document.querySelectorAll('.choice').forEach(choice => {
    const yours = choice.dataset.os === os
    choice.classList.toggle('is-yours', yours)
    const badge = choice.querySelector('.choice__badge')
    if (badge) badge.hidden = !yours
  })
  const hint = document.querySelector('#os-hint')
  if (hint) hint.textContent = osHint(os)
}

function applyRelease(release) {
  const tag = release.tag_name || FALLBACK_TAG
  const chosen = chooseInstallers(release.assets || [])
  setInstaller('windows', chosen.windows, tag)
  setInstaller('mac', chosen.mac, tag)
  setInstaller('linux', chosen.linux, tag)
  for (const [key, asset] of Object.entries(chosen.alternates)) {
    setInstaller(key, asset, tag)
  }
  const version = tag.replace(/^v/, '')
  const label = document.querySelector('#release-label')
  if (label) label.textContent = `Version ${version}`
  const releaseHref = release.html_url || `https://github.com/${REPO}/releases/tag/${tag}`
  document.querySelectorAll('[data-release-link]').forEach(link => {
    link.href = releaseHref
  })
  const releaseLink = document.querySelector('#release-link')
  if (releaseLink) releaseLink.textContent = `All files in ${tag}`
  const footerRelease = document.querySelector('footer [data-release-link]')
  if (footerRelease) footerRelease.textContent = `GitHub release ${tag}`
}

async function loadLatest() {
  const response = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!response.ok) return
  applyRelease(await response.json())
}

if (typeof document !== 'undefined') {
  markComputer(currentOs())
  loadLatest().catch(() => {})
}
