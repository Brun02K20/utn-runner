"use client"

import { Canvas } from "@react-three/fiber"
import Player from "./Player"
import UIOverlay from "./UIOverlay"
import { Suspense, useState, useEffect } from "react"
import { GAME_CONFIG, updateGameDifficulty } from "./config"
import HandCameraImpl from "../vision/HandCameraImpl"
import { gameTimeManager } from "./GameTimeManager"
import { GameTimeDebug } from "./GameTimeDebug"

export default function GameScene() {
  const [isGameOver, setIsGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [finalScore, setFinalScore] = useState(0)

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
    setFinalScore(score)
    setIsGameOver(true)
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
    // Sync pause state with game time manager
    gameTimeManager.setPaused(isPaused || isGameOver)
    
    // Update difficulty based on score
    if (!isGameOver && !isPaused) {
      updateGameDifficulty(score)
    }
  }, [score, isGameOver, isPaused])

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 5, -10], fov: 75 }} className="w-full h-full" shadows>
        <Suspense fallback={null}>
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
          <Player onGameOver={handleGameOver} isGameOver={isGameOver} isPaused={isPaused} onScoreUpdate={setScore} />
        </Suspense>
      </Canvas>

      <UIOverlay
        score={score}
        isGameOver={isGameOver}
        isPaused={isPaused}
        finalScore={finalScore}
        onRestart={handleRestart}
      />

      {/* Debug panel - set visible={true} to enable */}
      <GameTimeDebug visible={false} />
      {/* Área de la cámara - ocupa 1/3 de la pantalla */}
      <div className="h-1/3 p-4 bg-gray-800">
        <div className="w-full h-full rounded-lg overflow-hidden">
          <HandCameraImpl 
            onHandDetected={(data) => {
              //console.log('Detección de mano:', data);
            }}
            width={640}
            height={240}
          />
        </div>
      </div>
    </div>
    
  )
}
