"use client"

import { useState, useEffect, useRef } from "react"
import { useHandControlContext } from "../vision/HandControlContext"

interface MiniGame4OverlayProps {
  isVisible: boolean
  onComplete: (won: boolean) => void
}

export default function MiniGame4Overlay({ isVisible, onComplete }: MiniGame4OverlayProps) {
  const [gameState, setGameState] = useState<'preparing' | 'playing' | 'completed'>('preparing')
  const [timeLeft, setTimeLeft] = useState(1) // 1 segundo de preparación
  const [currentTime, setCurrentTime] = useState("23:59:56") // Timer visual
  const [milliseconds, setMilliseconds] = useState(0) // Milisegundos para el timer
  const [uploadProgress, setUploadProgress] = useState(0) // Progreso de subida (0-100)
  const [clickCount, setClickCount] = useState(0) // Cantidad de veces que cerró la mano
  const [gameWon, setGameWon] = useState(false)
  
  const { isClosed } = useHandControlContext()
  const wasClosedRef = useRef(false)
  
  // Fase de preparación (countdown)
  useEffect(() => {
    if (!isVisible) return
    
    if (gameState === 'preparing') {
      if (timeLeft <= 0) {
        setGameState('playing')
        setCurrentTime("23:59:56")
        setMilliseconds(0)
        setUploadProgress(0)
        setClickCount(0)
        return
      }
      
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, gameState, timeLeft])
  
  // Timer del juego (actualizar cada 10ms para mayor precisión)
  useEffect(() => {
    if (!isVisible || gameState !== 'playing') return
    
    const interval = setInterval(() => {
      setMilliseconds(prev => {
        const newMs = prev + 10
        
        // Calcular tiempo restante (4000ms = 4 segundos)
        const remaining = 4000 - newMs
        
        if (remaining <= 0) {
          setGameState('completed')
          if (uploadProgress >= 100) {
            setGameWon(true)
          }
          return 4000
        }
        
        // Convertir a formato HH:MM:SS (de 23:59:56 a 00:00:00)
        const totalSeconds = 56 + Math.floor((4000 - remaining) / 1000)
        
        if (totalSeconds >= 60) {
          // Pasó medianoche
          setCurrentTime(`00:00:00`)
        } else {
          setCurrentTime(`23:59:${totalSeconds.toString().padStart(2, '0')}`)
        }
        
        return newMs
      })
    }, 10)
    
    return () => clearInterval(interval)
  }, [isVisible, gameState, uploadProgress])

  // Detectar apertura y cierre de mano
  useEffect(() => {
    if (!isVisible || gameState !== 'playing') return
    
    // Detectar transición de abierto a cerrado
    if (isClosed && !wasClosedRef.current) {
      // Mano recién cerrada
      wasClosedRef.current = true
      
      if (clickCount < 5) {
        setClickCount(prev => prev + 1)
        setUploadProgress(prev => Math.min(100, prev + 20))
        
        // Si llegó a 5 clics, ganó
        if (clickCount + 1 >= 5) {
          setGameState('completed')
          setGameWon(true)
        }
      }
    } else if (!isClosed && wasClosedRef.current) {
      // Mano abierta nuevamente
      wasClosedRef.current = false
    }
  }, [isClosed, gameState, isVisible, clickCount])

  // Notificar resultado cuando el juego termina
  useEffect(() => {
    if (gameState === 'completed' && isVisible) {
      const timer = setTimeout(() => {
        onComplete(gameWon)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [gameState, gameWon, isVisible, onComplete])

  // Reset cuando se oculta
  useEffect(() => {
    if (!isVisible) {
      setGameState('preparing')
      setTimeLeft(1)
      setCurrentTime("23:59:56")
      setMilliseconds(0)
      setUploadProgress(0)
      setClickCount(0)
      setGameWon(false)
      wasClosedRef.current = false
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-30">
      <div className="bg-black p-8 rounded-lg text-center max-w-4xl border-4 border-red-400 text-white">
        
        {gameState === 'preparing' && (
          <>
            <h2 className="text-4xl arcade-title mb-6 text-red-400">¡ENTREGÁ EL TP!</h2>
            <p className="text-lg arcade-text mb-6 text-red-200">
              ¡Son las 23:59! ¡Tenés que subir el TP antes de la medianoche!
            </p>
            
            <div className="text-6xl arcade-font text-yellow-400 mb-4">
              {timeLeft > 0 ? timeLeft : "¡COMENZAR!"}
            </div>
            
            <div className="text-lg arcade-text text-red-200">
              Prepárate para hacer clic...
            </div>
          </>
        )}
        
        {gameState === 'playing' && (
          <>
            <h2 className="text-3xl arcade-title mb-4 text-red-400">¡SUBÍ EL ARCHIVO!</h2>
            
            {/* Reloj de urgencia */}
            <div className="bg-red-900 border-4 border-red-500 rounded-lg p-4 mb-6 animate-pulse">
              <div className="text-5xl arcade-font text-red-200">
                {currentTime}
              </div>
              <div className="text-sm text-red-300 mt-2">
                ¡QUEDAN {Math.max(0, Math.ceil((4000 - milliseconds) / 1000))} SEGUNDOS!
              </div>
            </div>

            {/* Monitor de computadora con archivo subiendo */}
            <div className="relative bg-gray-900 rounded-lg p-8 mb-6 border-4 border-red-500">
              {/* Pantalla del monitor */}
              <div className="bg-gradient-to-b from-amber-50 to-yellow-50 rounded-lg p-6 border-4 border-black relative overflow-hidden">
                {/* Texto MOODLE */}
                <div className="text-blue-600 text-2xl font-bold mb-4 arcade-title">MOODLE</div>
                
                {/* Icono de archivo PDF */}
                <div className="mb-4 flex justify-center">
                  <div className="w-24 h-32 bg-red-600 rounded-lg shadow-lg flex items-center justify-center relative">
                    <div className="text-white text-4xl font-bold">PDF</div>
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-red-700 transform rotate-45" />
                  </div>
                </div>
                
                <div className="text-gray-800 text-lg mb-4 arcade-text">TP_Final.pdf</div>
                
                {/* Barra de progreso */}
                <div className="w-full bg-gray-700 rounded-full h-8 mb-4 overflow-hidden border-2 border-gray-600">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300 flex items-center justify-center"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    {uploadProgress > 0 && (
                      <span className="text-white text-sm font-bold">{uploadProgress}%</span>
                    )}
                  </div>
                </div>
                
                {/* Texto de estado */}
                <div className="text-gray-700 text-sm arcade-text">
                  {uploadProgress < 100 
                    ? `Subiendo... ${clickCount}/5 clics` 
                    : '¡Subida completa!'}
                </div>
                
                {/* Efecto de "loading" */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 border-4 border-gray-800 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Base del monitor */}
              <div className="w-32 h-4 bg-gray-800 mx-auto mt-2 rounded-b-lg" />
              <div className="w-48 h-2 bg-gray-700 mx-auto rounded-full" />
            </div>

            {/* Instrucciones */}
            <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-4 mb-4">
              <div className="text-lg arcade-font text-yellow-400 mb-2">
                {isClosed ? '✊ CLIC!' : '✋ ABRÍ LA MANO'}
              </div>
              <div className="text-sm text-red-200">
                Abrí y cerrá la mano 5 veces para subir el archivo
              </div>
            </div>
            
            {/* Indicador de progreso */}
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                    index < clickCount
                      ? 'bg-green-500 border-green-400 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
