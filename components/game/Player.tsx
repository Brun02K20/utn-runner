"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import type { Group, SpotLight } from "three"
import * as THREE from "three"
import { GAME_CONFIG } from "./config"
import Terrain from "./Terrain"
import Obstacles from "./Obstacles"
import { useHandControlContext } from "../vision/HandControlContext"
import { gameTimeManager } from "./GameTimeManager"
import CharacterModel from "../CharacterModel"

type Lane = "left" | "center" | "right"

interface Obstacle {
  id: number
  x: number
  z: number
  lane: Lane
  type: "libros" | "pcvieja" | "silla"
}

interface Mate {
  id: number
  x: number
  z: number
  lane: Lane
}

interface Usb {
  id: number
  x: number
  z: number
  lane: Lane
}

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

interface PlayerProps {
  onGameOver: () => void
  isGameOver: boolean
  isPaused: boolean
  onScoreUpdate: (score: number) => void
  onMiniGameStart: () => void
  onMiniGameEnd: () => void
  isMiniGameActive: boolean
  miniGameCompleteRef?: React.MutableRefObject<((won: boolean) => void) | null>
  onInvulnerabilityChange?: (isInvulnerable: boolean) => void
  onInvulnerabilityTimeUpdate?: (timeLeft: number) => void
  onMiniGame2Start?: () => void
  onMiniGame3Start?: () => void
  onMiniGame4Start?: () => void
  onMiniGame5Start?: () => void
  activeMiniGame?: 1 | 2 | 3 | 4 | 5 | null
}

