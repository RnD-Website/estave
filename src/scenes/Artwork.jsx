import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import interSemi from '@fontsource/inter/files/inter-latin-600-normal.woff?url'
import interMedium from '@fontsource/inter/files/inter-latin-500-normal.woff?url'
import * as THREE from 'three'
import { GRADE } from '../lib/grade'
import { radialTexture } from '../lib/textures'
import { useStore, setState } from '../state/store'
import { HALL, CARD } from '../animations/scrollAnimations'

// Shared colour grade applied to every photograph rendered in WebGL.
export function makeGradedMaterial(map) {
  return new THREE.ShaderMaterial({
    toneMapped: false,
    uniforms: {
      map: { value: map },
      sat: { value: GRADE.saturation },
      sep: { value: GRADE.sepia },
      con: { value: GRADE.contrast },
      bri: { value: GRADE.brightness },
      warm: { value: GRADE.warmth },
      hover: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D map; uniform float sep; uniform float sat; uniform float con; uniform float bri; uniform float warm; uniform float hover;
      varying vec2 vUv;
      void main(){
        vec2 uv = (vUv - 0.5) * (1.0 - hover * 0.03) + 0.5;
        vec3 c = texture2D(map, uv).rgb;
        // CSS sepia() matrix, applied in sRGB-ish space to match the HTML photos
        vec3 g = pow(c, vec3(1.0 / 2.2));
        vec3 s = vec3(dot(g, vec3(0.393, 0.769, 0.189)), dot(g, vec3(0.349, 0.686, 0.168)), dot(g, vec3(0.272, 0.534, 0.131)));
        g = mix(g, s, sep);
        float l = dot(g, vec3(0.2126, 0.7152, 0.0722));
        g = mix(vec3(l), g, sat);
        g = (g - 0.5) * con + 0.5;
        c = pow(max(g, 0.0), vec3(2.2));
        c *= bri;
        c.r += warm; c.b -= warm;
        gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
        #include <colorspace_fragment>
      }`,
  })
}

// crop a texture to a target aspect (object-fit: cover)
function coverTexture(tex, aspect) {
  const img = tex.image
  if (!img) return
  const ia = img.width / img.height
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  if (ia > aspect) {
    tex.repeat.set(aspect / ia, 1)
    tex.offset.set((1 - aspect / ia) / 2, 0)
  } else {
    tex.repeat.set(1, ia / aspect)
    tex.offset.set(0, (1 - ia / aspect) / 2)
  }
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
}

const frameMat = new THREE.MeshStandardMaterial({ color: '#b48a57', roughness: 0.32, metalness: 0.75 })
const wireMat = new THREE.MeshBasicMaterial({ color: '#7a7a7a' })
const NICHE_MARGIN = 0.28 // metres of card around the frame, same on every side and for every work
const CAPTION_BLOCK = 0.215 // caption gap + name + details
const glowMat = new THREE.MeshBasicMaterial({ color: '#fff1dc', toneMapped: false })

export default function Artwork({ slot, property, texture, stopIndex, index }) {
  const [hovered, setHovered] = useState(false)
  const group = useRef()
  const mat = useMemo(() => {
    if (!texture || texture === 'none') {
      const m = makeGradedMaterial(null)
      m.fragmentShader = m.fragmentShader.replace('vec3 c = texture2D(map, uv).rgb;', 'vec3 c = mix(vec3(0.62,0.52,0.42), vec3(0.80,0.72,0.62), uv.y);')
      return m
    }
    const t = texture.clone()
    coverTexture(t, CARD.ratio)
    return makeGradedMaterial(t)
  }, [texture])

  const w = slot.width
  const h = w / CARD.ratio // identical shape for every card
  const f = 0.022 // slim brass frame
  // card = frame + equal margin on all sides; the bottom also holds the caption block,
  // so the space BELOW the caption equals the top and side margins
  const cw = w + f * 2 + NICHE_MARGIN * 2
  const ch = h + f * 2 + NICHE_MARGIN * 2 + CAPTION_BLOCK
  const cy = -CAPTION_BLOCK / 2 // card centre sits lower than the picture centre
  const cardTop = h / 2 + f + NICHE_MARGIN
  const shadowTex = radialTexture('rgba(0,0,0,0.30)', 'art')

  useFrame((_, dt) => {
    const target = hovered ? 1 : 0
    const u = mat.uniforms.hover
    u.value += (target - u.value) * (1 - Math.exp(-dt * 8))
    if (group.current) group.current.position.z = u.value * 0.04
  })

  const open = (e) => {
    e.stopPropagation()
    setState({ sheet: property.slug })
  }

  return (
    <group position={slot.pos} rotation-y={slot.rotY}>
      <group
        ref={group}
        onClick={open}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = ''
        }}
      >
        <mesh position={[0, 0, 0.02]} castShadow material={frameMat}>
          <boxGeometry args={[w + f * 2, h + f * 2, 0.03]} />
        </mesh>
        <mesh position={[0, 0, 0.0405]} material={mat}>
          <planeGeometry args={[w, h]} />
        </mesh>
      </group>

      {/* every work sits on the same cream card: identical margin on all four sides */}
      {slot.hanging ? (
        <mesh position={[0, cy, -0.01]} material={glowMat} castShadow>
          <boxGeometry args={[cw, ch, 0.02]} />
        </mesh>
      ) : (
        <mesh position={[0, cy, 0.001]} material={glowMat}>
          <planeGeometry args={[cw, ch]} />
        </mesh>
      )}

      {slot.hanging &&
        [-1, 1].map((sx) => (
          <mesh key={sx} position={[sx * (cw / 2 - 0.15), (HALL.h - slot.pos[1] + cardTop) / 2, -0.01]}>
            <cylinderGeometry args={[0.004, 0.004, HALL.h - slot.pos[1] - cardTop, 4]} />
            <primitive object={wireMat} attach="material" />
          </mesh>
        ))}

      {/* soft floor shadow (reference: blurred radial under each work) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -slot.pos[1] + 0.006, slot.hanging ? 0.1 : 0.55]} renderOrder={1}>
        <planeGeometry args={[cw * 1.1, slot.hanging ? 0.9 : 1.1]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={slot.hanging ? 0.75 : 0.5} />
      </mesh>

      {/* name + details printed on the card, always visible */}
      <group position={[-w / 2 - f, -h / 2 - f - 0.07, slot.hanging ? 0.003 : 0.004]}>
        <Text font={interSemi} fontSize={0.072} letterSpacing={-0.03} color="#1c1712" anchorX="left" anchorY="top">
          {property.name}
        </Text>
        <Text font={interMedium} fontSize={0.046} letterSpacing={-0.01} color="#8f8172" anchorX="left" anchorY="top" position={[0, -0.095, 0]}>
          {`${property.location}  ·  ${property.beds} bedrooms  ·  ${property.area}`}
        </Text>
      </group>
    </group>
  )
}
