import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  concreteTextures, travertineTextures, stoneTextures, oakTextures,
  grassTexture, sandTexture, waterNormal, foliageTexture,
} from '../lib/textures'

/*
  Casa Albedo — a real-time, procedurally modelled modernist villa.
  Units are metres; the front façade faces +Z. Built from architectural
  dimensions (travertine plinth, glass pavilion, cantilevered board-formed
  concrete volume, oak louvres, infinity pool, stone garden wall).

  Replacement path: to use a photogrammetry / archviz GLB instead, put the file at
  /public/models/villa.glb and set VITE_VILLA_MODEL=/models/villa.glb (see README).
*/

// ---------- geometry helpers ----------
function worldBox(w, h, d, tile = 3) {
  const g = new THREE.BoxGeometry(w, h, d)
  const uv = g.attributes.uv
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]
  for (let f = 0; f < 6; f++)
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v
      uv.setXY(i, (uv.getX(i) * dims[f][0]) / tile, (uv.getY(i) * dims[f][1]) / tile)
    }
  return g
}

// box from min/max extents
function Slab({ x = [0, 1], y = [0, 1], z = [0, 1], m, tile = 3, cast = true, receive = true, ...rest }) {
  const w = x[1] - x[0], h = y[1] - y[0], d = z[1] - z[0]
  const geo = useMemo(() => worldBox(w, h, d, tile), [w, h, d, tile])
  return (
    <mesh
      geometry={geo}
      material={m}
      position={[(x[0] + x[1]) / 2, (y[0] + y[1]) / 2, (z[0] + z[1]) / 2]}
      castShadow={cast}
      receiveShadow={receive}
      {...rest}
    />
  )
}

function rng(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

function blobGeometry(detail = 3, amt = 0.28, seed = 3) {
  const g = new THREE.IcosahedronGeometry(1, detail)
  const p = g.attributes.position
  const r = rng(seed)
  const offs = [r() * 10, r() * 10, r() * 10]
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n =
      Math.sin(v.x * 3.1 + offs[0]) * Math.sin(v.y * 2.7 + offs[1]) * Math.sin(v.z * 3.3 + offs[2]) * 0.6 +
      Math.sin(v.x * 7.3 + offs[1]) * Math.sin(v.z * 6.1) * 0.25
    v.multiplyScalar(1 + n * amt)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

// ---------- materials ----------
export function useVillaMaterials() {
  return useMemo(() => {
    const c = concreteTextures(), t = travertineTextures(), s = stoneTextures(), o = oakTextures()
    const grass = grassTexture(); grass.repeat.set(90, 90)
    const sand = sandTexture(); sand.repeat.set(1, 1)
    const wn = waterNormal(); wn.repeat.set(3, 1)
    return {
      concrete: new THREE.MeshStandardMaterial({ map: c.map, bumpMap: c.bump, bumpScale: 0.6, roughness: 0.88, color: '#d6d2cb' }),
      concreteSoffit: new THREE.MeshStandardMaterial({ map: c.map, roughness: 0.9, color: '#e4e1db' }),
      travertine: new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 0.35, roughness: 0.72, color: '#efe8dc' }),
      stone: new THREE.MeshStandardMaterial({ map: s.map, bumpMap: s.bump, bumpScale: 2.2, roughness: 0.95, color: '#d8d2c6' }),
      oak: new THREE.MeshStandardMaterial({ map: o.map, roughness: 0.62, color: '#c9b49a' }),
      oakFloor: new THREE.MeshStandardMaterial({ map: o.map, roughness: 0.45, color: '#c7b39b' }),
      plaster: new THREE.MeshStandardMaterial({ color: '#f1eee8', roughness: 0.95 }),
      linen: new THREE.MeshStandardMaterial({ color: '#d9d3c7', roughness: 1 }),
      darkLinen: new THREE.MeshStandardMaterial({ color: '#6d675e', roughness: 1 }),
      metal: new THREE.MeshStandardMaterial({ color: '#1d1e1f', roughness: 0.42, metalness: 0.75 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#dce6e6', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.2,
        envMapIntensity: 2.2, ior: 1.5, specularIntensity: 1, depthWrite: false,
      }),
      darkGlass: new THREE.MeshPhysicalMaterial({ color: '#2a3032', roughness: 0.06, metalness: 0.2, envMapIntensity: 1.6 }),
      water: new THREE.MeshPhysicalMaterial({
        color: '#6f9599', roughness: 0.06, metalness: 0.05, normalMap: wn, normalScale: new THREE.Vector2(0.35, 0.35),
        envMapIntensity: 1.4, transparent: true, opacity: 0.92,
      }),
      poolTile: new THREE.MeshStandardMaterial({ color: '#56676a', roughness: 0.55 }),
      grass: new THREE.MeshStandardMaterial({ map: grass, roughness: 1, color: '#e0cda6' }),
      sand: new THREE.MeshStandardMaterial({ map: sand, roughness: 1, color: '#efdfc6' }),
      foliage: new THREE.MeshStandardMaterial({ map: foliageTexture(), roughness: 0.95, color: '#b9c0a6' }),
      darkFoliage: new THREE.MeshStandardMaterial({ map: foliageTexture(), roughness: 0.95, color: '#a3ab92' }),
      bark: new THREE.MeshStandardMaterial({ color: '#5b4a3c', roughness: 1 }),
      warmLight: new THREE.MeshBasicMaterial({ color: '#fff1dc', toneMapped: false }),
      hill: new THREE.MeshStandardMaterial({ color: '#8f957f', roughness: 1, flatShading: false }),
    }
  }, [])
}

