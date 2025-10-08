"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import type { Group } from "three"
import { GAME_CONFIG } from "@/components/game/config"

interface MateModelProps {
  position: [number, number, number]
  onCollect: () => void
}

export default function MateModel({ position, onCollect }: MateModelProps) {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF("/models/mate.glb") // 👈 usa tu modelo real

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.02
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <primitive object={scene} scale={GAME_CONFIG.mate.size} /> {/* 👈 inserta tu GLB aquí */}

      {/* Luz brillante */}
      <pointLight position={[0, GAME_CONFIG.mate.size, 0]} intensity={2} distance={8} color="#FFD700" />

      {/* Efecto de glow */}
      <mesh position={[0, GAME_CONFIG.mate.size * 1.2, 0]}>
        <ringGeometry args={[GAME_CONFIG.mate.size * 0.8, GAME_CONFIG.mate.size * 1.2, 16]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}

useGLTF.preload("/models/mate.glb") // 👈 para precargar y evitar delay
