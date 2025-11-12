"use client"

import { useState, useEffect } from "react"
import { useHandControlContext } from "../vision/HandControlContext"

interface MiniGameOverlayProps {
  isVisible: boolean
  onComplete: (won: boolean) => void
}

export default function MiniGameOverlay({ isVisible, onComplete }: MiniGameOverlayProps) {
  const [gameState, setGameState] = useState<'waiting' | 'completed'>('waiting')
  const [timeLeft, setTimeLeft] = useState(10) // 10 segundos para completar
  const { lane: handLane, jump: handJump } = useHandControlContext()
  
  // Timer countdown
  useEffect(() => {
    if (!isVisible || gameState === 'completed') return
    
    if (timeLeft <= 0) {
      setGameState('completed')
      onComplete(false) // Perdió por tiempo
      return
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [isVisible, timeLeft, gameState, onComplete])

  // Detectar combinación ganadora: mano derecha + salto = ganar
  useEffect(() => {
    if (!isVisible || gameState === 'completed') return
    
    if (handJump && handLane === 'right') {
      setGameState('completed')
      onComplete(true) // Ganó!
    } else if (handJump && handLane === 'left') {
      setGameState('completed')  
      onComplete(false) // Perdió!
    }
  }, [handJump, handLane, isVisible, gameState, onComplete])

  // Reset cuando se oculta
  useEffect(() => {
    if (!isVisible) {
      setGameState('waiting')
      setTimeLeft(10)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
      <div className="bg-black p-8 rounded-lg text-center max-w-lg border-4 border-blue-400 text-white">
        <h2 className="text-3xl arcade-title mb-4 text-blue-400">SISTEMA COMPROMETIDO!</h2>
        <p className="text-sm arcade-text mb-4 text-blue-200">
          La computadora vieja ha infectado tu sistema!
        </p>
        
        <div className="bg-blue-900/50 p-4 rounded-lg mb-6 border border-blue-400">
          <h3 className="text-lg arcade-font mb-3 text-yellow-400">EMERGENCY PROTOCOL</h3>
          <div className="space-y-2 text-sm arcade-text text-left">
            <div className="flex items-center justify-between">
              <span>🖐️ Mano IZQUIERDA + Salto:</span>
              <span className="text-red-400">FORMATEAR SISTEMA ❌</span>
            </div>
            <div className="flex items-center justify-between">
              <span>🖐️ Mano DERECHA + Salto:</span>
              <span className="text-green-400">REPARAR SISTEMA ✅</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-2xl arcade-font text-yellow-400 mb-2">
            TIEMPO: {timeLeft}s
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 text-xs arcade-text opacity-75">
          <p>Estado de mano: {handLane ? handLane.toUpperCase() : 'NO DETECTADA'}</p>
          <p>Posición para ganar: MANO DERECHA + SALTO</p>
        </div>

        {gameState === 'waiting' && (
          <div className="mt-4 text-sm arcade-text text-blue-200 animate-pulse">
            Usa tus manos para hacer la selección...
          </div>
        )}
      </div>
    </div>
  )
}