// ---------- parts ----------
function Plinth({ m }) {
  // travertine plinth with a hole for the pool: x[-17,17] z[-9,12] top y=0.5
  const top = [0, 0.5]
  return (
    <group>
      <Slab x={[-17, 17]} y={top} z={[-9, 6.5]} m={m.travertine} tile={4} />
      <Slab x={[-17, 17]} y={top} z={[10.5, 12]} m={m.travertine} tile={4} />
      <Slab x={[-17, -6]} y={top} z={[6.5, 10.5]} m={m.travertine} tile={4} />
      <Slab x={[10, 17]} y={top} z={[6.5, 10.5]} m={m.travertine} tile={4} />
      {/* pool basin */}
      <Slab x={[-6, 10]} y={[-1.2, -1.1]} z={[6.5, 10.5]} m={m.poolTile} cast={false} />
      <Slab x={[-6, -5.95]} y={[-1.2, 0.5]} z={[6.5, 10.5]} m={m.poolTile} cast={false} />
      <Slab x={[9.95, 10]} y={[-1.2, 0.5]} z={[6.5, 10.5]} m={m.poolTile} cast={false} />
      <Slab x={[-6, 10]} y={[-1.2, 0.5]} z={[6.5, 6.55]} m={m.poolTile} cast={false} />
      <Slab x={[-6, 10]} y={[-1.2, 0.5]} z={[10.45, 10.5]} m={m.poolTile} cast={false} />
      <Water m={m.water} />
      {/* entry steps (west) */}
      {[0, 1, 2].map((i) => (
        <Slab key={i} x={[-19.4 + i * 0.8, -17]} y={[0, 0.17 * (i + 1)]} z={[1, 5]} m={m.travertine} tile={4} />
      ))}
    </group>
  )
}

function Water({ m }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (m.normalMap) {
      m.normalMap.offset.x += dt * 0.012
      m.normalMap.offset.y += dt * 0.006
    }
  })
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} position={[2, 0.44, 8.5]} receiveShadow material={m}>
      <planeGeometry args={[16, 4]} />
    </mesh>
  )
}

function Pavilion({ m, quality }) {
  // ground floor glass pavilion: x[-11,9] z[-4,3] y[0.5,3.8]
  const mullions = []
  for (let x = -11; x <= 9.01; x += 2.5) mullions.push(x)
  const sideMullions = [-4, -1.5, 1, 3]
  return (
    <group>
      {/* interior floor & ceiling */}
      <Slab x={[-11, 9]} y={[0.5, 0.52]} z={[-4, 3]} m={m.oakFloor} tile={2.5} cast={false} />
      <Slab x={[-11, 9]} y={[3.62, 3.8]} z={[-4, 3]} m={m.plaster} cast={false} />
      {/* back wall (concrete) */}
      <Slab x={[-11, 9]} y={[0.5, 3.8]} z={[-4.4, -4]} m={m.concrete} tile={3.2} />
      {/* front glazing + mullions */}
      <mesh position={[-1, 2.15, 3]} material={m.glass} renderOrder={2}>
        <planeGeometry args={[20, 3.3]} />
      </mesh>
      {mullions.map((x) => (
        <Slab key={x} x={[x - 0.03, x + 0.03]} y={[0.5, 3.62]} z={[2.95, 3.06]} m={m.metal} />
      ))}
      <Slab x={[-11, 9]} y={[0.5, 0.56]} z={[2.95, 3.08]} m={m.metal} />
      {/* east glazing */}
      <mesh position={[9, 2.15, -0.5]} rotation-y={Math.PI / 2} material={m.glass} renderOrder={2}>
        <planeGeometry args={[7, 3.3]} />
      </mesh>
      {sideMullions.map((z) => (
        <Slab key={z} x={[8.95, 9.06]} y={[0.5, 3.62]} z={[z - 0.03, z + 0.03]} m={m.metal} />
      ))}
      <Interior m={m} quality={quality} />
    </group>
  )
}

