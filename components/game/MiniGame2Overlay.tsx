"use client"

import { useState, useEffect, useCallback } from "react"
import { useHandControlContext } from "../vision/HandControlContext"

interface MiniGame2OverlayProps {
  isVisible: boolean
  onComplete: (won: boolean) => void
}

type Operation = '+' | '-' | '*'

export default function MiniGame2Overlay({ isVisible, onComplete }: MiniGame2OverlayProps) {
  const [gameState, setGameState] = useState<'preparing' | 'playing' | 'completed'>('preparing')
  const [timeLeft, setTimeLeft] = useState(1) // 1 segundo de preparación
  const [gameTimeLeft, setGameTimeLeft] = useState(8) // 8 segundos para jugar
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [operation, setOperation] = useState<Operation>('+')
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [options, setOptions] = useState<number[]>([])
  const [currentLaneIndex, setCurrentLaneIndex] = useState<number | null>(null)
  const [hasSelected, setHasSelected] = useState(false)
  
  const { lane, isClosed } = useHandControlContext()
  
  // Generar nueva pregunta aritmética
  const generateNewQuestion = useCallback(() => {
    const operations: Operation[] = ['+', '-', '*']
    const randomOp = operations[Math.floor(Math.random() * operations.length)]
    
    let n1 = Math.floor(Math.random() * 9) + 1 // 1-9
    let n2 = Math.floor(Math.random() * 9) + 1 // 1-9
    
    // Para resta, asegurar que el resultado sea positivo
    if (randomOp === '-' && n1 < n2) {
      [n1, n2] = [n2, n1]
    }
    
    setNum1(n1)
    setNum2(n2)
    setOperation(randomOp)
    
    let answer = 0
    switch (randomOp) {
      case '+':
        answer = n1 + n2
        break
      case '-':
        answer = n1 - n2
        break
      case '*':
        answer = n1 * n2
        break
    }
    
    setCorrectAnswer(answer)
    
    // Generar opciones incorrectas
    const incorrectOptions: number[] = []
    const possibleWrong = [answer - 2, answer - 1, answer + 1, answer + 2, answer + 3, answer - 3]
    
    while (incorrectOptions.length < 2) {
      const wrongAnswer = possibleWrong[Math.floor(Math.random() * possibleWrong.length)]
      if (wrongAnswer !== answer && wrongAnswer >= 0 && !incorrectOptions.includes(wrongAnswer)) {
        incorrectOptions.push(wrongAnswer)
      }
    }
    
    // Mezclar opciones (solo 3 opciones)
    const allOptions = [answer, ...incorrectOptions].sort(() => Math.random() - 0.5)
    setOptions(allOptions)
    setCurrentLaneIndex(null)
    setHasSelected(false)
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

  // Detectar posición de mano (para mostrar indicador visual)
  useEffect(() => {
    if (!isVisible || gameState !== 'playing' || !lane || hasSelected) return
    
    // Mapear lane a índice de opción
    const laneToIndex: Record<string, number> = {
      'left': 0,
      'center': 1,
      'right': 2
    }
    
    const optionIndex = laneToIndex[lane]
    
    if (optionIndex !== undefined) {
      setCurrentLaneIndex(optionIndex)
    }
  }, [lane, isVisible, gameState, hasSelected])

  // Detectar mano cerrada para confirmar selección
  useEffect(() => {
    if (!isVisible || gameState !== 'playing' || hasSelected || currentLaneIndex === null) return
    
    if (isClosed) {
      setHasSelected(true)
      
      // Verificar si la respuesta es correcta
      const selectedAnswer = options[currentLaneIndex]
      const isCorrect = selectedAnswer === correctAnswer
      
      // Completar inmediatamente sin delay
      setGameState('completed')
      onComplete(isCorrect)
    }
  }, [isClosed, options, correctAnswer, isVisible, gameState, hasSelected, currentLaneIndex, onComplete])

  // Reset cuando se oculta
  useEffect(() => {
    if (!isVisible) {
      setGameState('preparing')
      setTimeLeft(1)
      setGameTimeLeft(8)
      setCurrentLaneIndex(null)
      setHasSelected(false)
    }
  }, [isVisible])

  if (!isVisible) return null

  const getOperationSymbol = (op: Operation) => {
    switch (op) {
      case '+': return '+'
      case '-': return '−'
      case '*': return '×'
    }
  }

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-30">
      <div className="bg-black p-8 rounded-lg text-center max-w-4xl border-4 border-purple-400 text-white">
        
        {gameState === 'preparing' && (
          <>
            <h2 className="text-4xl arcade-title mb-6 text-purple-400">CÁLCULO RÁPIDO!</h2>
            <p className="text-lg arcade-text mb-6 text-purple-200">
              ¡Resuelve el cálculo antes de que se acabe el tiempo!
            </p>
            
            <div className="text-6xl arcade-font text-yellow-400 mb-4">
              {timeLeft > 0 ? timeLeft : "¡COMENZAR!"}
            </div>
            
            <div className="text-lg arcade-text text-purple-200">
              Prepárate para calcular...
            </div>
          </>
        )}
        
        {gameState === 'playing' && (
          <>
            <h2 className="text-3xl arcade-title mb-4 text-purple-400">¿CUÁNTO ES?</h2>
            
            {/* Operación matemática */}
            <div className="bg-gray-900 rounded-lg p-12 mb-8 border-2 border-purple-500">
              <div className="text-7xl arcade-font text-yellow-400 mb-4">
                {num1} {getOperationSymbol(operation)} {num2} = ?
              </div>
            </div>

            {/* Opciones (3 opciones para mapear con left, center, right) */}
            <div className="flex justify-center gap-8 mb-6">
              {options.map((option, index) => {
                const isCorrect = option === correctAnswer
                const isHovered = currentLaneIndex === index && !hasSelected
                const isSelected = hasSelected && currentLaneIndex === index
                
                return (
                  <div 
                    key={index}
                    className={`w-32 h-32 rounded-lg flex items-center justify-center text-4xl arcade-font border-4 transition-all ${
                      isSelected
                        ? isCorrect
                          ? 'bg-green-600 border-green-400 text-white shadow-lg shadow-green-400/50 scale-110'
                          : 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-400/50 scale-110'
                        : isHovered
                        ? 'bg-purple-600 border-purple-300 text-white scale-105 shadow-lg shadow-purple-400/50'
                        : 'bg-gray-800 border-purple-400 text-white'
                    }`}
                  >
                    {option}
                    {isHovered && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="text-xs text-yellow-400 animate-pulse">✋</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Indicadores de posición de mano */}
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-sm arcade-text text-purple-200">← IZQUIERDA</div>
              <div className="text-sm arcade-text text-purple-200">CENTRO</div>
              <div className="text-sm arcade-text text-purple-200">DERECHA →</div>
            </div>

            {/* Info del juego */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg arcade-font text-yellow-400">
                TIEMPO: {gameTimeLeft}s
              </div>
              <div className="text-sm arcade-text text-purple-200">
                {hasSelected 
                  ? '✊ ¡SELECCIONADO!' 
                  : isClosed 
                  ? '✊ MANO CERRADA' 
                  : lane 
                  ? `📍 ${lane.toUpperCase()}` 
                  : '✋ Mueve tu mano'}
              </div>
            </div>
            
            {/* Barra de tiempo */}
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-yellow-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${(gameTimeLeft / 8) * 100}%` }}
              />
            </div>
            
            <div className="mt-4 text-sm arcade-text text-purple-200 animate-pulse">
              {hasSelected 
                ? 'Verificando respuesta...' 
                : 'Mueve tu mano y ciérrala para seleccionar'}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
