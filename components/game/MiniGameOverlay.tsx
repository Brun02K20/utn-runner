"use client"

import { useState, useEffect, useCallback } from "react"
import { useHandControlContext } from "../vision/HandControlContext"

interface MiniGameOverlayProps {
  isVisible: boolean
  onComplete: (won: boolean) => void
}

export default function MiniGameOverlay({ isVisible, onComplete }: MiniGameOverlayProps) {
  const [gameState, setGameState] = useState<'preparing' | 'playing' | 'completed'>('preparing')
  const [timeLeft, setTimeLeft] = useState(1) // 1 segundo de preparación
  const [ballPosition, setBallPosition] = useState(0) // 0 = A, 1 = B, 2 = C, 3 = D
  const [correctAnswer, setCorrectAnswer] = useState(0) // Respuesta correcta aleatoria
  const [ballDirection, setBallDirection] = useState(1) // 1 = derecha, -1 = izquierda
  const [gameTimeLeft, setGameTimeLeft] = useState(8) // 8 segundos para jugar
  
  const { isClosed } = useHandControlContext()
  
  const options = ['A', 'B', 'C', 'D']
  
  // Generar respuesta correcta aleatoria
  const generateNewQuestion = useCallback(() => {
    const newAnswer = Math.floor(Math.random() * 4)
    setCorrectAnswer(newAnswer)
    setBallPosition(0)
    setBallDirection(1)
  }, [])
  
  // Fase de preparación (countdown)
  useEffect(() => {
    if (!isVisible) return
    
    if (gameState === 'preparing') {
      if (timeLeft <= 0) {
        setGameState('playing')
        setGameTimeLeft(8)
        generateNewQuestion()
        return
      }
      
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, gameState, timeLeft, generateNewQuestion])
  
  // Movimiento de la bolita
  useEffect(() => {
    if (!isVisible || gameState !== 'playing') return
    
    const interval = setInterval(() => {
      setBallPosition(prev => {
        let newPos = prev + (ballDirection * 0.04) // Velocidad aumentada para más desafío
        
        // Rebotar en los extremos
        if (newPos >= 3) {
          newPos = 3
          setBallDirection(-1)
        } else if (newPos <= 0) {
          newPos = 0
          setBallDirection(1)
        }
        
        return newPos
      })
    }, 30) // 33 FPS para mayor suavidad con velocidad aumentada
    
    return () => clearInterval(interval)
  }, [isVisible, gameState, ballDirection])
  
  // Timer del juego
  useEffect(() => {
    if (!isVisible || gameState !== 'playing') return
    
    if (gameTimeLeft <= 0) {
      setGameState('completed')
      onComplete(false) // Perdió por tiempo
      return
    }
    
    const timer = setTimeout(() => {
      setGameTimeLeft(prev => prev - 1)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [isVisible, gameState, gameTimeLeft, onComplete])

  // Detectar mano cerrada
  useEffect(() => {
    if (!isVisible || gameState !== 'playing') return
    
    if (isClosed) {
      // Determinar sobre qué opción está la bolita
      const currentOption = Math.round(ballPosition)
      
      setGameState('completed')
      
      if (currentOption === correctAnswer) {
        onComplete(true) // Ganó!
      } else {
        onComplete(false) // Perdió!
      }
    }
  }, [isClosed, ballPosition, correctAnswer, isVisible, gameState, onComplete])

  // Reset cuando se oculta
  useEffect(() => {
    if (!isVisible) {
      setGameState('preparing')
      setTimeLeft(1)
      setGameTimeLeft(8)
      setBallPosition(0)
      setBallDirection(1)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-30">
      <div className="bg-black p-8 rounded-lg text-center max-w-4xl border-4 border-blue-400 text-white">
        
        {gameState === 'preparing' && (
          <>
            <h2 className="text-4xl arcade-title mb-6 text-blue-400">SISTEMA COMPROMETIDO!</h2>
            <p className="text-lg arcade-text mb-6 text-blue-200">
              ¡La computadora está infectada! Necesitas reparar el sistema...
            </p>
            
            <div className="text-6xl arcade-font text-yellow-400 mb-4">
              {timeLeft > 0 ? timeLeft : "¡COMENZAR!"}
            </div>
            
            <div className="text-lg arcade-text text-blue-200">
              Prepárate para el desafío...
            </div>
          </>
        )}
        
        {gameState === 'playing' && (
          <>
            <h2 className="text-3xl arcade-title mb-4 text-blue-400">SELECCIONA LA RESPUESTA CORRECTA</h2>
            <p className="text-sm arcade-text mb-6 text-blue-200">
              Cierra la mano cuando la bolita esté sobre la respuesta VERDE
            </p>
            
            {/* Área del juego */}
            <div className="relative bg-gray-900 rounded-lg p-8 mb-6 border-2 border-blue-500">
              
              {/* Opciones A, B, C, D */}
              <div className="flex justify-between items-center mb-8 relative">
                {options.map((option, index) => (
                  <div 
                    key={option}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl arcade-font border-4 relative ${
                      index === correctAnswer 
                        ? 'bg-green-600 border-green-400 text-white shadow-lg shadow-green-400/50' 
                        : 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-400/50'
                    }`}
                  >
                    {option}
                    
                    {/* Indicador cuando la bolita está encima */}
                    {Math.round(ballPosition) === index && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-2 h-8 bg-yellow-400 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Bolita móvil */}
              <div className="relative h-16 mb-4 flex items-center">
                <div 
                  className="absolute w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-2xl border-4 border-yellow-200 transition-all duration-75 ease-linear"
                  style={{
                    left: `${(ballPosition / 3) * 100}%`,
                    transform: 'translateX(-50%)',
                    boxShadow: '0 0 20px rgba(255, 255, 0, 0.6), 0 0 40px rgba(255, 255, 0, 0.3)'
                  }}
                >
                  {/* Efecto brillante interior */}
                  <div className="absolute inset-2 bg-yellow-100 rounded-full opacity-60" />
                </div>
              </div>
              
              {/* Línea guía */}
              <div className="w-full h-1 bg-gray-600 rounded-full" />
            </div>

            {/* Info del juego */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg arcade-font text-yellow-400">
                TIEMPO: {gameTimeLeft}s
              </div>
              <div className="text-sm arcade-text text-blue-200">
                {isClosed ? '✊ MANO CERRADA' : '✋ MANO ABIERTA'}
              </div>
            </div>
            
            {/* Barra de tiempo */}
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-yellow-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${(gameTimeLeft / 8) * 100}%` }}
              />
            </div>
            
            <div className="mt-4 text-sm arcade-text text-blue-200 animate-pulse">
              Cierra la mano cuando la bolita esté sobre la opción VERDE
            </div>
          </>
        )}
      </div>
    </div>
  )
}