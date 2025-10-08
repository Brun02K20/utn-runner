"use client"

import React, { forwardRef, useMemo, useState, useEffect } from "react"
import type { Group } from "three"
import * as THREE from "three"
import { GAME_CONFIG } from "./config"

interface TerrainSegment {
  id: number
  z: number
}

interface TunnelLight {
  id: number
  z: number
}

interface WallImage {
  id: number
  z: number
}

interface TerrainProps {
  terrainSegments: TerrainSegment[]
  tunnelLights: TunnelLight[]
  wallImages: WallImage[]
  playerZ: number
}

const Terrain = forwardRef<Group, TerrainProps>(({ terrainSegments, tunnelLights, wallImages, playerZ }, ref) => {
  const [texturesLoaded, setTexturesLoaded] = useState(false)

  // Crear y configurar texturas solo una vez
  const textures = useMemo(() => {
    let loadedCount = 0
    const totalTextures = 4

    const checkAllLoaded = () => {
      loadedCount++
      if (loadedCount === totalTextures) {
        setTexturesLoaded(true)
      }
    }

    const floorTex = new THREE.TextureLoader().load("/textures/terrain/textura_piso.png", checkAllLoaded)
    floorTex.wrapS = THREE.RepeatWrapping
    floorTex.wrapT = THREE.RepeatWrapping
    floorTex.repeat.set(8, 4)

    const wallTex = new THREE.TextureLoader().load("/textures/terrain/textura_pared.png", checkAllLoaded)
    wallTex.wrapS = THREE.ClampToEdgeWrapping
    wallTex.wrapT = THREE.ClampToEdgeWrapping
    wallTex.repeat.set(1, 1)

    const roofTex = new THREE.TextureLoader().load("/textures/terrain/textura_techo.png", checkAllLoaded)
    roofTex.wrapS = THREE.RepeatWrapping
    roofTex.wrapT = THREE.RepeatWrapping
    roofTex.repeat.set(8, 4)

    const cetTex = new THREE.TextureLoader().load("/assets/cet.png", checkAllLoaded)
    cetTex.flipY = false

    return {
      floor: floorTex,
      wall: wallTex,
      roof: roofTex,
      cet: cetTex
    }
  }, []) // Solo se ejecuta una vez

  // Optimizar: solo renderizar segmentos cercanos para mejor rendimiento
  const visibleSegments = useMemo(() => {
    return terrainSegments.filter(segment =>
      Math.abs(segment.z - playerZ) < GAME_CONFIG.terrain.renderDistance
    )
  }, [terrainSegments, playerZ])

  // Si las texturas no están cargadas, mostrar un indicador de carga
  if (!texturesLoaded) {
    return (
      <group ref={ref}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="gray" />
        </mesh>
      </group>
    )
  }

  // Usar texturas configuradas
  const floorMap = textures.floor
  const wallMap = textures.wall
  const roofMap = textures.roof
  const cetMap = textures.cet

  return (
    <group ref={ref}>
      {/* Floor segments */}
      {visibleSegments.map((segment) => (
        <mesh key={segment.id} position={[0, -1, segment.z]} receiveShadow>
          <boxGeometry args={[20, 0.2, GAME_CONFIG.terrain.segmentSize]} />
          <meshStandardMaterial
            map={floorMap}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Walls */}
      {visibleSegments.map((segment) => (
        <group key={`walls-${segment.id}`}>
          <mesh position={[-10, 4, segment.z]} receiveShadow>
            <boxGeometry args={[0.5, 10, GAME_CONFIG.terrain.segmentSize]} />
            <meshStandardMaterial
              map={wallMap}
              roughness={0.7}
              metalness={0.0}
            />
          </mesh>
          <mesh position={[10, 4, segment.z]} receiveShadow>
            <boxGeometry args={[0.5, 10, GAME_CONFIG.terrain.segmentSize]} />
            <meshStandardMaterial
              map={wallMap}
              roughness={0.7}
              metalness={0.0}
            />
          </mesh>
        </group>
      ))}

      {/* Wall features (windows and doors) */}
      {visibleSegments.map((segment) => {
        const seed = Math.abs(segment.z * 0.1) % 1
        const leftFeature = seed < 0.3 ? "window" : seed < 0.5 ? "door" : "none"
        const rightFeature = (seed + 0.5) % 1 < 0.3 ? "window" : (seed + 0.5) % 1 < 0.5 ? "door" : "none"

        return (
          <group key={`wall-features-${segment.id}`}>
            {leftFeature === "window" && (
              <mesh position={[-9.8, 5, segment.z]}>
                <boxGeometry args={[0.5, 2, 1.5]} />
                <meshStandardMaterial color="#87CEEB" roughness={0.1} metalness={0.8} />
              </mesh>
            )}
            {leftFeature === "door" && (
              <mesh position={[-9.8, 2, segment.z]}>
                <boxGeometry args={[0.5, 4, 1.2]} />
                <meshStandardMaterial color="#8B4513" roughness={0.8} metalness={0.1} />
              </mesh>
            )}

            {rightFeature === "window" && (
              <mesh position={[9.8, 5, segment.z]}>
                <boxGeometry args={[0.5, 2, 1.5]} />
                <meshStandardMaterial color="#87CEEB" roughness={0.1} metalness={0.8} />
              </mesh>
            )}
            {rightFeature === "door" && (
              <mesh position={[9.8, 2, segment.z]}>
                <boxGeometry args={[0.5, 4, 1.2]} />
                <meshStandardMaterial color="#8B4513" roughness={0.8} metalness={0.1} />
              </mesh>
            )}
          </group>
        )
      })}

      {/* Roof */}
      {visibleSegments.map((segment) => (
        <mesh key={`roof-${segment.id}`} position={[0, 9, segment.z]}>
          <boxGeometry args={[20, 0.5, GAME_CONFIG.terrain.segmentSize]} />
          <meshStandardMaterial
            map={roofMap}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Tunnel lights (geometric cubes only, no point lights) */}
      {tunnelLights.map((light) => (
        <group key={`light-${light.id}`}>
          <mesh position={[-5, 8.5, light.z]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 6]} />
            <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[5, 8.5, light.z]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 6]} />
            <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Wall images */}
      {wallImages.map((image) => (
        <mesh key={`wall-image-${image.id}`} position={[-9.5, 4, image.z]}>
          <planeGeometry args={[2, 2]} />
          <meshStandardMaterial>
            <primitive object={cetMap} attach="map" />
          </meshStandardMaterial>
        </mesh>
      ))}
    </group>
  )
})

Terrain.displayName = "Terrain"

export default React.memo(Terrain)
