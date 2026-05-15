'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { ThreeJsSceneSection } from '@/lib/schemas'

// ---------------------------------------------------------------------------
// Custom geometries
// ---------------------------------------------------------------------------
// LightningBolt: a 2D zigzag shape extruded to give it depth.
// The closing line (bottom-left → top-right) forms the right-side spine.

function makeLightningBoltGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(0.4, 1.0)    // top-right
  shape.lineTo(0.0, 1.0)    // top-left  (short top cap)
  shape.lineTo(-0.35, 0.05) // slash down-left (left edge, upper half)
  shape.lineTo(0.15, 0.05)  // step right (upper notch)
  shape.lineTo(-0.15, -0.05)// small diagonal (notch bridge)
  shape.lineTo(0.35, -0.05) // step right (lower notch)
  shape.lineTo(0.0, -1.0)   // slash down-left (right edge, lower half)
  shape.lineTo(-0.4, -1.0)  // bottom-left (short bottom cap)
  shape.closePath()          // long diagonal back to top-right (right spine)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.28,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: 4,
  })
  geo.center()
  return geo
}

type ObjectConfig = ThreeJsSceneSection['objects'][number]
type LightConfig = ThreeJsSceneSection['lights'][number]

function SceneMesh({ object }: { object: ObjectConfig }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const baseY = object.position?.[1] ?? 0

  // Custom geometries are created once and reused.
  const lightningBoltGeo = useMemo(
    () => object.geometry.type === 'LightningBolt' ? makeLightningBoltGeometry() : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [object.geometry.type],
  )

  useFrame((state, delta) => {
    if (!meshRef.current) return
    const r = object.animation?.rotate
    if (r) {
      meshRef.current.rotation.x += r[0]
      meshRef.current.rotation.y += r[1]
      meshRef.current.rotation.z += r[2]
    }
    const f = object.animation?.float
    if (f) {
      meshRef.current.position.y =
        baseY + Math.sin(state.clock.elapsedTime * f.speed) * f.amplitude
    }
  })

  const geo = object.geometry
  const mat = object.material
  const pos = (object.position ?? [0, 0, 0]) as [number, number, number]
  const scale = object.scale ?? 1
  const p = geo.params ?? []

  return (
    <mesh ref={meshRef} position={pos} scale={scale}>
      {geo.type === 'Box'           && <boxGeometry args={p as [number?, number?, number?]} />}
      {geo.type === 'Sphere'        && <sphereGeometry args={p as [number?, number?, number?]} />}
      {geo.type === 'Torus'         && <torusGeometry args={p as [number?, number?, number?, number?]} />}
      {geo.type === 'TorusKnot'     && <torusKnotGeometry args={p as [number?, number?, number?, number?]} />}
      {geo.type === 'Icosahedron'   && <icosahedronGeometry args={p as [number?, number?]} />}
      {geo.type === 'Octahedron'    && <octahedronGeometry args={p as [number?, number?]} />}
      {geo.type === 'Cone'          && <coneGeometry args={p as [number?, number?, number?]} />}
      {geo.type === 'Cylinder'      && <cylinderGeometry args={p as [number?, number?, number?]} />}
      {geo.type === 'Dodecahedron'  && <dodecahedronGeometry args={p as [number?, number?]} />}
      {geo.type === 'Tetrahedron'   && <tetrahedronGeometry args={p as [number?, number?]} />}
      {geo.type === 'LightningBolt' && lightningBoltGeo && (
        <primitive object={lightningBoltGeo} />
      )}

      {mat.type === 'MeshStandardMaterial' && (
        <meshStandardMaterial
          color={mat.color ?? '#ffffff'}
          wireframe={mat.wireframe ?? false}
          roughness={mat.roughness ?? 0.4}
          metalness={mat.metalness ?? 0.6}
          transparent={mat.transparent ?? (mat.opacity !== undefined && mat.opacity < 1)}
          opacity={mat.opacity ?? 1}
        />
      )}
      {mat.type === 'MeshPhysicalMaterial' && (
        <meshPhysicalMaterial
          color={mat.color ?? '#ffffff'}
          wireframe={mat.wireframe ?? false}
          roughness={mat.roughness ?? 0.2}
          metalness={mat.metalness ?? 0.8}
          transparent={mat.transparent ?? (mat.opacity !== undefined && mat.opacity < 1)}
          opacity={mat.opacity ?? 1}
        />
      )}
      {mat.type === 'MeshNormalMaterial' && (
        <meshNormalMaterial wireframe={mat.wireframe ?? false} />
      )}
      {mat.type === 'MeshBasicMaterial' && (
        <meshBasicMaterial
          color={mat.color ?? '#ffffff'}
          wireframe={mat.wireframe ?? true}
          transparent={mat.transparent ?? (mat.opacity !== undefined && mat.opacity < 1)}
          opacity={mat.opacity ?? 1}
        />
      )}
    </mesh>
  )
}

function SceneLight({ light }: { light: LightConfig }) {
  const color = light.color ?? '#ffffff'
  if (light.type === 'AmbientLight') {
    return <ambientLight intensity={light.intensity} color={color} />
  }
  const pos = (light as { position?: [number, number, number] }).position ?? ([5, 5, 5] as [number, number, number])
  if (light.type === 'PointLight') {
    return <pointLight intensity={light.intensity} position={pos} color={color} />
  }
  if (light.type === 'DirectionalLight') {
    return <directionalLight intensity={light.intensity} position={pos} color={color} />
  }
  return null
}

export default function ThreeJsCanvas({ section }: { section: ThreeJsSceneSection }) {
  const camPos = (section.camera?.position ?? [0, 0, 5]) as [number, number, number]
  const fov = section.camera?.fov ?? 60

  return (
    <Canvas
      camera={{ position: camPos, fov }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      {section.lights.map((light, i) => (
        <SceneLight key={i} light={light} />
      ))}
      {section.objects.map(obj => (
        <SceneMesh key={obj.id} object={obj} />
      ))}
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}