function Interior({ m, quality }) {
  return (
    <group>
      {/* rug */}
      <Slab x={[-7.5, -2.5]} y={[0.52, 0.535]} z={[-2.4, 1.6]} m={m.linen} cast={false} />
      {/* L sofa */}
      <Slab x={[-7, -3.2]} y={[0.52, 0.95]} z={[-2.6, -1.6]} m={m.linen} />
      <Slab x={[-7, -3.2]} y={[0.95, 1.35]} z={[-2.6, -2.3]} m={m.linen} />
      <Slab x={[-7, -6]} y={[0.52, 0.95]} z={[-1.6, 0.4]} m={m.linen} />
      {/* travertine coffee table */}
      <Slab x={[-5.6, -4]} y={[0.52, 0.9]} z={[-1.1, 0.3]} m={m.travertine} tile={1} />
      {/* lounge chair */}
      <Slab x={[-3.3, -2.4]} y={[0.52, 0.9]} z={[0.2, 1.1]} m={m.darkLinen} />
      {/* dining */}
      <Slab x={[0, 3.6]} y={[1.24, 1.3]} z={[-1.4, -0.2]} m={m.oak} tile={1.2} />
      <Slab x={[0.5, 0.65]} y={[0.52, 1.24]} z={[-1.0, -0.6]} m={m.oak} />
      <Slab x={[2.95, 3.1]} y={[0.52, 1.24]} z={[-1.0, -0.6]} m={m.oak} />
      {[0.4, 1.4, 2.4].map((x) =>
        [-1.9, 0.3].map((z) => <Slab key={x + '-' + z} x={[x, x + 0.5]} y={[0.52, 1.02]} z={[z, z + 0.45]} m={m.darkLinen} />)
      )}
      {/* kitchen island */}
      <Slab x={[4.6, 8]} y={[0.52, 1.45]} z={[-3.1, -2.1]} m={m.travertine} tile={1.2} />
      {/* cove light strips */}
      <mesh position={[-1, 3.6, -3.7]} material={m.warmLight}>
        <boxGeometry args={[19.5, 0.03, 0.25]} />
      </mesh>
      {[-5, 1.8].map((x) => (
        <mesh key={x} position={[x, 2.95, -0.8]} material={m.warmLight}>
          <cylinderGeometry args={[0.32, 0.32, 0.05, 24]} />
        </mesh>
      ))}
      {quality === 'high' && <pointLight position={[-1, 2.9, -0.5]} color="#ffdcb0" intensity={14} distance={14} decay={2} />}
    </group>
  )
}

