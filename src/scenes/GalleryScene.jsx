import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, ContactShadows, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import interSemi from '@fontsource/inter/files/inter-latin-600-normal.woff?url'
import heroImage from '../assets/hero-interior.jpg'
import { shared, setState } from '../state/store'
import { HALL, SLOTS, PARTITIONS, STOPS, HERO_POSE } from '../animations/scrollAnimations'
import { PROPERTIES, BRAND, img } from '../data/content'
import { tileTexture, wallTexture } from '../lib/textures'
import CameraController from './CameraController'
import Artwork from './Artwork'
import Villa from './Villa'
import ErrorBoundary from '../components/ErrorBoundary'
import { NeutralEnvironment, SkyDome, Sun, Daylight } from './Atmosphere'

const W2 = HALL.w / 2
const D = HALL.depth
const H = HALL.h

function useMats() {
  return useMemo(() => {
    const tile = tileTexture().clone()
    tile.repeat.set(HALL.w / 2.4, (D + 14) / 2.4)
    tile.needsUpdate = true
    const wallT = wallTexture().clone()
    wallT.repeat.set(D / 1.2, 1)
    wallT.needsUpdate = true
    const backT = wallTexture().clone()
    backT.repeat.set(HALL.w / 1.2, 1)
    backT.needsUpdate = true
    return {
      floor: new THREE.MeshStandardMaterial({ map: tile, roughness: 0.34, metalness: 0, envMapIntensity: 0.9, color: '#e4d6c2' }),
      wall: new THREE.MeshStandardMaterial({ map: wallT, roughness: 0.92, color: '#fbf4ea', emissive: '#fff1de', emissiveIntensity: 0.12 }),
      back: new THREE.MeshStandardMaterial({ map: backT, roughness: 0.92, color: '#fbf4ea', emissive: '#fff1de', emissiveIntensity: 0.14 }),
      plain: new THREE.MeshStandardMaterial({ color: '#f8efe3', roughness: 0.9, emissive: '#fff1de', emissiveIntensity: 0.1 }),
      door: new THREE.MeshStandardMaterial({ color: '#fbf4ea', roughness: 0.85, emissive: '#fff1de', emissiveIntensity: 0.28 }),
      ceiling: new THREE.MeshStandardMaterial({ color: '#f2e8db', roughness: 1, emissive: '#ffefd9', emissiveIntensity: 0.2 }),
      strip: new THREE.MeshBasicMaterial({ color: '#fff3df', toneMapped: false }),
      skirting: new THREE.MeshStandardMaterial({ color: '#e2d6c5', roughness: 0.8 }),
      black: new THREE.MeshStandardMaterial({ color: '#1c1712', roughness: 0.4, metalness: 0.5 }),
      opening: new THREE.MeshBasicMaterial({ color: '#2e241b' }),
      red: new THREE.MeshBasicMaterial({ color: '#a9773f', toneMapped: false }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#eef3f3', transparent: true, opacity: 0.08, roughness: 0.02, envMapIntensity: 1.5, depthWrite: false,
      }),
    }
  }, [])
}

