import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// Neutral daylight: soft sun, pale sky, gentle haze. Shared by the gallery and featured scenes.

export function NeutralEnvironment({ intensity = 0.7 }) {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = intensity
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene, intensity])
  return null
}

export function SkyDome({ top = '#b9c6cf', horizon = '#eef0ee', bottom = '#e8e6df', radius = 900 }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        toneMapped: false,
        uniforms: {
          top: { value: new THREE.Color(top) },
          horizon: { value: new THREE.Color(horizon) },
          bottom: { value: new THREE.Color(bottom) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; varying vec3 vDir;
          void main(){
            float h = vDir.y;
            vec3 c = mix(horizon, top, smoothstep(0.0, 0.55, h));
            c = mix(c, bottom, smoothstep(0.0, -0.08, h));
            gl_FragColor = vec4(c, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [top, horizon, bottom]
  )
  return (
    <mesh material={mat} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[radius, 32, 16]} />
    </mesh>
  )
}

export function Sun({ target = [0, 0, 0], dir = [0.55, 1, 0.62], extent = 60, mapSize = 2048, intensity = 2.4, far = 300, color = '#fff5e8' }) {
  const light = useRef()
  const tgt = useMemo(() => new THREE.Object3D(), [])
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(140)
  useEffect(() => {
    tgt.position.set(...target)
    tgt.updateMatrixWorld()
    light.current.target = tgt
  }, [tgt, target])
  return (
    <>
      <primitive object={tgt} />
      <directionalLight
        ref={light}
        position={[target[0] + d.x, target[1] + d.y, target[2] + d.z]}
        intensity={intensity}
        color={color}
        castShadow
        shadow-mapSize={[mapSize, mapSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-radius={4}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
        shadow-camera-near={1}
        shadow-camera-far={far}
      />
    </>
  )
}

export function Daylight({ hemi = 0.9, sky = '#e6ecf1', ground = '#b2aa9b' }) {
  return <hemisphereLight args={[sky, ground, hemi]} />
}
