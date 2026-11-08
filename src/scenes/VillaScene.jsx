import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import { EffectComposer, N8AO, Vignette, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import Villa from './Villa'
import CameraController from './CameraController'
import { NeutralEnvironment, SkyDome, Sun, Daylight } from './Atmosphere'

// Camera viewpoints for the four architecture chapters (villa-local metres)
export const FEATURED_STOPS = [
  { p: [2.5, 2.3, 35], t: [1.5, 3.4, 0] },
  { p: [-9, 1.75, 15.5], t: [-2.5, 2.3, 0] },
  { p: [25, 5.2, 14.5], t: [8.5, 5.3, 0] },
  { p: [-27, 27, 36], t: [0, 0.5, -3] },
]

const HOTSPOTS = [
  { c: 0, pos: [-14.5, 0.55, 11.6], label: 'Travertine plinth', sub: '34 × 21 m, honed' },
  { c: 0, pos: [7, 0.48, 9.2], label: 'Infinity pool', sub: '16 × 4 m' },
  { c: 1, pos: [-5.5, 2.8, 3.06], label: 'Low-iron glazing', sub: '3.3 m, slim black frames' },
  { c: 1, pos: [-11.4, 3.9, 3.6], label: 'Limestone end wall', sub: 'Hand-laid, local quarry' },
  { c: 2, pos: [13.95, 6.3, 0], label: 'Board-formed concrete', sub: 'Pine boards, 180 mm' },
  { c: 2, pos: [9.5, 6.75, 2.75], label: 'Oak louvres', sub: 'Pivoting, solid oak' },
  { c: 3, pos: [-25, 2.5, -4.5], label: 'Garden wall', sub: 'Runs 22 m into the pines' },
  { c: 3, pos: [14, 7.6, -0.5], label: 'Roof terrace', sub: '110 m², sea view' },
]

function Hotspots({ chapter }) {
  return HOTSPOTS.map((h, i) => (
    <Html key={i} position={h.pos} className={`hotspot${h.c === chapter ? ' is-on' : ''}`} zIndexRange={[10, 0]}>
      <span className="hotspot__dot" />
      <span className="hotspot__text">
        <b>{h.label}</b>
        <i>{h.sub}</i>
      </span>
    </Html>
  ))
}

function Fog() {
  const { scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.Fog('#efd9bd', 80, 560)
    return () => (scene.fog = null)
  }, [scene])
  return null
}

// Optional external model (see README → "Replacing the villa model")
const MODEL_URL = import.meta.env.VITE_VILLA_MODEL
function ExternalVilla() {
  const { scene } = useGLTF(MODEL_URL)
  useEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
  }, [scene])
  return <primitive object={scene} />
}

export default function VillaScene({ chapter, quality = 'high', active = true }) {
  const high = quality === 'high'
  return (
    <Canvas
      shadows="soft"
      dpr={high ? [1, 1.75] : [1, 1.4]}
      frameloop={'always'}
      camera={{ fov: 35, near: 0.3, far: 1500, position: FEATURED_STOPS[0].p }}
      gl={{ antialias: !high, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      aria-label="Interactive 3D model of Casa Albedo"
      role="img"
    >
      <Fog />
      <NeutralEnvironment intensity={0.75} />
      <Daylight hemi={0.9} sky="#f6e3c8" ground="#9c8468" />
      <Sun target={[0, 0, 0]} dir={[0.85, 0.5, 0.55]} color="#ffd2a0" extent={52} far={320} mapSize={high ? 4096 : 2048} intensity={2.9} />
      <SkyDome top="#c9b19a" horizon="#f8d6aa" bottom="#ead6bb" />
      <Suspense fallback={null}>{MODEL_URL ? <ExternalVilla /> : <Villa quality={high ? 'high' : 'low'} />}</Suspense>
      <Hotspots chapter={chapter} />
      <CameraController stops={FEATURED_STOPS} source="featured" yaw={0.07} pitch={0.03} damping={3} fov={35} portraitFov={55} />
      {high && (
        <EffectComposer multisampling={4}>
          <N8AO aoRadius={1.6} intensity={2.2} distanceFalloff={0.6} quality="medium" />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.32} darkness={0.32} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