/* ---------------- architecture of the hall ---------------- */
function Hall({ m }) {
  const strips = []
  for (let x = -6; x <= 6.01; x += 1.5) strips.push(x)
  return (
    <group>
      {/* floor runs out through the doors to form the hero floor band */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, (14 - D) / 2]} receiveShadow material={m.floor}>
        <planeGeometry args={[HALL.w, D + 14]} />
      </mesh>
      {/* side walls */}
      <mesh position={[-W2, H / 2, -D / 2]} rotation-y={Math.PI / 2} receiveShadow material={m.wall}>
        <planeGeometry args={[D, H]} />
      </mesh>
      <mesh position={[W2, H / 2, -D / 2]} rotation-y={-Math.PI / 2} receiveShadow material={m.wall}>
        <planeGeometry args={[D, H]} />
      </mesh>
      {/* skirting */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W2 - 0.01), 0.05, -D / 2]}>
          <boxGeometry args={[0.02, 0.1, D]} />
          <primitive object={m.skirting} attach="material" />
        </mesh>
      ))}
      {/* ceiling with light strips */}
      <mesh position={[0, H, -D / 2]} rotation-x={Math.PI / 2} material={m.ceiling}>
        <planeGeometry args={[HALL.w, D]} />
      </mesh>
      {strips.map((x) => (
        <mesh key={x} position={[x, H - 0.02, -D / 2]} material={m.strip}>
          <boxGeometry args={[0.16, 0.02, D - 0.4]} />
        </mesh>
      ))}
      {/* exterior façade either side of the entrance (seen on ultra-wide screens) */}
      {[-1, 1].map((s) => (
        <mesh key={'f' + s} position={[s * (W2 + 20), 6, 0]} material={m.plain}>
          <planeGeometry args={[40, 12]} />
        </mesh>
      ))}
      <mesh position={[0, H + 3.2, 0]} material={m.plain}>
        <planeGeometry args={[HALL.w, 6.4]} />
      </mesh>
      {PARTITIONS.map((p) => (
        <mesh key={p.z} position={[p.x, 1.95, p.z]} castShadow receiveShadow material={m.plain}>
          <boxGeometry args={[0.6, 3.9, p.len]} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- back wall: panoramic window + two doors ---------------- */
const WIN = { x0: -3.6, x1: 3.6, y0: 0.55, y1: 4.0 }

function BackWall({ m, onNavigate }) {
  const z = -D
  const pieces = [
    // [x0,x1,y0,y1]
    [-W2, WIN.x0, 0, H],
    [WIN.x1, W2, 0, H],
    [WIN.x0, WIN.x1, 0, WIN.y0],
    [WIN.x0, WIN.x1, WIN.y1, H],
  ]
  return (
    <group>
      {pieces.map(([x0, x1, y0, y1], i) => (
        <mesh key={i} position={[(x0 + x1) / 2, (y0 + y1) / 2, z - 0.15]} receiveShadow material={m.back}>
          <boxGeometry args={[x1 - x0, y1 - y0, 0.3]} />
        </mesh>
      ))}
      {/* window frame + glass */}
      <mesh position={[0, (WIN.y0 + WIN.y1) / 2, z - 0.1]} material={m.glass}>
        <planeGeometry args={[WIN.x1 - WIN.x0, WIN.y1 - WIN.y0]} />
      </mesh>
      {[
        [0, WIN.y0, WIN.x1 - WIN.x0 + 0.08, 0.05],
        [0, WIN.y1, WIN.x1 - WIN.x0 + 0.08, 0.05],
      ].map(([x, y, w, hh], i) => (
        <mesh key={'h' + i} position={[x, y, z - 0.02]} material={m.black}>
          <boxGeometry args={[w, hh, 0.06]} />
        </mesh>
      ))}
      {[WIN.x0, 0, WIN.x1].map((x) => (
        <mesh key={'v' + x} position={[x, (WIN.y0 + WIN.y1) / 2, z - 0.02]} material={m.black}>
          <boxGeometry args={[0.05, WIN.y1 - WIN.y0, 0.06]} />
        </mesh>
      ))}
      <WallDoor m={m} x={-5.3} label="Featured" onClick={() => onNavigate('#featured')} />
      <WallDoor m={m} x={5.3} label="About" onClick={() => onNavigate('#about')} />
    </group>
  )
}

function WallDoor({ m, x, label, onClick }) {
  const [hover, setHover] = useState(false)
  const l = useRef(), r = useRef(), root = useRef(), labelRef = useRef()
  const dw = 1.5, dh = 2.6
  useFrame((_, dt) => {
    // hidden until the walk reaches the end wall, then rises out of the floor
    const t = THREE.MathUtils.smoothstep(shared.progress, 0.8, 0.95)
    root.current.visible = t > 0.001
    root.current.position.y = -(dh + 1.2) * (1 - t)
    if (labelRef.current) labelRef.current.fillOpacity = t
    const a = hover ? 0.55 : 0.16
    const k = 1 - Math.exp(-dt * 6)
    l.current.rotation.y += (a - l.current.rotation.y) * k
    r.current.rotation.y += (-a - r.current.rotation.y) * k
  })
  return (
    <group
      ref={root}
      visible={false}
      position={[x, -4, -D + 0.002]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHover(false)
        document.body.style.cursor = ''
      }}
    >
      <mesh position={[0, dh / 2, 0]} material={m.opening}>
        <planeGeometry args={[dw, dh]} />
      </mesh>
      {/* frame */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (dw / 2 + 0.03), dh / 2, 0.03]} material={m.door}>
          <boxGeometry args={[0.06, dh + 0.06, 0.06]} />
        </mesh>
      ))}
      <mesh position={[0, dh + 0.03, 0.03]} material={m.door}>
        <boxGeometry args={[dw + 0.12, 0.06, 0.06]} />
      </mesh>
      {/* leaves hinged on the outer edges, ajar */}
      <group ref={l} position={[-dw / 2, 0, 0.02]}>
        <mesh position={[dw / 4, dh / 2, 0]} castShadow material={m.door}>
          <boxGeometry args={[dw / 2 - 0.01, dh - 0.02, 0.05]} />
        </mesh>
        <mesh position={[dw / 2 - 0.12, dh * 0.47, 0.05]} material={m.black}>
          <boxGeometry args={[0.025, 0.42, 0.025]} />
        </mesh>
      </group>
      <group ref={r} position={[dw / 2, 0, 0.02]}>
        <mesh position={[-dw / 4, dh / 2, 0]} castShadow material={m.door}>
          <boxGeometry args={[dw / 2 - 0.01, dh - 0.02, 0.05]} />
        </mesh>
        <mesh position={[-dw / 2 + 0.12, dh * 0.47, 0.05]} material={m.black}>
          <boxGeometry args={[0.025, 0.42, 0.025]} />
        </mesh>
      </group>
      <Text ref={labelRef} font={interSemi} fontSize={0.3} letterSpacing={-0.05} color="#080808" anchorX="center" anchorY="bottom" position={[0, dh + 0.42, 0.01]}>
        {label}
      </Text>
      <mesh position={[0, dh + 0.35, 0.01]} material={m.red}>
        <planeGeometry args={[label.length * 0.16, 0.025]} />
      </mesh>
    </group>
  )
}

