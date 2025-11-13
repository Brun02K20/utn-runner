"use client"

import { useState, useEffect, useRef } from "react"
import { useHandControlContext } from "@/components/vision/HandControlContext"

interface MiniGame5OverlayProps {
  onComplete: (success: boolean) => void
}

export default function MiniGame5Overlay({ onComplete }: MiniGame5OverlayProps) {
  const { isClosed } = useHandControlContext()
  const [grade, setGrade] = useState<number | "N/A" | null>(null)
  const [message, setMessage] = useState("")
  const [isWaitingForGesture, setIsWaitingForGesture] = useState(false)
  const wasClosedRef = useRef(false)

  useEffect(() => {
    // Calcular nota al inicio
    const random = Math.random()
    
    if (random < 0.8) {
      // 80% de probabilidad: N/A
      setGrade("N/A")
      setMessage("NO ESTÁN LAS NOTAS :(")
    } else {
      // 20% de probabilidad: notas del 1 al 10
      const noteValue = Math.floor(Math.random() * 10) + 1
      setGrade(noteValue)
      
      if (noteValue >= 8) {
        setMessage("PROMOCIONASTE")
      } else if (noteValue >= 4) {
        setMessage("Uh, quedaste regular")
      } else {
        setMessage("HABER ESTUDIADO")
      }
    }

    // Esperar 1 segundo antes de permitir continuar
    setTimeout(() => {
      setIsWaitingForGesture(true)
    }, 1000)
  }, [])

  useEffect(() => {
    if (!isWaitingForGesture) return

    // Detectar gesto de cerrar y abrir la mano para continuar
    if (isClosed && !wasClosedRef.current) {
      wasClosedRef.current = true
    } else if (!isClosed && wasClosedRef.current) {
      wasClosedRef.current = false
      // Usuario abrió la mano después de cerrarla
      // Solo da bonus (success=true) si promocionó (nota >= 8)
      const success = typeof grade === "number" && grade >= 8
      onComplete(success)
    }
  }, [isClosed, isWaitingForGesture, grade, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative flex flex-col items-center">
        {/* Monitor con efecto CRT */}
        <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-lg shadow-2xl border-8 border-black">
          {/* Pantalla del monitor */}
          <div className="bg-amber-50 border-4 border-black p-8 rounded shadow-inner min-w-[500px] min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Efecto de escaneo CRT */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-black/5 to-transparent animate-scan" />
            
            {/* Título */}
            <h2 className="text-4xl font-bold mb-8 text-black font-mono tracking-wider">
              YA ESTÁN LAS NOTAS
            </h2>

            {/* Nota */}
            <div className="mb-6">
              <p className="text-2xl text-black font-mono mb-2">TE SACASTE UN:</p>
              <div className="text-6xl font-bold font-mono text-black text-center">
                {grade}
              </div>
            </div>

            {/* Mensaje */}
            <p className={`text-3xl font-bold font-mono text-center ${
              message === "PROMOCIONASTE" 
                ? "text-green-600" 
                : message === "Uh, quedaste regular"
                  ? "text-yellow-600"
                  : message === "HABER ESTUDIADO"
                    ? "text-red-600"
                    : "text-gray-600"
            }`}>
              {message}
            </p>

            {/* Instrucción para continuar */}
            {isWaitingForGesture && (
              <div className="mt-8 text-center">
                <p className="text-lg text-black font-mono animate-pulse">
                  {isClosed ? "Abrí la mano para continuar" : "Cerrá y abrí la mano para continuar"}
                </p>
              </div>
            )}
          </div>

          {/* Base del monitor */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-lg border-4 border-black" />
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-48 h-3 bg-gray-700 rounded-full border-2 border-black" />

          {/* Marca Autogestion 4 */}
          <div className="absolute top-2 right-4 text-white font-bold text-sm font-mono opacity-70">
            Autogestion 4
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
      `}</style>
    </div>
  )
}
