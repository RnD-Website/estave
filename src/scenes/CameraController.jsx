import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { shared, setState, getState } from '../state/store'
import { sampleStops } from '../animations/scrollAnimations'
import { isTouch, prefersReducedMotion } from '../lib/env'

/*
  Drives the camera from scroll (shared.progress / shared.featured).
  Each stop is converted to position + yaw/pitch, and the ANGLES are blended
  (not the look-at points). Blending look-at points makes the view whip around
  when the camera turns from one wall to the opposite one; blending yaw turns it
  smoothly through "looking down the hall". Damped position + angles, plus a
  subtle mouse look-around like the reference.
*/

// yaw 0 = looking down -Z, +PI/2 = looking +X
function pose(stop) {
  const [px, py, pz] = stop.p
  const [tx, ty, tz] = stop.t
  const dx = tx - px, dy = ty - py, dz = tz - pz
  const flat = Math.hypot(dx, dz)
  return { p: stop.p, yaw: Math.atan2(dx, -dz), pitch: Math.atan2(dy, flat) }
}

const lerp = THREE.MathUtils.lerp

export default function CameraController({
  stops,
  hero, // optional intro pose blended by shared.intro
  source = 'progress',
  yaw = 0.1,
  pitch = 0.035,
  damping = 3.4,
  fov = 45,
  portraitFov = 62,
  reportStops = false,
}) {
  const { camera, size } = useThree()
  const poses = useRef(null)
  const heroPose = useRef(null)
  const cur = useRef(null) // damped { x,y,z,yaw,pitch }
  const look = useRef({ x: 0, y: 0 })
  const reduce = prefersReducedMotion()
  const touch = isTouch()

  if (!poses.current || poses.current.src !== stops) {
    poses.current = stops.map(pose)
    poses.current.src = stops
    heroPose.current = hero ? pose(hero) : null
  }

  useFrame((_, dt) => {
    dt = Math.min(dt, 1 / 20)
    const aspect = size.width / size.height
    const targetFov = aspect < 1 ? portraitFov : aspect < 1.3 ? (fov + portraitFov) / 2 : fov
    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = targetFov
      camera.updateProjectionMatrix()
    }

    const P = poses.current
    const { e, s, i } = sampleStops(stops, shared[source])
    const a = P[i], b = P[i + 1]
    let x = lerp(a.p[0], b.p[0], e)
    let y = lerp(a.p[1], b.p[1], e)
    let z = lerp(a.p[2], b.p[2], e)
    let yw = lerp(a.yaw, b.yaw, e)
    let pt = lerp(a.pitch, b.pitch, e)

    const intro = hero && shared.intro < 1
    if (intro) {
      const h = heroPose.current, s0 = P[0], k = shared.intro
      x = lerp(h.p[0], s0.p[0], k)
      y = lerp(h.p[1] + (1 - shared.heroIn) * 0.15, s0.p[1], k)
      z = lerp(h.p[2] + (1 - shared.heroIn) * 1.8, s0.p[2], k)
      yw = lerp(h.yaw, s0.yaw, k)
      pt = lerp(h.pitch, s0.pitch, k)
    }

    if (!cur.current) cur.current = { x, y, z, yaw: yw, pitch: pt }
    const c = cur.current
    // intro is already eased by GSAP → follow it tightly; scroll gets a soft, critically-damped glide
    const k = reduce ? 1 : 1 - Math.exp(-dt * (intro ? 14 : damping))
    c.x += (x - c.x) * k
    c.y += (y - c.y) * k
    c.z += (z - c.z) * k
    c.yaw += (yw - c.yaw) * k
    c.pitch += (pt - c.pitch) * k

    const allowLook = !reduce && !touch && (!hero || getState().entered)
    const mk = 1 - Math.exp(-dt * 2)
    look.current.x += ((allowLook ? shared.mouse.x * yaw : 0) - look.current.x) * mk
    look.current.y += ((allowLook ? shared.mouse.y * pitch : 0) - look.current.y) * mk

    camera.position.set(c.x, c.y, c.z)
    camera.rotation.order = 'YXZ'
    camera.rotation.set(c.pitch + look.current.y, -(c.yaw + look.current.x), 0)

    if (reportStops) {
      const near = Math.round(s)
      const active = getState().entered && shared.intro > 0.98 && Math.abs(s - near) < 0.22 ? near : -1
      if (getState().activeStop !== active) setState({ activeStop: active })
    }
  })
  return null
}
