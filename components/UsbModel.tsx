"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import type { Group } from "three"
import { GAME_CONFIG } from "@/components/game/config"

interface UsbModelProps {
  position: [number, number, number]
  onCollect: () => void
}

export default function UsbModel({ position, onCollect }: UsbModelProps) {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF("/models/usb.glb")

  useFrame((state) => {
    if (groupRef.current) {
      // Movimiento sutil arriba y abajo (muy tenue)
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.15
      
      // Leve inclinación en X para darle vida sin rotar completamente
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={[position[0] - 2.5, position[1], position[2]]}>
      <primitive object={scene} scale={GAME_CONFIG.usb.size} />

      {/* Luz brillante azul */}
      <pointLight position={[0, GAME_CONFIG.usb.size, 0]} intensity={2} distance={8} color="#00BFFF" />

      {/* Efecto de glow azul */}
      <mesh position={[0, GAME_CONFIG.usb.size * 1.2, 0]}>
        <ringGeometry args={[GAME_CONFIG.usb.size * 0.8, GAME_CONFIG.usb.size * 1.2, 16]} />
        <meshStandardMaterial
          color="#00BFFF"
          emissive="#00BFFF"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}

useGLTF.preload("/models/usb.glb")
