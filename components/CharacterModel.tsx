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
            <meshStandardMaterial 
              color={isInvulnerable ? "#00FF00" : "blue"}
              emissive={isInvulnerable ? "#004400" : "#000000"}
              emissiveIntensity={isInvulnerable ? 0.3 : 0}
            />
          </mesh>
        </group>
      )
    }

    // Aplicar color verde cuando es invulnerable
    const characterModel = scene.clone()
    if (isInvulnerable) {
      characterModel.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.color.setHex(0x00ff00)
                mat.emissive.setHex(0x004400)
                mat.emissiveIntensity = 0.3
              }
            })
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.color.setHex(0x00ff00)
            child.material.emissive.setHex(0x004400)
            child.material.emissiveIntensity = 0.3
          }
        }
      })
    } else {
      // Mantener colores originales del modelo (no forzar blanco)
      characterModel.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                // Solo resetear la emisión, mantener color original
                mat.emissive.setHex(0x000000)
                mat.emissiveIntensity = 0
                // No cambiar mat.color para mantener los colores originales
              }
            })
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            // Solo resetear la emisión, mantener color original
            child.material.emissive.setHex(0x000000)
            child.material.emissiveIntensity = 0
            // No cambiar child.material.color para mantener los colores originales
          }
        }
      })
    }

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