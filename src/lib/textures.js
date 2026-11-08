import * as THREE from 'three'

// Procedural material textures generated once on a canvas (no network, tiny bundle).
// Replace any of these with scanned PBR sets (e.g. ambientCG / Poly Haven, CC0) by
// loading them with useTexture and passing them to the same material slots.

const cache = new Map()

// ---------- value noise ----------
function makeNoise(seed = 1) {
  const p = new Uint8Array(512)
  let s = seed * 9301 + 49297
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  const perm = [...Array(256).keys()].sort(() => rnd() - 0.5)
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255]
  const grad = new Float32Array(256).map(() => rnd())
  const fade = (t) => t * t * (3 - 2 * t)
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y)
    const xf = x - xi, yf = y - yi
    const a = grad[p[(p[xi & 255] + yi) & 255]]
    const b = grad[p[(p[(xi + 1) & 255] + yi) & 255]]
    const c = grad[p[(p[xi & 255] + yi + 1) & 255]]
    const d = grad[p[(p[(xi + 1) & 255] + yi + 1) & 255]]
    const u = fade(xf), v = fade(yf)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
  }
}
function fbm(n, x, y, oct = 4) {
  let v = 0, a = 0.5, f = 1, t = 0
  for (let i = 0; i < oct; i++) { v += a * n(x * f, y * f); t += a; a *= 0.5; f *= 2 }
  return v / t
}
// tileable fbm over a period
function tfbm(n, x, y, period, oct = 4, periodY = period) {
  // blend four samples to make it seamless
  const px = x / period, py = y / periodY
  const a = fbm(n, x, y, oct), b = fbm(n, x - period, y, oct)
  const c = fbm(n, x, y - periodY, oct), d = fbm(n, x - period, y - periodY, oct)
  return a * (1 - px) * (1 - py) + b * px * (1 - py) + c * (1 - px) * py + d * px * py
}

function canvas(size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  return [c, c.getContext('2d')]
}

function toTexture(c, { srgb = true, repeat = [1, 1] } = {}) {
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  t.anisotropy = 8
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.needsUpdate = true
  return t
}

// fill pixels with a function returning [r,g,b]
function paint(ctx, size, fn) {
  const img = ctx.createImageData(size, size)
  const d = img.data
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const [r, g, b] = fn(x, y)
      const i = (y * size + x) * 4
      d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255
    }
  ctx.putImageData(img, 0, 0)
}

function memo(key, fn) {
  if (!cache.has(key)) cache.set(key, fn())
  return cache.get(key)
}

// ---------- board-formed concrete ----------
export const concreteTextures = () =>
  memo('concrete', () => {
    const S = 512
    const n = makeNoise(7), n2 = makeNoise(13)
    const [c, ctx] = canvas(S)
    const [b, bctx] = canvas(S)
    const boards = 8
    const boardShade = Array.from({ length: boards }, (_, i) => (Math.sin(i * 12.9898) * 43758.5453) % 1)
    paint(ctx, S, (x, y) => {
      const board = Math.floor((y / S) * boards)
      const inBoard = ((y / S) * boards) % 1
      const grain = tfbm(n2, x / 6, y / 60, S / 6, 3, S / 60) // stretched wood grain imprint
      const cloud = tfbm(n, x / 64, y / 64, S / 64, 5)
      const speck = Math.random() * 0.06
      let v = 0.66 + (cloud - 0.5) * 0.22 + (grain - 0.5) * 0.06 + Math.abs(boardShade[board]) * 0.05 - speck
      if (inBoard < 0.012 || inBoard > 0.988) v -= 0.12
      const g = v * 255
      return [g * 1.0, g * 0.985, g * 0.955]
    })
    // tie holes
    ctx.fillStyle = 'rgba(40,38,35,0.55)'
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 4; col++) {
        ctx.beginPath()
        ctx.arc(S * (col + 0.5) / 4, S * (row + 0.5) / 4, 3.2, 0, Math.PI * 2)
        ctx.fill()
      }
    bctx.filter = 'grayscale(1) contrast(1.4)'
    bctx.drawImage(c, 0, 0)
    return { map: toTexture(c), bump: toTexture(b, { srgb: false }) }
  })