function UpperVolume({ m }) {
  // board-formed concrete box: x[-4,14] z[-3.5,2.5] y[4.15,7.3]
  const louvres = useRef()
  const count = 34
  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      o.position.set(1.4 + i * 0.34, 5.75, 2.62)
      o.updateMatrix()
      louvres.current.setMatrixAt(i, o.matrix)
    }
    louvres.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <group>
      {/* roof slab of the pavilion with 3m overhang */}
      <Slab x={[-12, 12]} y={[3.8, 4.15]} z={[-5, 6]} m={m.concrete} tile={3.2} />
      {/* volume: solid parts around a strip window on the front */}
      <Slab x={[-4, 14]} y={[4.15, 7.3]} z={[-3.5, 2.1]} m={m.concrete} tile={3.2} />
      <Slab x={[-4, 14]} y={[4.15, 4.85]} z={[2.1, 2.5]} m={m.concrete} tile={3.2} />
      <Slab x={[-4, 14]} y={[6.65, 7.3]} z={[2.1, 2.5]} m={m.concrete} tile={3.2} />
      <Slab x={[-4, -3]} y={[4.85, 6.65]} z={[2.1, 2.5]} m={m.concrete} tile={3.2} />
      <Slab x={[13, 14]} y={[4.85, 6.65]} z={[2.1, 2.5]} m={m.concrete} tile={3.2} />
      <mesh position={[5, 5.75, 2.2]} material={m.darkGlass}>
        <planeGeometry args={[16, 1.8]} />
      </mesh>
      {/* oak louvres */}
      <instancedMesh ref={louvres} args={[null, null, count]} castShadow material={m.oak}>
        <boxGeometry args={[0.07, 1.8, 0.22]} />
      </instancedMesh>
      {/* roof parapet */}
      <Slab x={[-4.1, 14.1]} y={[7.3, 7.5]} z={[-3.6, 2.6]} m={m.concrete} tile={3.2} />
      {/* cantilever soffit gets a slightly lighter material */}
      <Slab x={[9, 14]} y={[4.13, 4.16]} z={[-3.5, 2.5]} m={m.concreteSoffit} cast={false} />
      {/* slim steel columns under the overhang */}
      {[-8, 4].map((x) => (
        <mesh key={x} position={[x, 2.15, 5.6]} castShadow material={m.metal}>
          <cylinderGeometry args={[0.07, 0.07, 3.3, 12]} />
        </mesh>
      ))}
    </group>
  )
}

function StoneWalls({ m }) {
  return (
    <group>
      {/* west end wall of the pavilion, rising above the roof */}
      <Slab x={[-11.7, -11]} y={[0.5, 4.6]} z={[-6, 4.5]} m={m.stone} tile={2.6} />
      {/* garden wall reaching into the landscape */}
      <Slab x={[-34, -11.7]} y={[0, 2.4]} z={[-4.8, -4.2]} m={m.stone} tile={2.6} />
      <Slab x={[14, 30]} y={[0, 1.6]} z={[-7.6, -7]} m={m.stone} tile={2.6} />
    </group>
  )
}

