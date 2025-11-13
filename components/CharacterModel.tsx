"use client"
import { useRef, forwardRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import type { Group } from "three"
import * as THREE from "three"

interface CharacterModelProps {
  position: [number, number, number]
  isInvulnerable: boolean
  hasShield?: boolean
  equippedHat?: string
  equippedShoes?: string
}

const CharacterModel = forwardRef<Group, CharacterModelProps>(
  ({ position, isInvulnerable, hasShield, equippedHat, equippedShoes }, ref) => {
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
        
        // Efecto visual de invulnerabilidad (verde)
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
        } else if (hasShield && scene) {
          // Efecto visual de escudo (azul)
          scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              const material = child.material as THREE.MeshStandardMaterial
              if (material.emissive) {
                const intensity = Math.sin(state.clock.elapsedTime * 6) * 0.2 + 0.2
                material.emissive.setRGB(0, intensity * 0.5, intensity)
                material.emissiveIntensity = intensity
              }
            }
          })
        } else if (scene) {
          // Restaurar colores normales cuando no es invulnerable ni tiene escudo
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
              color={isInvulnerable ? "#00ff44" : hasShield ? "#00BFFF" : "blue"}
              emissive={isInvulnerable ? "#004400" : hasShield ? "#004488" : "#000000"}
              emissiveIntensity={isInvulnerable || hasShield ? 0.3 : 0}
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
          
          {/* Efectos de escudo para el fallback */}
          {hasShield && (
            <>
              <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.8, 1.2, 24]} />
                <meshStandardMaterial
                  color="#00BFFF"
                  emissive="#00BFFF"
                  emissiveIntensity={0.6}
                  transparent
                  opacity={0.4}
                />
              </mesh>
              <pointLight position={[0, 0.5, 0]} intensity={1} distance={3} color="#00BFFF" />
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
        
        {/* Anillo de protección cuando es invulnerable (verde) */}
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
        
        {/* Anillo de escudo cuando tiene USB (azul) */}
        {hasShield && (
          <>
            {/* Anillo exterior brillante azul */}
            <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.8, 1.2, 24]} />
              <meshStandardMaterial
                color="#00BFFF"
                emissive="#00BFFF"
                emissiveIntensity={0.6}
                transparent
                opacity={0.4}
              />
            </mesh>
            
            {/* Partículas flotantes azules */}
            <mesh position={[0, 1, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial
                color="#00BFFF"
                emissive="#00BFFF"
                emissiveIntensity={0.8}
              />
            </mesh>
            
            {/* Luz azul sutil */}
            <pointLight position={[0, 0.5, 0]} intensity={1} distance={3} color="#00BFFF" />
          </>
        )}
        
        {/* Gorros equipados */}
        {equippedHat && equippedHat !== 'none' && (
          <group position={[0, 1.5, 0]}>
            {equippedHat === 'cap-basic' && (
              <>
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.4, 0.5, 0.3, 16]} />
                  <meshStandardMaterial color="#2563eb" />
                </mesh>
                <mesh position={[0.4, -0.1, 0]} rotation={[0, 0, -0.3]}>
                  <boxGeometry args={[0.6, 0.05, 0.4]} />
                  <meshStandardMaterial color="#1e40af" />
                </mesh>
              </>
            )}
            {equippedHat === 'cap-premium' && (
              <>
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.4, 0.5, 0.3, 16]} />
                  <meshStandardMaterial color="#dc2626" />
                </mesh>
                <mesh position={[0.4, -0.1, 0]} rotation={[0, 0, -0.3]}>
                  <boxGeometry args={[0.6, 0.05, 0.4]} />
                  <meshStandardMaterial color="#991b1b" />
                </mesh>
                <mesh position={[0, 0.1, 0.35]}>
                  <sphereGeometry args={[0.08, 8, 8]} />
                  <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.5} />
                </mesh>
              </>
            )}
            {equippedHat === 'cap-legendary' && (
              <>
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.4, 0.5, 0.3, 16]} />
                  <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0.4, -0.1, 0]} rotation={[0, 0, -0.3]}>
                  <boxGeometry args={[0.6, 0.05, 0.4]} />
                  <meshStandardMaterial color="#92400e" metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Corona decorativa */}
                {[-0.15, 0, 0.15].map((offset, i) => (
                  <mesh key={i} position={[0, 0.15, offset]} rotation={[0, 0, 0]}>
                    <coneGeometry args={[0.05, 0.15, 4]} />
                    <meshStandardMaterial color="#fef3c7" metalness={0.9} roughness={0.1} />
                  </mesh>
                ))}
                <pointLight position={[0, 0.2, 0]} intensity={0.5} distance={1} color="#fbbf24" />
              </>
            )}
          </group>
        )}
        
        {/* Zapatos equipados */}
        {equippedShoes && equippedShoes !== 'none' && (
          <group position={[0, -0.3, 0]}>
            {equippedShoes === 'shoes-basic' && (
              <>
                {/* Zapatilla izquierda */}
                <group position={[-0.2, 0, 0]}>
                  <mesh rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.15, 0.1, 0.25]} />
                    <meshStandardMaterial color="#f1f5f9" />
                  </mesh>
                  <mesh position={[0, 0.05, 0]}>
                    <boxGeometry args={[0.16, 0.02, 0.26]} />
                    <meshStandardMaterial color="#3b82f6" />
                  </mesh>
                  <mesh position={[0, -0.05, 0]}>
                    <boxGeometry args={[0.15, 0.03, 0.25]} />
                    <meshStandardMaterial color="#1e293b" />
                  </mesh>
                </group>
                {/* Zapatilla derecha */}
                <group position={[0.2, 0, 0]}>
                  <mesh rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.15, 0.1, 0.25]} />
                    <meshStandardMaterial color="#f1f5f9" />
                  </mesh>
                  <mesh position={[0, 0.05, 0]}>
                    <boxGeometry args={[0.16, 0.02, 0.26]} />
                    <meshStandardMaterial color="#3b82f6" />
                  </mesh>
                  <mesh position={[0, -0.05, 0]}>
                    <boxGeometry args={[0.15, 0.03, 0.25]} />
                    <meshStandardMaterial color="#1e293b" />
                  </mesh>
                </group>
              </>
            )}
            {equippedShoes === 'shoes-premium' && (
              <>
                {/* Zapatilla izquierda */}
                <group position={[-0.2, 0, 0]}>
                  <mesh rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.15, 0.1, 0.25]} />
                    <meshStandardMaterial color="#1e293b" />
                  </mesh>
                  <mesh position={[0, 0.05, 0]}>
                    <boxGeometry args={[0.16, 0.02, 0.26]} />
                    <meshStandardMaterial color="#dc2626" />
                  </mesh>
                  <mesh position={[0, -0.05, 0]}>
                    <boxGeometry args={[0.15, 0.03, 0.25]} />
                    <meshStandardMaterial color="#0f172a" />
                  </mesh>
                  <mesh position={[0, 0.03, 0.05]}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshStandardMaterial color="#ef4444" />
                  </mesh>
                </group>
                {/* Zapatilla derecha */}
                <group position={[0.2, 0, 0]}>
                  <mesh rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.15, 0.1, 0.25]} />
                    <meshStandardMaterial color="#1e293b" />
                  </mesh>
                  <mesh position={[0, 0.05, 0]}>
                    <boxGeometry args={[0.16, 0.02, 0.26]} />
                    <meshStandardMaterial color="#dc2626" />
                  </mesh>
                  <mesh position={[0, -0.05, 0]}>
                    <boxGeometry args={[0.15, 0.03, 0.25]} />
                    <meshStandardMaterial color="#0f172a" />
                  </mesh>
                  <mesh position={[0, 0.03, 0.05]}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshStandardMaterial color="#ef4444" />
                  </mesh>
                </group>
              </>
            )}
            {equippedShoes === 'shoes-legendary' && (
              <>
                {/* Zapatilla izquierda */}
                <group position={[-0.2, 0, 0]}>
                  <mesh rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.15, 0.1, 0.25]} />
                    <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
                  </mesh>
                  <mesh position={[0, 0.05, 0]}>
                    <boxGeometry args={[0.16, 0.02, 0.26]} />
                    <meshStandardMaterial color="#fef3c7" metalness={0.8} roughness={0.2} />
                  </mesh>
                  <mesh position={[0, -0.05, 0]}>
                    <boxGeometry args={[0.15, 0.03, 0.25]} />
                    <meshStandardMaterial color="#d97706" />
                  </mesh>
                  <mesh position={[0, 0.03, 0.05]}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.5} />
                  </mesh>
                  <pointLight position={[0, 0, 0.1]} intensity={0.3} distance={0.5} color="#fbbf24" />
                </group>
                {/* Zapatilla derecha */}
                <group position={[0.2, 0, 0]}>
                  <mesh rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.15, 0.1, 0.25]} />
                    <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
                  </mesh>
                  <mesh position={[0, 0.05, 0]}>
                    <boxGeometry args={[0.16, 0.02, 0.26]} />
                    <meshStandardMaterial color="#fef3c7" metalness={0.8} roughness={0.2} />
                  </mesh>
                  <mesh position={[0, -0.05, 0]}>
                    <boxGeometry args={[0.15, 0.03, 0.25]} />
                    <meshStandardMaterial color="#d97706" />
                  </mesh>
                  <mesh position={[0, 0.03, 0.05]}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.5} />
                  </mesh>
                  <pointLight position={[0, 0, 0.1]} intensity={0.3} distance={0.5} color="#fbbf24" />
                </group>
              </>
            )}
          </group>
        )}
      </group>
    )
  }
)

CharacterModel.displayName = "CharacterModel"

useGLTF.preload("/models/character.glb")

export default CharacterModel