// ---------- travertine ----------
export const travertineTextures = () =>
  memo('travertine', () => {
    const S = 512
    const n = makeNoise(21), n2 = makeNoise(3)
    const [c, ctx] = canvas(S)
    const [b, bctx] = canvas(S)
    paint(ctx, S, (x, y) => {
      const band = tfbm(n, x / 128, y / 9, S / 128, 4, S / 9)
      const cloud = tfbm(n2, x / 40, y / 40, S / 40, 4)
      let v = 0.8 + (band - 0.5) * 0.16 + (cloud - 0.5) * 0.08
      if (band > 0.66 && Math.random() < 0.18) v -= 0.18 // pores along veins
      // slab joints
      const sx = x % 256, sy = y % 128
      if (sx < 1.5 || sy < 1.5) v -= 0.07
      const g = v * 255
      return [g * 1.0, g * 0.955, g * 0.87]
    })
    bctx.filter = 'grayscale(1) contrast(1.6)'
    bctx.drawImage(c, 0, 0)
    return { map: toTexture(c), bump: toTexture(b, { srgb: false }) }
  })

// ---------- coursed limestone garden wall ----------
export const stoneTextures = () =>
  memo('stone', () => {
    const S = 512
    const n = makeNoise(5)
    const [c, ctx] = canvas(S)
    ctx.fillStyle = '#5f5a52'
    ctx.fillRect(0, 0, S, S)
    let y = 0
    let seed = 1
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    while (y < S) {
      const h = 22 + r() * 34
      let x = -r() * 60
      while (x < S) {
        const w = 40 + r() * 90
        const t = 0.55 + r() * 0.3
        const base = [176 * t + 30, 168 * t + 28, 152 * t + 24]
        ctx.fillStyle = `rgb(${base.map((v) => v | 0).join(',')})`
        const rr = 3
        ctx.beginPath()
        ctx.roundRect(x + 2, y + 2, w - 4, Math.min(h, S - y) - 4, rr)
        ctx.fill()
        // also wrap horizontally for tiling
        if (x + w > S) { ctx.beginPath(); ctx.roundRect(x - S + 2, y + 2, w - 4, h - 4, rr); ctx.fill() }
        x += w
      }
      y += h
    }
    // surface noise
    const img = ctx.getImageData(0, 0, S, S)
    for (let yy = 0; yy < S; yy++)
      for (let xx = 0; xx < S; xx++) {
        const i = (yy * S + xx) * 4
        const k = (tfbm(n, xx / 18, yy / 18, S / 18, 4) - 0.5) * 50 + (Math.random() - 0.5) * 14
        img.data[i] += k; img.data[i + 1] += k; img.data[i + 2] += k
      }
    ctx.putImageData(img, 0, 0)
    const [b, bctx] = canvas(S)
    bctx.filter = 'grayscale(1) contrast(1.8)'
    bctx.drawImage(c, 0, 0)
    return { map: toTexture(c), bump: toTexture(b, { srgb: false }) }
  })

// ---------- oak ----------
export const oakTextures = () =>
  memo('oak', () => {
    const S = 512
    const n = makeNoise(17)
    const [c, ctx] = canvas(S)
    paint(ctx, S, (x, y) => {
      const plank = Math.floor(x / 64)
      const off = (plank * 37) % 11
      const g = tfbm(n, x / 3 + off * 10, y / 90, S / 3, 4, S / 90)
      const ring = Math.sin((x + g * 40) * 0.35 + plank) * 0.5 + 0.5
      let v = 0.62 + (g - 0.5) * 0.3 + ring * 0.06 + ((plank * 0.13) % 0.08)
      if (x % 64 < 1.2) v -= 0.25
      return [v * 178, v * 140, v * 102]
    })
    return { map: toTexture(c) }
  })

