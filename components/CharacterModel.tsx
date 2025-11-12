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
        
        // Efecto visual de invulnerabilidad
        if (isInvulnerable && scene) {
          scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              // Crear efecto de brillo verde sutil
              const material = child.material as THREE.MeshStandardMaterial
              if (material.emissive) {
                const intensity = Math.sin(state.clock.elapsedTime * 8) * 0.3 + 0.3
                material.emissive.setRGB(0, intensity * 0.4, 0)
                material.emissiveIntensity = intensity
              }
            }
          })
        } else if (scene) {
          // Restaurar colores normales cuando no es invulnerable
          scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              const material = child.material as THREE.MeshStandardMaterial
              if (material.emissive) {
                material.emissive.setRGB(0, 0, 0)
                material.emissiveIntensity = 0
              }
            }
          })
        }
      }
    })

    // Si no hay modelo cargado, mostrar un cubo de fallback
    if (!scene) {
      return (
        <group ref={ref || groupRef} position={position}>
          <mesh>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial 
              color={isInvulnerable ? "#00ff44" : "blue"}
              emissive={isInvulnerable ? "#004400" : "#000000"}
              emissiveIntensity={isInvulnerable ? 0.3 : 0}
            />
          </mesh>
          
          {/* Efectos de invulnerabilidad para el fallback */}
          {isInvulnerable && (
            <>
              <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.8, 1.2, 24]} />
                <meshStandardMaterial
                  color="#00ff00"
                  emissive="#00ff00"
                  emissiveIntensity={0.6}
                  transparent
                  opacity={0.4}
                />
              </mesh>
              <pointLight position={[0, 0.5, 0]} intensity={1} distance={3} color="#00ff44" />
            </>
          )}
        </group>
      )
    }

    // Mantener siempre los colores originales del modelo
    const characterModel = scene.clone()

    return (
      <group ref={ref || groupRef} position={position}>
        <primitive object={characterModel} scale={[0.5, 0.5, 0.5]} />
        
        {/* Anillo de protección cuando es invulnerable */}
        {isInvulnerable && (
          <>
            {/* Anillo exterior brillante */}
            <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.8, 1.2, 24]} />
              <meshStandardMaterial
                color="#00ff00"
                emissive="#00ff00"
                emissiveIntensity={0.6}
                transparent
                opacity={0.4}
              />
            </mesh>
            
            {/* Partículas flotantes */}
            <mesh position={[0, 1, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial
                color="#00ff88"
                emissive="#00ff88"
                emissiveIntensity={0.8}
              />
            </mesh>
            
            {/* Luz verde sutil */}
            <pointLight position={[0, 0.5, 0]} intensity={1} distance={3} color="#00ff44" />
          </>
        )}
      </group>
    )
  }
)

CharacterModel.displayName = "CharacterModel"

useGLTF.preload("/models/character.glb")

export default CharacterModel