export default function Player({ onGameOver, isGameOver, isPaused, onScoreUpdate, onMiniGameStart, onMiniGameEnd, isMiniGameActive, miniGameCompleteRef, onInvulnerabilityChange, onInvulnerabilityTimeUpdate, onMiniGame2Start, onMiniGame3Start, onMiniGame4Start, onMiniGame5Start, activeMiniGame }: PlayerProps) {
  const meshRef = useRef<Group>(null)
  const terrainRef = useRef<Group>(null)
  const { camera } = useThree()

  // Player state
  const [currentLane, setCurrentLane] = useState<Lane>("center")
  const [targetX, setTargetX] = useState(GAME_CONFIG.lanes.center)
  const [positionZ, setPositionZ] = useState(0)

  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [lastObstacleSpawn, setLastObstacleSpawn] = useState(0)
  const obstacleIdCounter = useRef(0)

  const [mates, setMates] = useState<Mate[]>([])
  const mateIdCounter = useRef(0)

  const [usbs, setUsbs] = useState<Usb[]>([])
  const usbIdCounter = useRef(0)

  const [hasShield, setHasShield] = useState(false)

  const [isInvulnerable, setIsInvulnerable] = useState(false)
  const [invulnerabilityEndTime, setInvulnerabilityEndTime] = useState(0)

  const [isJumping, setIsJumping] = useState(false)
  const [jumpStartTime, setJumpStartTime] = useState(0)
  const [currentY, setCurrentY] = useState(0)

  const [totalDistance, setTotalDistance] = useState(0)
  const spotLightRef = useRef<SpotLight>(null)

  // Mini-game state
  const [miniGameWon, setMiniGameWon] = useState(false)

  const [terrainSegments, setTerrainSegments] = useState<TerrainSegment[]>(() => {
    const initialSegments: TerrainSegment[] = []
    const totalSegments = GAME_CONFIG.terrain.segmentsAhead + GAME_CONFIG.terrain.segmentsBehind + 1

    for (let i = 0; i < totalSegments; i++) {
      initialSegments.push({
        id: i,
        z: (i - GAME_CONFIG.terrain.segmentsBehind) * GAME_CONFIG.terrain.segmentSize,
      })
    }
    return initialSegments
  })

  const [tunnelLights, setTunnelLights] = useState<TunnelLight[]>(() => {
    const initialLights: TunnelLight[] = []
    const totalSegments = GAME_CONFIG.terrain.segmentsAhead + GAME_CONFIG.terrain.segmentsBehind + 1

    for (let i = 0; i < totalSegments; i++) {
      initialLights.push({
        id: i,
        z: (i - GAME_CONFIG.terrain.segmentsBehind) * GAME_CONFIG.terrain.segmentSize,
      })
    }
    return initialLights
  })

  const [wallImages, setWallImages] = useState<WallImage[]>([])
  const [lastWallImageSpawn, setLastWallImageSpawn] = useState(0)
  const wallImageIdCounter = useRef(0)

  const terrainIdCounter = useRef(GAME_CONFIG.terrain.segmentsAhead + GAME_CONFIG.terrain.segmentsBehind + 1)
  const lightIdCounter = useRef(GAME_CONFIG.terrain.segmentsAhead + GAME_CONFIG.terrain.segmentsBehind + 1)

  const { lane: handLane, jump: handJump } = useHandControlContext()
  const [keyboardActive, setKeyboardActive] = useState(false)
  const keyboardTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isGameOver || isPaused) return

      setKeyboardActive(true)
      if (keyboardTimeoutRef.current) {
        clearTimeout(keyboardTimeoutRef.current)
      }
      keyboardTimeoutRef.current = setTimeout(() => {
        setKeyboardActive(false)
      }, 1000)

      switch (event.key) {
        // ArrowRight should move to the right lane (increasing X)
        case "ArrowLeft":
          if (currentLane === "center") {
            setCurrentLane("right")
            setTargetX(GAME_CONFIG.lanes.right)
          } else if (currentLane === "left") {
            setCurrentLane("center")
            setTargetX(GAME_CONFIG.lanes.center)
          }
          break
        // ArrowLeft should move to the left lane (decreasing X)
        case "ArrowRight":
          if (currentLane === "center") {
            setCurrentLane("left")
            setTargetX(GAME_CONFIG.lanes.left)
          } else if (currentLane === "right") {
            setCurrentLane("center")
            setTargetX(GAME_CONFIG.lanes.center)
          }
          break
        case "ArrowUp":
          if (!isJumping) {
            setIsJumping(true)
            setJumpStartTime(gameTimeManager.getGameTime())
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
      if (keyboardTimeoutRef.current) {
        clearTimeout(keyboardTimeoutRef.current)
      }
    }
  }, [currentLane, isJumping, isGameOver, isPaused])

  useEffect(() => {
    // Solo bloquear si el teclado está activo, permitir controles de mano durante pausa/game over para testing
    if (keyboardActive) return

    // Apply hand lane control solo cuando el juego está activo
    if (handLane && handLane !== currentLane && !isGameOver && !isPaused) {
      setCurrentLane(handLane)
      setTargetX(GAME_CONFIG.lanes[handLane])
    }
  }, [handLane, currentLane, isGameOver, isPaused, keyboardActive])

  useEffect(() => {
    // Solo bloquear si el teclado está activo, permitir controles de mano durante pausa/game over para testing
    if (keyboardActive) return

    if (handJump && !isJumping && !isGameOver && !isPaused) {
      setIsJumping(true)
      setJumpStartTime(gameTimeManager.getGameTime())
    }
  }, [handJump, isJumping, isGameOver, isPaused, keyboardActive])

  useEffect(() => {
    if (isGameOver || isPaused) return

    const timeElapsed = gameTimeManager.getGameTime()
    const timeScore = timeElapsed * GAME_CONFIG.scoring.pointsPerSecond
    const distanceScore = totalDistance * GAME_CONFIG.scoring.distanceMultiplier
    const currentScore = timeScore + distanceScore

    onScoreUpdate(currentScore)
  }, [totalDistance, isGameOver, isPaused, onScoreUpdate])

  // Notificar cambios en el estado de invulnerabilidad
  useEffect(() => {
    if (onInvulnerabilityChange) {
      onInvulnerabilityChange(isInvulnerable)
    }
  }, [isInvulnerable, onInvulnerabilityChange])

  // Actualizar tiempo restante de invulnerabilidad
  useEffect(() => {
    if (onInvulnerabilityTimeUpdate && isInvulnerable) {
      const currentTime = gameTimeManager.getGameTime()
      const timeLeft = Math.max(0, invulnerabilityEndTime - currentTime)
      onInvulnerabilityTimeUpdate(timeLeft)
    }
  }, [isInvulnerable, invulnerabilityEndTime, onInvulnerabilityTimeUpdate])

  // Invulnerability will be checked in the main game loop using gameTime

  const checkCollisions = (playerX: number, playerY: number, playerZ: number) => {
    const playerBox = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(playerX, playerY, playerZ),
      new THREE.Vector3(0.8, 0.8, 0.8),
    )

    for (const mate of mates) {
      const mateBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(mate.x, GAME_CONFIG.mate.height, mate.z),
        new THREE.Vector3(GAME_CONFIG.mate.size, GAME_CONFIG.mate.size, GAME_CONFIG.mate.size),
      )

      if (playerBox.intersectsBox(mateBox)) {
        collectMate(mate.id)
        return false
      }
    }

    // Colisión con USB
    for (const usb of usbs) {
      const usbBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(usb.x, GAME_CONFIG.usb.height, usb.z),
        new THREE.Vector3(GAME_CONFIG.usb.size, GAME_CONFIG.usb.size, GAME_CONFIG.usb.size),
      )

      if (playerBox.intersectsBox(usbBox)) {
        collectUsb(usb.id)
        return false
      }
    }

    if (!isInvulnerable) {
      for (const obstacle of obstacles) {
        // Usar un tamaño de colisión genérico para todos los modelos 3D
        const obstacleBox = new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(obstacle.x, 1, obstacle.z),
          new THREE.Vector3(1.2, 2, 1.2),
        )

        if (playerBox.intersectsBox(obstacleBox)) {
          console.log(`Collision detected with ${obstacle.type} - invulnerable: ${isInvulnerable}, shield: ${hasShield}`)
          
          // Choque especial con computadora - activar microjuego aleatorio
          if (obstacle.type === "pcvieja") {
            // Remover el obstáculo de la lista y activar microjuego aleatorio
            setObstacles(prev => prev.filter(obs => obs.id !== obstacle.id))
            
            // Seleccionar aleatoriamente entre los cinco minijuegos
            const randomMiniGame = Math.floor(Math.random() * 5) + 1 // 1, 2, 3, 4 o 5
            if (randomMiniGame === 1) {
              onMiniGameStart()
            } else if (randomMiniGame === 2 && onMiniGame2Start) {
              onMiniGame2Start()
            } else if (randomMiniGame === 3 && onMiniGame3Start) {
              onMiniGame3Start()
            } else if (randomMiniGame === 4 && onMiniGame4Start) {
              onMiniGame4Start()
            } else if (randomMiniGame === 5 && onMiniGame5Start) {
              onMiniGame5Start()
            }
            
            return false // No terminar el juego inmediatamente
          } else if (hasShield && (obstacle.type === "libros" || obstacle.type === "silla")) {
            // Si tiene escudo y choca con libros o silla, desactivar escudo y continuar
            console.log('Shield protected from obstacle! Deactivating shield...')
            setHasShield(false)
            setObstacles(prev => prev.filter(obs => obs.id !== obstacle.id))
            return false
          } else {
            // Otros obstáculos causan game over inmediato (o si no tiene escudo)
            return true
          }
        }
      }
    } else {
      console.log(`Player is invulnerable - time: ${gameTimeManager.getGameTime()}, end: ${invulnerabilityEndTime}`)
    }

    return false
  }

  const guardarPorcentajesPorGanarMinijuego = () => {
    // Si el jugador ganó el microjuego, guardar una variable acumulativa que vaya 
    // aumentando un 10% cada vez que gane. Esta variable puede ser usada para
    // dar bonificaciones en futuros microjuegos o en la puntuación final.
    const porcentajeActual = parseFloat(localStorage.getItem('porcentajeMinijuego') || '0')
    const nuevoPorcentaje = Math.min(100, porcentajeActual + 10)
    localStorage.setItem('porcentajeMinijuego', nuevoPorcentaje.toString())
    console.log(`Porcentaje acumulado por ganar minijuegos: ${nuevoPorcentaje}%`)
  }

  const collectMate = (mateId: number) => {
    setMates((prev) => prev.filter((mate) => mate.id !== mateId))

    setIsInvulnerable(true)
    // Convert milliseconds to seconds for gameTime
    const invulnerabilityDurationInSeconds = GAME_CONFIG.mate.invulnerabilityDuration / 1000
    setInvulnerabilityEndTime(gameTimeManager.getGameTime() + invulnerabilityDurationInSeconds)
  }

  const collectUsb = (usbId: number) => {
    setUsbs((prev) => prev.filter((usb) => usb.id !== usbId))
    setHasShield(true)
    console.log('USB collected! Shield activated!')
  }

  const handleMiniGameComplete = (won: boolean) => {
    onMiniGameEnd() // Primero terminar el microjuego para que se reanude el tiempo
    
    if (won) {
      // Esperar un frame para que se reanude el gameTimeManager
      setTimeout(() => {
        // El jugador ganó el microjuego - 1 segundo de invencibilidad
        setMiniGameWon(true)
        setIsInvulnerable(true)
        const invulnerabilityDurationInSeconds = 2 // 2 segundos
        const currentGameTime = gameTimeManager.getGameTime()
        const endTime = currentGameTime + invulnerabilityDurationInSeconds
        setInvulnerabilityEndTime(endTime)
        console.log(`Mini-game won! Invulnerability set from ${currentGameTime} to ${endTime}`)
        guardarPorcentajesPorGanarMinijuego()
      }, 100)
    } else {
      setMiniGameWon(false)
    }
  }

  // Exportar la función a través de miniGameCompleteRef
  useEffect(() => {
    if (miniGameCompleteRef) {
      miniGameCompleteRef.current = handleMiniGameComplete
    }
  }, [miniGameCompleteRef])

  const spawnObstacle = (currentZ: number) => {
    const lanes: Lane[] = ["left", "center", "right"]
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)]
    const laneX = GAME_CONFIG.lanes[randomLane]
    
    const obstacleTypes: ("libros" | "pcvieja" | "silla")[] = ["libros", "pcvieja", "silla"]
    const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]

    const newObstacle: Obstacle = {
      id: obstacleIdCounter.current++,
      x: laneX,
      z: currentZ + GAME_CONFIG.obstacles.spawnDistance,
      lane: randomLane,
      type: randomType,
    }

    setObstacles((prev) => [...prev, newObstacle])

    // Spawn mate con cierta probabilidad
    if (Math.random() < GAME_CONFIG.mate.spawnChance) {
      const newMate: Mate = {
        id: mateIdCounter.current++,
        x: laneX,
        z: currentZ + GAME_CONFIG.obstacles.spawnDistance,
        lane: randomLane,
      }

      setMates((prev) => [...prev, newMate])
    }

    // Spawn USB con cierta probabilidad
    if (Math.random() < GAME_CONFIG.usb.spawnChance) {
      const newUsb: Usb = {
        id: usbIdCounter.current++,
        x: laneX,
        z: currentZ + GAME_CONFIG.obstacles.spawnDistance,
        lane: randomLane,
      }

      setUsbs((prev) => [...prev, newUsb])
    }
  }

  const spawnWallImage = (currentZ: number) => {
    const newWallImage: WallImage = {
      id: wallImageIdCounter.current++,
      z: currentZ + 30,
    }

    setWallImages((prev) => [...prev, newWallImage])
  }

  const updateTerrain = (playerZ: number) => {
    setTerrainSegments((prevSegments) => {
      const updatedSegments = [...prevSegments]

      const minZ = playerZ - GAME_CONFIG.terrain.segmentsBehind * GAME_CONFIG.terrain.segmentSize
      const maxZ = playerZ + GAME_CONFIG.terrain.segmentsAhead * GAME_CONFIG.terrain.segmentSize

      // More aggressive cleanup: remove segments that are far behind
      const filteredSegments = updatedSegments.filter(
        (segment) => segment.z >= minZ - GAME_CONFIG.terrain.segmentSize * 2
      )

      const existingZPositions = new Set(filteredSegments.map((s) => s.z))

      for (let z = minZ; z <= maxZ; z += GAME_CONFIG.terrain.segmentSize) {
        const roundedZ = Math.round(z / GAME_CONFIG.terrain.segmentSize) * GAME_CONFIG.terrain.segmentSize

        if (!existingZPositions.has(roundedZ)) {
          filteredSegments.push({
            id: terrainIdCounter.current++,
            z: roundedZ,
          })
        }
      }

      return filteredSegments.sort((a, b) => a.z - b.z)
    })
  }

  const updateTunnelLights = (playerZ: number) => {
    setTunnelLights((prevLights) => {
      const minZ = playerZ - GAME_CONFIG.terrain.segmentsBehind * GAME_CONFIG.terrain.segmentSize
      const maxZ = playerZ + GAME_CONFIG.terrain.segmentsAhead * GAME_CONFIG.terrain.segmentSize

      // More aggressive cleanup: remove lights that are far behind
      const filteredLights = prevLights.filter(
        (light) => light.z >= minZ - GAME_CONFIG.terrain.segmentSize * 2
      )

      const existingZPositions = new Set(filteredLights.map((l) => l.z))

      // Only add new lights that don't exist
      for (let z = minZ; z <= maxZ; z += GAME_CONFIG.terrain.segmentSize) {
        const roundedZ = Math.round(z / GAME_CONFIG.terrain.segmentSize) * GAME_CONFIG.terrain.segmentSize
        if (roundedZ % 60 === 0 && !existingZPositions.has(roundedZ)) { // Every 3 segments (60 units)
          filteredLights.push({
            id: lightIdCounter.current++,
            z: roundedZ,
          })
        }
      }

      return filteredLights.sort((a, b) => a.z - b.z)
    })
  }

  useFrame((state, delta) => {
    if (!meshRef.current || isGameOver) return

    // Update game time manager and get processed delta - pausar también durante microjuego
    gameTimeManager.setPaused(isPaused || isMiniGameActive)
    
    if (isPaused || isMiniGameActive) return

    const timeResult = gameTimeManager.updateTime(delta)
    const { processedDelta, shouldSkipPhysics, isRecoveringFromFreeze } = timeResult

    // Skip physics during extreme frames to prevent jumps
    if (shouldSkipPhysics) {
      console.log('[Player] Skipping physics due to extreme frame')
      return
    }

    // Use processed delta for all calculations
    const currentX = meshRef.current.position.x

    // Movement based on smoothed delta time
    const movementSpeed = GAME_CONFIG.playerSpeed * processedDelta * 60 // Normalize to 60fps equivalent
    const newZ = positionZ + movementSpeed
    setPositionZ(newZ)
    setTotalDistance(newZ)
    meshRef.current.position.z = newZ

    // Update world elements
    updateTerrain(newZ)
    updateTunnelLights(newZ)

    // Lane switching - use original delta for smooth visual interpolation
    // but limit it to prevent jumps during freeze recovery
    const safeDelta = isRecoveringFromFreeze ? Math.min(delta, 1/30) : delta
    const lerpSpeed = 8 * safeDelta
    const newX = currentX + (targetX - currentX) * lerpSpeed
    meshRef.current.position.x = newX

    // Jump animation using game time (frame-independent)
    if (isJumping) {
      const jumpProgress = gameTimeManager.getEventProgress(jumpStartTime, GAME_CONFIG.jump.duration)

      if (gameTimeManager.isEventComplete(jumpStartTime, GAME_CONFIG.jump.duration)) {
        setIsJumping(false)
        setCurrentY(0)
        meshRef.current.position.y = 0
      } else {
        const jumpY = Math.sin(jumpProgress * Math.PI) * GAME_CONFIG.jump.height
        setCurrentY(jumpY)
        meshRef.current.position.y = jumpY
      }
    }

    // Check invulnerability using game time
    if (isInvulnerable && gameTimeManager.getGameTime() >= invulnerabilityEndTime) {
      console.log(`Invulnerability ended at time: ${gameTimeManager.getGameTime()}`)
      setIsInvulnerable(false)
      setInvulnerabilityEndTime(0)
      if (onInvulnerabilityTimeUpdate) {
        onInvulnerabilityTimeUpdate(0)
      }
    } else if (isInvulnerable && onInvulnerabilityTimeUpdate) {
      // Actualizar tiempo restante en tiempo real
      const currentTime = gameTimeManager.getGameTime()
      const timeLeft = Math.max(0, invulnerabilityEndTime - currentTime)
      onInvulnerabilityTimeUpdate(timeLeft)
    }

    // Lighting follows player smoothly
    if (spotLightRef.current) {
      spotLightRef.current.position.set(newX, 5, newZ - 5)
      spotLightRef.current.target.position.set(newX, 0, newZ + 10)
      spotLightRef.current.target.updateMatrixWorld()
    }

    // Obstacle spawning using game time (frame-independent)
    if (gameTimeManager.hasTimeElapsed(lastObstacleSpawn, GAME_CONFIG.obstacles.spawnInterval)) {
      spawnObstacle(newZ)
      setLastObstacleSpawn(gameTimeManager.getGameTime())
    }

    // Wall image spawning using game time (frame-independent)
    if (gameTimeManager.hasTimeElapsed(lastWallImageSpawn, 3.5)) {
      spawnWallImage(newZ)
      setLastWallImageSpawn(gameTimeManager.getGameTime())
    }

    // Cleanup old objects
    setObstacles((prev) => prev.filter((obstacle) => obstacle.z > newZ - 20))
    setMates((prev) => prev.filter((mate) => mate.z > newZ - 20))
    setUsbs((prev) => prev.filter((usb) => usb.z > newZ - 20))
    setWallImages((prev) => prev.filter((image) => image.z > newZ - 20))

    // Collision detection (skip during freeze recovery to prevent false positives)
    if (!isRecoveringFromFreeze && checkCollisions(newX, currentY, newZ)) {
      onGameOver()
      return
    }

    // Camera following
    camera.position.x = newX
    camera.position.y = 5
    camera.position.z = newZ - 10
    camera.lookAt(newX, 0, newZ + 10)

    // Player rotation using processed delta for consistency
    //meshRef.current.rotation.y += processedDelta * 2 * 60 // Normalize to 60fps equivalent
  })

  // Reset game time when component unmounts or game restarts
  useEffect(() => {
    return () => {
      gameTimeManager.reset()
    }
  }, [])

  // Reset game time when game restarts (when isGameOver changes from true to false)
  useEffect(() => {
    if (!isGameOver && positionZ === 0) {
      gameTimeManager.reset()
    }
  }, [isGameOver, positionZ])

  return (
    <>
      {/* Player Character Model */}
      <CharacterModel 
        ref={meshRef}
        position={[0, 0, 0]}
        isInvulnerable={isInvulnerable}
        hasShield={hasShield}
      />

      {/* Spotlight */}
      <spotLight
        ref={spotLightRef}
        position={[0, 5, 0]}
        angle={-Math.PI / 3}
        penumbra={0.25}
        intensity={45}
        distance={90}
        color="#ffffff"
        castShadow
      />

      {/* Invulnerability visual effects disabled */}

      {/* Terrain */}
      <Terrain ref={terrainRef} terrainSegments={terrainSegments} tunnelLights={tunnelLights} wallImages={wallImages} playerZ={positionZ} />

      {/* Obstacles and Mates */}
      <Obstacles obstacles={obstacles} mates={mates} usbs={usbs} onCollectMate={collectMate} onCollectUsb={collectUsb} />
    </>
  )
}