// ---------- meadow / dry grass ----------
export const grassTexture = () =>
  memo('grass', () => {
    const S = 512
    const n = makeNoise(31), n2 = makeNoise(41)
    const [c, ctx] = canvas(S)
    paint(ctx, S, (x, y) => {
      const p = tfbm(n, x / 70, y / 70, S / 70, 5)
      const f = tfbm(n2, x / 6, y / 6, S / 6, 2)
      const v = 0.55 + (p - 0.5) * 0.5 + (f - 0.5) * 0.25 + (Math.random() - 0.5) * 0.12
      // muted, slightly dry Mediterranean green
      return [v * 128, v * 134, v * 98]
    })
    return toTexture(c)
  })

export const sandTexture = () =>
  memo('sand', () => {
    const S = 256
    const n = makeNoise(51)
    const [c, ctx] = canvas(S)
    paint(ctx, S, (x, y) => {
      const v = 0.82 + (tfbm(n, x / 20, y / 20, S / 20, 4) - 0.5) * 0.12 + (Math.random() - 0.5) * 0.1
      return [v * 222, v * 210, v * 188]
    })
    return toTexture(c)
  })

// ---------- gallery floor tiles ----------
export const tileTexture = () =>
  memo('tile', () => {
    const S = 512
    const n = makeNoise(61)
    const [c, ctx] = canvas(S)
    const tiles = 2
    paint(ctx, S, (x, y) => {
      const tx = Math.floor((x / S) * tiles), ty = Math.floor((y / S) * tiles)
      const shade = ((tx * 7 + ty * 13) % 5) * 0.006
      const fx = ((x / S) * tiles) % 1, fy = ((y / S) * tiles) % 1
      const cloud = tfbm(n, x / 50, y / 50, S / 50, 4)
      let v = 0.925 + shade + (cloud - 0.5) * 0.025
      if (fx < 0.006 || fy < 0.006 || fx > 0.994 || fy > 0.994) v -= 0.07
      return [v * 247, v * 244, v * 238]
    })
    return toTexture(c)
  })

// ---------- gallery wall (subtle vertical panel seams) ----------
export const wallTexture = () =>
  memo('wall', () => {
    const S = 256
    const [c, ctx] = canvas(S)
    const g = ctx.createLinearGradient(0, 0, S, 0)
    g.addColorStop(0, 'rgb(236,234,230)')
    g.addColorStop(0.03, 'rgb(250,249,247)')
    g.addColorStop(0.97, 'rgb(250,249,247)')
    g.addColorStop(1, 'rgb(238,236,232)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, S, S)
    return toTexture(c)
  })

// ---------- soft shadow / glow sprites ----------
export const radialTexture = (inner = 'rgba(0,0,0,0.32)', key = 'shadow') =>
  memo('radial-' + key, () => {
    const S = 128
    const [c, ctx] = canvas(S)
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
    g.addColorStop(0, inner)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, S, S)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })

// ---------- water normal map ----------
export const waterNormal = () =>
  memo('water', () => {
    const S = 256
    const n = makeNoise(77)
    const h = new Float32Array(S * S)
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) h[y * S + x] = tfbm(n, x / 22, y / 22, S / 22, 4)
    const [c, ctx] = canvas(S)
    paint(ctx, S, (x, y) => {
      const l = h[y * S + ((x - 1 + S) % S)], r = h[y * S + ((x + 1) % S)]
      const u = h[((y - 1 + S) % S) * S + x], d = h[((y + 1) % S) * S + x]
      const nx = (l - r) * 4, ny = (u - d) * 4
      const len = Math.hypot(nx, ny, 1)
      return [((nx / len) * 0.5 + 0.5) * 255, ((ny / len) * 0.5 + 0.5) * 255, (1 / len) * 0.5 * 255 + 127]
    })
    return toTexture(c, { srgb: false })
  })

export const foliageTexture = () =>
  memo('foliage', () => {
    const S = 256
    const n = makeNoise(91)
    const [c, ctx] = canvas(S)
    paint(ctx, S, (x, y) => {
      const v = 0.45 + (tfbm(n, x / 8, y / 8, S / 8, 4) - 0.5) * 0.9 + (Math.random() - 0.5) * 0.2
      return [v * 92, v * 104, v * 74]
    })
    return toTexture(c)
  })
