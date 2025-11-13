"use client"

import { Canvas } from "@react-three/fiber"
import Player from "./Player"
import UIOverlay from "./UIOverlay"
import MiniGameOverlay from "./MiniGameOverlay"
import MiniGame2Overlay from "./MiniGame2Overlay"
import MiniGame3Overlay from "./MiniGame3Overlay"
import MiniGame4Overlay from "./MiniGame4Overlay"
import MiniGame5Overlay from "./MiniGame5Overlay"
import { Suspense, useState, useEffect, useRef } from "react"
import { GAME_CONFIG, updateGameDifficulty } from "./config"
import HandCameraImpl from "../vision/HandCameraImpl"
import { gameTimeManager } from "./GameTimeManager"
import { GameTimeDebug } from "./GameTimeDebug"

export default function GameScene() {
  const [isGameOver, setIsGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [isMiniGameActive, setIsMiniGameActive] = useState(false)
  const [isMiniGame2Active, setIsMiniGame2Active] = useState(false)
  const [isMiniGame3Active, setIsMiniGame3Active] = useState(false)
  const [isMiniGame4Active, setIsMiniGame4Active] = useState(false)
  const [isMiniGame5Active, setIsMiniGame5Active] = useState(false)
  const [isInvulnerable, setIsInvulnerable] = useState(false)
  const [invulnerabilityTimeLeft, setInvulnerabilityTimeLeft] = useState(0)
  const miniGameCompleteRef = useRef<((won: boolean) => void) | null>(null)

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isGameOver) {
        setIsPaused((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isGameOver])

  const handleGameOver = () => {
    const porcentajeMinijuego = parseFloat(localStorage.getItem('porcentajeMinijuego') || '0')
    const bonificacion = (porcentajeMinijuego / 100) * score
    setFinalScore(score + bonificacion)
    localStorage.setItem('porcentajeMinijuego', '0')
    setIsGameOver(true)
  }

  const handleMiniGameStart = () => {
    setIsMiniGameActive(true)
  }

  const handleMiniGameEnd = () => {
    setIsMiniGameActive(false)
  }

  const handleMiniGame2Start = () => {
    setIsMiniGame2Active(true)
  }

  const handleMiniGame2End = () => {
    setIsMiniGame2Active(false)
  }

  const handleMiniGame3Start = () => {
    setIsMiniGame3Active(true)
  }

  const handleMiniGame3End = () => {
    setIsMiniGame3Active(false)
  }

  const handleMiniGame4Start = () => {
    setIsMiniGame4Active(true)
  }

  const handleMiniGame4End = () => {
    setIsMiniGame4Active(false)
  }

  const handleMiniGame5Start = () => {
    setIsMiniGame5Active(true)
  }

  const handleMiniGame5End = () => {
    setIsMiniGame5Active(false)
  }

  const handleMiniGameComplete = (won: boolean) => {
    if (miniGameCompleteRef.current) {
      miniGameCompleteRef.current(won)
    }
  }

  const handleMiniGame2Complete = (won: boolean) => {
    handleMiniGame2End() // Terminar el minijuego 2
    
    if (miniGameCompleteRef.current) {
      miniGameCompleteRef.current(won)
    }
  }

  const handleMiniGame3Complete = (won: boolean) => {
    handleMiniGame3End() // Terminar el minijuego 3
    
    if (miniGameCompleteRef.current) {
      miniGameCompleteRef.current(won)
    }
  }

  const handleMiniGame4Complete = (won: boolean) => {
    handleMiniGame4End() // Terminar el minijuego 4
    
    if (miniGameCompleteRef.current) {
      miniGameCompleteRef.current(won)
    }
  }

  const handleMiniGame5Complete = (won: boolean) => {
    handleMiniGame5End() // Terminar el minijuego 5
    
    if (miniGameCompleteRef.current) {
      miniGameCompleteRef.current(won)
    }
  }

  const handleRestart = () => {
    // Reset game time manager
    gameTimeManager.reset()
    
    // Reset game state
    setIsGameOver(false)
    setScore(0)
    setFinalScore(0)
    setIsPaused(false)
    
    // Reset game config to initial values
    GAME_CONFIG.playerSpeed = 0.3
    GAME_CONFIG.jump.duration = 0.9
    GAME_CONFIG.obstacles.spawnInterval = 1.0
    
    // Force reload to ensure clean state
    window.location.reload()
  }

  useEffect(() => {
    // Sync pause state with game time manager - pausar si cualquiera de los minijuegos está activo
    gameTimeManager.setPaused(isPaused || isGameOver || isMiniGameActive || isMiniGame2Active || isMiniGame3Active || isMiniGame4Active || isMiniGame5Active)
    
    // Update difficulty based on score
    if (!isGameOver && !isPaused) {
      updateGameDifficulty(score)
    }
  }, [score, isGameOver, isPaused, isMiniGameActive, isMiniGame2Active, isMiniGame3Active, isMiniGame4Active, isMiniGame5Active])

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 5, -10], fov: 75 }} className="w-full h-full" shadows>
        <Suspense fallback={null}>
          {/* Skybox blanca */}
          <color attach="background" args={['#ffffff']} />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.0}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />

          {/* Player */}
          <Player 
            onGameOver={handleGameOver} 
            isGameOver={isGameOver} 
            isPaused={isPaused} 
            onScoreUpdate={setScore}
            onMiniGameStart={handleMiniGameStart}
            onMiniGameEnd={handleMiniGameEnd}
            onMiniGame2Start={handleMiniGame2Start}
            onMiniGame3Start={handleMiniGame3Start}
            onMiniGame4Start={handleMiniGame4Start}
            onMiniGame5Start={handleMiniGame5Start}
            isMiniGameActive={isMiniGameActive || isMiniGame2Active || isMiniGame3Active || isMiniGame4Active || isMiniGame5Active}
            activeMiniGame={isMiniGameActive ? 1 : isMiniGame2Active ? 2 : isMiniGame3Active ? 3 : isMiniGame4Active ? 4 : isMiniGame5Active ? 5 : null}
            miniGameCompleteRef={miniGameCompleteRef}
            onInvulnerabilityChange={setIsInvulnerable}
            onInvulnerabilityTimeUpdate={setInvulnerabilityTimeLeft}
          />
        </Suspense>
      </Canvas>

      <UIOverlay
        score={score}
        isGameOver={isGameOver}
        isPaused={isPaused}
        finalScore={finalScore}
        onRestart={handleRestart}
        isInvulnerable={isInvulnerable}
        invulnerabilityTimeLeft={invulnerabilityTimeLeft}
      />

      {/* MiniGame Overlay */}
      <MiniGameOverlay
        isVisible={isMiniGameActive}
        onComplete={handleMiniGameComplete}
      />

      {/* MiniGame 2 Overlay */}
      <MiniGame2Overlay
        isVisible={isMiniGame2Active}
        onComplete={handleMiniGame2Complete}
      />

      {/* MiniGame 3 Overlay */}
      <MiniGame3Overlay
        isVisible={isMiniGame3Active}
        onComplete={handleMiniGame3Complete}
      />

      {/* MiniGame 4 Overlay */}
      <MiniGame4Overlay
        isVisible={isMiniGame4Active}
        onComplete={handleMiniGame4Complete}
      />

      {/* MiniGame 5 Overlay */}
      {isMiniGame5Active && (
        <MiniGame5Overlay
          onComplete={handleMiniGame5Complete}
        />
      )}

      {/* Debug panel - set visible={true} to enable */}
      <GameTimeDebug visible={false} />
      
      {/* Área de la cámara - posicionada fija en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 p-4 bg-gray-800 z-10">
        <div className="w-full h-full rounded-lg overflow-hidden">
          <HandCameraImpl 
            onHandDetected={(data) => {
              //console.log('Detección de mano:', data);
            }}
            width={640}
            height={240}
            isPaused={(isPaused || isGameOver) && !isMiniGameActive && !isMiniGame2Active && !isMiniGame3Active && !isMiniGame4Active && !isMiniGame5Active}
          />
        </div>
      </div>
    </div>
    
  )
}