/* ---------------- hero photograph printed across both doors ---------------- */
// One photo spans the closed doors (cover-fit to 14 × 5.6 m); each leaf carries its half,
// so the image splits down the seam as the doors swing open.
function DoorImage({ side }) {
  const base = useTexture(heroImage)
  const mat = useMemo(() => {
    const t = base.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    const ia = base.image.width / base.image.height
    const area = HALL.w / H
    const ry = ia / area // fraction of the image height that fits
    t.repeat.set(0.5, ry)
    t.offset.set(side === 'left' ? 0 : 0.5, Math.max(0, (1 - ry) * 0.5))
    t.needsUpdate = true
    return new THREE.ShaderMaterial({
      toneMapped: false,
      uniforms: { map: { value: t } },
      vertexShader: `varying vec2 vUv; varying vec2 vPos; void main(){ vUv = uv; vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform sampler2D map; varying vec2 vUv; varying vec2 vPos;
        void main(){
          vec3 c = texture2D(map, vUv).rgb;
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    })
  }, [base, side])
  // the map's own repeat/offset are applied through uvTransform on standard materials only,
  // so bake them into the geometry UVs here
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(W2, H)
    const uv = g.attributes.uv
    const t = mat.uniforms.map.value
    for (let i = 0; i < uv.count; i++) uv.setXY(i, t.offset.x + uv.getX(i) * t.repeat.x, t.offset.y + uv.getY(i) * t.repeat.y)
    return g
  }, [mat])
  return <mesh geometry={geo} material={mat} position={[side === 'left' ? W2 / 2 : -W2 / 2, H / 2, 0.001]} />
}

/* ---------------- entrance doors carrying the headline ---------------- */
function EntranceDoors({ m }) {
  const left = useRef(), right = useRef(), seam = useRef()
  const { size } = useThree()
  const aspect = size.width / size.height
  // visible width at the door plane (camera at z = 7.2)
  const fov = aspect < 1 ? 62 : aspect < 1.3 ? 53.5 : 45
  const visH = 2 * HERO_POSE.p[2] * Math.tan(THREE.MathUtils.degToRad(fov / 2))
  const visW = visH * aspect
  const fontSize = Math.min(visH * 0.078, visW * 0.098)
  const maxWidth = Math.min(visW * 0.86, fontSize * 13.6)
  const textY = HERO_POSE.p[1] + visH * (aspect < 1 ? 0.2 : 0.13)

  useFrame(() => {
    const a = shared.door * 1.5
    left.current.rotation.y = a
    right.current.rotation.y = -a
    const vis = shared.door < 0.999
    left.current.visible = right.current.visible = vis
    seam.current.visible = shared.door < 0.015
  })

  const headline = BRAND.tagline.toUpperCase()
  const textProps = {
    font: interSemi,
    fontSize,
    maxWidth,
    lineHeight: 0.92,
    letterSpacing: -0.045,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    color: '#1c1712',
  }
  const panel = [W2, H, 0.14]
  return (
    <group>
      <group ref={left} position={[-W2, 0, 0]}>
        <mesh position={[W2 / 2 - 0.004, H / 2, -0.07]} material={m.door} castShadow>
          <boxGeometry args={panel} />
        </mesh>
        <Suspense fallback={null}>
          <DoorImage side="left" />
        </Suspense>
      </group>
      <group ref={right} position={[W2, 0, 0]}>
        <mesh position={[-W2 / 2 + 0.004, H / 2, -0.07]} material={m.door} castShadow>
          <boxGeometry args={panel} />
        </mesh>
        <Suspense fallback={null}>
          <DoorImage side="right" />
        </Suspense>
      </group>
      {/* the vertical seam */}
      <mesh ref={seam} position={[0, H / 2, 0.003]}>
        <planeGeometry args={[0.012, H]} />
        <meshBasicMaterial color="#c9c7c2" />
      </mesh>
    </group>
  )
}

/* Projects the floor line under the doors to a CSS variable so the HTML hero UI sits on it. */
function FloorLine() {
  const { camera, size } = useThree()
  const v = useMemo(() => new THREE.Vector3(), [])
  const last = useRef(0)
  useFrame(() => {
    if (shared.intro > 0.01) return
    v.set(0, 0, 0).project(camera)
    const y = Math.round((1 - (v.y * 0.5 + 0.5)) * size.height)
    if (y !== last.current) {
      last.current = y
      document.documentElement.style.setProperty('--floor-y', `${y}px`)
    }
  })
  return null
}

/* ---------------- works ---------------- */
// Loads each photo independently; a blocked or missing photo leaves a blank plate, never a broken scene.
function Works() {
  const [textures, setTextures] = useState(() => PROPERTIES.map(() => null))
  useEffect(() => {
    const loader = new THREE.TextureLoader(new THREE.LoadingManager())
    loader.setCrossOrigin('anonymous')
    let alive = true
    PROPERTIES.forEach((p, i) => {
      loader.load(
        img(p.image, p.ratio < 1 ? 1000 : 1500, null),
        (t) => alive && setTextures((arr) => arr.map((x, j) => (j === i ? t : x))),
        undefined,
        () => alive && setTextures((arr) => arr.map((x, j) => (j === i ? 'none' : x)))
      )
    })
    return () => (alive = false)
  }, [])
  return PROPERTIES.map((p, i) => (
    <Artwork key={p.slug} slot={SLOTS[i]} property={p} texture={textures[i]} stopIndex={i + 1} index={i} />
  ))
}

export default function GalleryScene({ quality = 'high', onNavigate }) {
  const m = useMats()
  const { scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.Fog('#efdcc2', 70, 520)
    scene.background = new THREE.Color('#f4ece1')
    return () => {
      scene.fog = null
    }
  }, [scene])
  return (
    <>
      <NeutralEnvironment intensity={0.62} />
      <Daylight hemi={1.0} sky="#f6e6cf" ground="#a8917a" />
      <ambientLight intensity={0.25} />
      <Sun target={[0, 0, -55]} dir={[0.8, 0.62, 0.45]} color="#ffd8a8" extent={72} far={340} mapSize={quality === 'high' ? 2048 : 1024} intensity={2.4} />
      <SkyDome top="#cdb8a1" horizon="#f7d9b2" bottom="#ecdcc6" />
      <Hall m={m} />
      <BackWall m={m} onNavigate={onNavigate} />
      <EntranceDoors m={m} />
      <FloorLine />
      <ErrorBoundary>
        <Suspense fallback={null}>
          <Works />
        </Suspense>
      </ErrorBoundary>
      <ContactShadows position={[0, 0.004, -D / 2]} scale={[HALL.w, D]} resolution={1024} far={4} blur={2.4} opacity={0.42} frames={1} />
      <Villa position={[0, 0, -84]} quality="low" />
      <CameraController stops={STOPS} hero={HERO_POSE} damping={3.2} reportStops />
    </>
  )
}
