"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useHandControlContext } from "../vision/HandControlContext"

interface MiniGame3OverlayProps {
  isVisible: boolean
  onComplete: (won: boolean) => void
}

interface FallingRect {
  id: number
  x: number
  y: number
  speed: number
  width: number
  height: number
}

export default function MiniGame3Overlay({ isVisible, onComplete }: MiniGame3OverlayProps) {
  const [gameState, setGameState] = useState<'preparing' | 'playing' | 'completed'>('preparing')
  const [timeLeft, setTimeLeft] = useState(1) // 1 segundo de preparación
  const [gameTimeLeft, setGameTimeLeft] = useState(8) // 8 segundos para jugar
  const [playerX, setPlayerX] = useState(50) // Posición X del jugador (%)
  const [fallingRects, setFallingRects] = useState<FallingRect[]>([])
  const [hasCollided, setHasCollided] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  
  const rectIdCounter = useRef(0)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  
  const { lane } = useHandControlContext()
  
  // Constantes del juego
  const PLAYER_SIZE = 40 // Tamaño del stickman
  const GAME_WIDTH = 600
  const GAME_HEIGHT = 400
  
  // Mapear lane a posición X (invertido porque la cámara es como un espejo)
  const laneToPosition: Record<string, number> = {
    'left': 80,
    'center': 50,
    'right': 20
  }
  
  // Fase de preparación (countdown)
  useEffect(() => {
    if (!isVisible) return
    
    if (gameState === 'preparing') {
      if (timeLeft <= 0) {
        setGameState('playing')
        setGameTimeLeft(8)
        setFallingRects([])
        setHasCollided(false)
        setGameWon(false)
        setPlayerX(50) // Centro
        return
      }
      
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, gameState, timeLeft])
  
  // Timer del juego
  useEffect(() => {
    if (!isVisible || gameState !== 'playing') return
    
    if (gameTimeLeft <= 0) {
      setGameState('completed')
      if (!hasCollided) {
        setGameWon(true) // ¡Ganó! Sobrevivió los 8 segundos
      }
      return
    }
    
    const timer = setTimeout(() => {
      setGameTimeLeft(prev => prev - 1)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [isVisible, gameState, gameTimeLeft, hasCollided])

  // Notificar resultado cuando el juego termina
  useEffect(() => {
    if (gameState === 'completed' && isVisible) {
      // Usar setTimeout para evitar actualizar durante el render
      const timer = setTimeout(() => {
        if (gameWon) {
          onComplete(true)
        } else if (hasCollided) {
          onComplete(false)
        }
      }, 0)
      
      return () => clearTimeout(timer)
    }
  }, [gameState, gameWon, hasCollided, isVisible, onComplete])

  // Controlar posición del jugador con la mano
  useEffect(() => {
    if (!isVisible || gameState !== 'playing' || !lane) return
    
    const targetPosition = laneToPosition[lane]
    if (targetPosition !== undefined) {
      setPlayerX(targetPosition)
    }
  }, [lane, isVisible, gameState])

  // Generar rectángulos que caen
  useEffect(() => {
    if (!isVisible || gameState !== 'playing') return
    
    const spawnInterval = setInterval(() => {
      // Spawn en posiciones aleatorias (izquierda, centro o derecha)
      const positions = [20, 50, 80]
      const randomPos = positions[Math.floor(Math.random() * positions.length)]
      
      const newRect: FallingRect = {
        id: rectIdCounter.current++,
        x: randomPos,
        y: -10,
        speed: 0.75 + Math.random() * 0.75, // Velocidad aumentada 50%: entre 0.75 y 1.5
        width: 60,
        height: 80
      }
      
      setFallingRects(prev => [...prev, newRect])
    }, 2400) // Spawn cada 2.4 segundos (70% menos frecuente que 800ms)
    
    return () => clearInterval(spawnInterval)
  }, [isVisible, gameState])

  // Actualizar posición de rectángulos y detectar colisiones
  useEffect(() => {
    if (!isVisible || gameState !== 'playing' || hasCollided) return
    
    const updateInterval = setInterval(() => {
      setFallingRects(prev => {
        const updated = prev.map(rect => ({
          ...rect,
          y: rect.y + rect.speed
        }))
        
        // Detectar colisiones
        const playerLeft = (playerX / 100) * GAME_WIDTH - PLAYER_SIZE / 2
        const playerRight = (playerX / 100) * GAME_WIDTH + PLAYER_SIZE / 2
        const playerTop = GAME_HEIGHT - PLAYER_SIZE - 20
        const playerBottom = GAME_HEIGHT - 20
        
        for (const rect of updated) {
          const rectLeft = (rect.x / 100) * GAME_WIDTH - rect.width / 2
          const rectRight = (rect.x / 100) * GAME_WIDTH + rect.width / 2
          const rectTop = (rect.y / 100) * GAME_HEIGHT
          const rectBottom = (rect.y / 100) * GAME_HEIGHT + rect.height
          
          // Detección de colisión AABB
          if (
            playerLeft < rectRight &&
            playerRight > rectLeft &&
            playerTop < rectBottom &&
            playerBottom > rectTop
          ) {
            setHasCollided(true)
            setGameState('completed')
            break
          }
        }
        
        // Remover rectángulos que salieron de la pantalla
        return updated.filter(rect => rect.y < 110)
      })
    }, 1000 / 60) // 60 FPS
    
      return () => clearInterval(updateInterval)
  }, [isVisible, gameState, playerX, hasCollided])  // Reset cuando se oculta
  useEffect(() => {
    if (!isVisible) {
      setGameState('preparing')
      setTimeLeft(1)
      setGameTimeLeft(8)
      setPlayerX(50)
      setFallingRects([])
      setHasCollided(false)
      setGameWon(false)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-30">
      <div className="bg-black p-8 rounded-lg text-center max-w-4xl border-4 border-orange-400 text-white">
        
        {gameState === 'preparing' && (
          <>
            <h2 className="text-4xl arcade-title mb-6 text-orange-400">¡ESQUIVA EL PARCIAL!</h2>
            <p className="text-lg arcade-text mb-6 text-orange-200">
              ¡Los parciales están cayendo del cielo! ¡Esquívalos!
            </p>
            
            <div className="text-6xl arcade-font text-yellow-400 mb-4">
              {timeLeft > 0 ? timeLeft : "¡COMENZAR!"}
            </div>
            
            <div className="text-lg arcade-text text-orange-200">
              Prepárate para esquivar...
            </div>
          </>
        )}
        
        {gameState === 'playing' && (
          <>
            <h2 className="text-3xl arcade-title mb-4 text-orange-400">¡ESQUÍVALOS!</h2>
            
            {/* Área del juego */}
            <div 
              ref={gameAreaRef}
              className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg mb-6 border-2 border-orange-500 overflow-hidden"
              style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px`, margin: '0 auto' }}
            >
              {/* Rectángulos cayendo (parciales) */}
              {fallingRects.map(rect => (
                <div
                  key={rect.id}
                  className="absolute bg-white border-2 border-gray-300 flex items-center justify-center"
                  style={{
                    left: `calc(${rect.x}% - ${rect.width / 2}px)`,
                    top: `${rect.y}%`,
                    width: `${rect.width}px`,
                    height: `${rect.height}px`,
                    transition: 'none'
                  }}
                >
                  <div className="text-black text-xs font-bold transform -rotate-12">
                    PARCIAL
                  </div>
                </div>
              ))}
              
              {/* Stickman (jugador) */}
              <div
                className="absolute transition-all duration-150"
                style={{
                  left: `calc(${playerX}% - ${PLAYER_SIZE / 2}px)`,
                  bottom: '20px',
                  width: `${PLAYER_SIZE}px`,
                  height: `${PLAYER_SIZE}px`
                }}
              >
                {/* Dibujo simple de stickman */}
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  {/* Cabeza */}
                  <circle cx="20" cy="8" r="6" fill="none" stroke="white" strokeWidth="2" />
                  {/* Cuerpo */}
                  <line x1="20" y1="14" x2="20" y2="26" stroke="white" strokeWidth="2" />
                  {/* Brazos */}
                  <line x1="20" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2" />
                  <line x1="20" y1="18" x2="28" y2="22" stroke="white" strokeWidth="2" />
                  {/* Piernas */}
                  <line x1="20" y1="26" x2="14" y2="36" stroke="white" strokeWidth="2" />
                  <line x1="20" y1="26" x2="26" y2="36" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              
              {/* Indicadores de carriles */}
              <div className="absolute bottom-0 left-0 right-0 h-4 flex justify-around items-center opacity-30">
                <div className="w-1 h-full bg-white" />
                <div className="w-1 h-full bg-white" />
                <div className="w-1 h-full bg-white" />
              </div>
            </div>

            {/* Info del juego */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg arcade-font text-yellow-400">
                TIEMPO: {gameTimeLeft}s
              </div>
              <div className="text-sm arcade-text text-orange-200">
                {lane ? `📍 ${lane.toUpperCase()}` : '✋ Mueve tu mano'}
              </div>
            </div>
            
            {/* Barra de tiempo */}
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-yellow-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${(gameTimeLeft / 8) * 100}%` }}
              />
            </div>
            
            <div className="mt-4 text-sm arcade-text text-orange-200 animate-pulse">
              Mueve tu mano para esquivar los parciales
            </div>
          </>
        )}
      </div>
    </div>
  )
}