function Loungers({ m }) {
  return (
    <group>
      {[-3, -0.8, 1.4].map((x) => (
        <group key={x} position={[x, 0.5, 11.15]}>
          <Slab x={[-0.35, 0.35]} y={[0.1, 0.32]} z={[-0.1, 1.9]} m={m.oak} tile={1} />
          <Slab x={[-0.32, 0.32]} y={[0.32, 0.4]} z={[0.5, 1.88]} m={m.linen} />
          <mesh position={[0, 0.55, 0.25]} rotation-x={-0.9} castShadow material={m.linen}>
            <boxGeometry args={[0.64, 0.08, 0.7]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ---------- landscape ----------
function Trees({ m, quality }) {
  const pines = useMemo(() => {
    const r = rng(11)
    const list = []
    const N = quality === 'high' ? 34 : 18
    while (list.length < N) {
      const x = (r() - 0.5) * 150
      const z = -8 - r() * 70
      if (Math.abs(x) < 26 && z > -16) continue
      list.push({ x, z, s: 0.8 + r() * 0.45, rot: r() * Math.PI })
    }
    // a few in front, framing the view
    list.push({ x: -30, z: 18, s: 1.05, rot: 1 }, { x: 34, z: 12, s: 0.95, rot: 2 }, { x: 46, z: -2, s: 1.1, rot: 0.4 })
    return list
  }, [quality])

  const canopyGeo = useMemo(() => blobGeometry(quality === 'high' ? 3 : 2, 0.22, 5), [quality])
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.14, 0.26, 1, 7), [])
  const hedgeGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1, 6, 3, 6)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
      const j = 1 + (Math.sin(x * 37 + z * 23 + y * 11) * 0.5) * 0.04
      p.setXYZ(i, x * j, y * (y > 0 ? j : 1), z * j)
    }
    g.computeVertexNormals()
    return g
  }, [])
  const canopy = useRef(), trunk = useRef(), cypress = useRef(), shrubs = useRef()

  const lumps = useMemo(() => {
    const out = []
    const r = rng(23)
    pines.forEach((p) => {
      const h = 9 * p.s
      const n = 9
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 * 1.618 + p.rot
        const rad = i === 0 ? 0 : (1.4 + r() * 2.2) * p.s
        out.push({
          pos: [p.x + Math.cos(a) * rad, h + (r() - 0.3) * 0.9 * p.s, p.z + Math.sin(a) * rad],
          scale: [(1.7 + r() * 0.9) * p.s, (0.55 + r() * 0.35) * p.s, (1.7 + r() * 0.9) * p.s],
        })
      }
    })
    return out
  }, [pines])

  const cypresses = useMemo(() => {
    const out = []
    for (let i = 0; i < 6; i++) out.push([-14 - i * 3.4, -6.4, 0.9 + (i % 3) * 0.12])
    for (let i = 0; i < 4; i++) out.push([18 + i * 3.6, -9, 0.95 + (i % 2) * 0.15])
    return out
  }, [])

  // clipped hedges framing the plinth (architectural landscaping, not blobs)
  const shrubList = useMemo(
    () => [
      { x: -22.5, z: 3, w: 0.9, d: 14, h: 1.1 },
      { x: 20.5, z: 3, w: 0.9, d: 16, h: 1.1 },
      { x: -26, z: -2, w: 6, d: 0.9, h: 1.4 },
      { x: 24, z: -10, w: 10, d: 1.1, h: 1.6 },
    ],
    []
  )

  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    lumps.forEach((l, i) => {
      o.position.set(...l.pos); o.scale.set(...l.scale); o.rotation.set(0, i, 0); o.updateMatrix()
      canopy.current.setMatrixAt(i, o.matrix)
    })
    canopy.current.instanceMatrix.needsUpdate = true
    pines.forEach((p, i) => {
      const h = 9 * p.s
      o.position.set(p.x, h / 2, p.z); o.scale.set(p.s, h, p.s); o.rotation.set(0.05 * Math.sin(i), 0, 0.06 * Math.cos(i)); o.updateMatrix()
      trunk.current.setMatrixAt(i, o.matrix)
    })
    trunk.current.instanceMatrix.needsUpdate = true
    cypresses.forEach(([x, z, s], i) => {
      o.position.set(x, 4.2 * s, z); o.scale.set(0.95 * s, 4.6 * s, 0.95 * s); o.rotation.set(0, i, 0); o.updateMatrix()
      cypress.current.setMatrixAt(i, o.matrix)
    })
    cypress.current.instanceMatrix.needsUpdate = true
    shrubList.forEach((sh, i) => {
      o.position.set(sh.x, sh.h / 2, sh.z); o.scale.set(sh.w, sh.h, sh.d); o.rotation.set(0, 0, 0); o.updateMatrix()
      shrubs.current.setMatrixAt(i, o.matrix)
    })
    shrubs.current.instanceMatrix.needsUpdate = true
  }, [lumps, pines, cypresses, shrubList])

  return (
    <group>
      <instancedMesh ref={canopy} args={[canopyGeo, m.darkFoliage, lumps.length]} castShadow receiveShadow />
      <instancedMesh ref={trunk} args={[trunkGeo, m.bark, pines.length]} castShadow />
      <instancedMesh ref={cypress} args={[canopyGeo, m.darkFoliage, cypresses.length]} castShadow />
      <instancedMesh ref={shrubs} args={[hedgeGeo, m.foliage, shrubList.length]} castShadow receiveShadow />
    </group>
  )
}

function Ground({ m }) {
  const hills = useMemo(() => {
    const g = new THREE.PlaneGeometry(1400, 1400, 120, 120)
    g.rotateX(-Math.PI / 2)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i)
      const d = Math.hypot(x, z + 60)
      const f = THREE.MathUtils.smoothstep(d, 170, 420)
      const h = (Math.sin(x * 0.011) * Math.cos(z * 0.013) * 0.5 + 0.5) * 38 + Math.sin(x * 0.031 + z * 0.02) * 9
      p.setY(i, -0.05 + f * h)
    }
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <group>
      <mesh geometry={hills} material={m.grass} receiveShadow />
      {/* sandy forecourt around the plinth */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 2]} receiveShadow material={m.sand}>
        <planeGeometry args={[48, 30]} />
      </mesh>
    </group>
  )
}

export default function Villa({ quality = 'high', ...props }) {
  const m = useVillaMaterials()
  return (
    <group {...props}>
      <Plinth m={m} />
      <Pavilion m={m} quality={quality} />
      <UpperVolume m={m} />
      <StoneWalls m={m} />
      <Loungers m={m} />
      <Trees m={m} quality={quality} />
      <Ground m={m} />
    </group>
  )
}
