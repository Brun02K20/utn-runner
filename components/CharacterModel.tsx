"use client"
import { useRef, forwardRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import type { Group } from "three"
import * as THREE from "three"

interface CharacterModelProps {
  position: [number, number, number]
  isInvulnerable: boolean
}

const CharacterModel = forwardRef<Group, CharacterModelProps>(
  ({ position, isInvulnerable }, ref) => {
    const groupRef = useRef<Group>(null)
    
    // Intentar cargar el modelo con manejo de errores
    let gltf
    try {
      gltf = useGLTF("/models/character.glb")
    } catch (error) {
      console.error('[CharacterModel] Error loading GLTF:', error)
    }
    
    const scene = gltf?.scene
    
    // Debug: verificar que el modelo se cargó
    useEffect(() => {
      if (scene) {
        console.log('[CharacterModel] Model loaded successfully:', scene)
        console.log('[CharacterModel] Model children:', scene.children.length)
        console.log('[CharacterModel] Model scale:', scene.scale)
        
        // Revisar la estructura del modelo
        scene.traverse((child) => {
          console.log('[CharacterModel] Child:', child.type, child.name)
          if (child instanceof THREE.Mesh) {
            console.log('[CharacterModel] Mesh geometry:', child.geometry)
            console.log('[CharacterModel] Mesh material:', child.material)
          }
        })
      } else {
        console.warn('[CharacterModel] No scene loaded!')
      }
    }, [scene])

    useFrame((state, delta) => {
      if (groupRef.current) {
        // Rotación sutil del personaje
        //groupRef.current.rotation.y += delta * 0.00000002
      }
    })

    // Si no hay modelo cargado, mostrar un cubo de fallback
    if (!scene) {
      return (
        <group ref={ref || groupRef} position={position}>
          <mesh>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color="blue" />
          </mesh>
        </group>
      )
    }

    // Mantener siempre los colores originales del modelo
    const characterModel = scene.clone()

    return (
      <group ref={ref || groupRef} position={position}>
        <primitive object={characterModel} scale={[0.5, 0.5, 0.5]} />
      </group>
    )
  }
)

CharacterModel.displayName = "CharacterModel"

useGLTF.preload("/models/character.glb")

export default CharacterModel