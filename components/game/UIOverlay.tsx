"use client"

import { GAME_CONFIG } from "./config"
import { useEffect, useRef, useState } from "react"

interface UIOverlayProps {
  score: number
  isGameOver: boolean
  isPaused: boolean
  finalScore: number
  onRestart: () => void
  isInvulnerable?: boolean
  invulnerabilityTimeLeft?: number
  hasShield?: boolean
}

export default function UIOverlay({ score, isGameOver, isPaused, finalScore, onRestart, isInvulnerable, invulnerabilityTimeLeft, hasShield }: UIOverlayProps) {
  const [letters, setLetters] = useState<string[]>(["", "", "", "", ""])
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [randomPhrase, setRandomPhrase] = useState<string>("")
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const gameOverPhrases = [
    "Se te paso el bondi",
    "Se cayo Autogestion 4",
    "Se cayo la UV",
    "Rindio todo el mundo... menos vos",
    "Se corto la luz en mitad del parcial",
    "Encontraste el bug… justo después de entregar",
    "El código funcionaba… hasta que lo ejecutaste",
    "Error 404: motivación no encontrada.",
    "Sin batería. Sin backup. Sin esperanza."
  ]

  useEffect(() => {
    if (isGameOver) {
      // focus first input when game over
      setTimeout(() => inputsRef.current[0]?.focus(), 100)
      // Seleccionar frase aleatoria
      const randomIndex = Math.floor(Math.random() * gameOverPhrases.length)
      setRandomPhrase(gameOverPhrases[randomIndex])
    } else {
      setLetters(["", "", "", "", ""])
      setPosting(false)
      setPosted(false)
      setMessage(null)
      setRandomPhrase("")
    }
  }, [isGameOver])
  const playerToSend = (raw: string) => {
    const trimmed = raw.toUpperCase().replace(/[^A-Z]/g, "")
    const padded = trimmed.padEnd(5, "A").slice(0, 5)
    return padded
  }

  const submitScore = async () => {
    if (posting || posted) return
    setPosting(true)
    setMessage(null)
    const player = playerToSend(letters.join(''))
    const points = Math.floor(finalScore)
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player, points }),
      })
      console.log("Submit response:", res)
      if (!res.ok) throw new Error(`Status ${res.status}`)
      setPosted(true)
      setMessage("Score submitted!")
    } catch (err: any) {
      console.error("Failed to submit score:", err)
      setMessage("Failed to submit score")
    } finally {
      setPosting(false)
    }
  }

  const handleLetterChange = (index: number, value: string) => {
    const letter = value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1)
    setLetters((arr) => {
      const copy = [...arr]
      copy[index] = letter
      return copy
    })
    if (letter) {
      // move focus to next
      const next = inputsRef.current[index + 1]
      if (next) next.focus()
    }
  }

  const handleLetterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const key = e.key
    if (key === 'Backspace') {
      e.preventDefault()
      setLetters((arr) => {
        const copy = [...arr]
        if (copy[index]) {
          // clear current
          copy[index] = ''
        } else if (index > 0) {
          // move back and clear previous
          const prev = inputsRef.current[index - 1]
          if (prev) prev.focus()
          copy[index - 1] = ''
        }
        return copy
      })
    }
  }

  const renderLetterBox = (i: number) => {
    return (
      <div key={i} className="w-12 h-14 flex items-center justify-center mx-1 border-2 border-yellow-400 bg-black/50 text-xl arcade-font text-white">
        <input
          ref={(el) => { inputsRef.current[i] = el; }}
          value={letters[i] ?? ''}
          onChange={(e) => handleLetterChange(i, e.target.value)}
          onKeyDown={(e) => handleLetterKeyDown(e, i)}
          maxLength={1}
          className="w-full h-full bg-transparent text-center text-xl arcade-font outline-none caret-yellow-400 text-yellow-400"
          aria-label={`letter-${i}`}
        />
      </div>
    )
  }

  return (
    <>
      {/* Score display */}
      {!isGameOver && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg border border-white/20">
          <div className="text-lg arcade-font">SCORE: {Math.floor(score)}</div>
          <div className="text-xs arcade-text opacity-75 mt-1">SPEED: {GAME_CONFIG.playerSpeed.toFixed(2)}</div>
          <div className="text-xs arcade-text opacity-75">JUMP: {GAME_CONFIG.jump.duration.toFixed(2)}S</div>
          <div className="text-xs arcade-text opacity-75">SPAWN: {GAME_CONFIG.obstacles.spawnInterval.toFixed(2)}S</div>
          
          {/* Indicador de invulnerabilidad */}
          {isInvulnerable && (
            <div className="text-xs arcade-text mt-2 text-green-400 animate-pulse border-t border-green-400/30 pt-2">
              <div className="flex items-center justify-between">
                <span>🛡️ PROTEGIDO</span>
                <span>{invulnerabilityTimeLeft ? `${invulnerabilityTimeLeft.toFixed(1)}s` : ''}</span>
              </div>
            </div>
          )}
          
          {/* Indicador de escudo */}
          {hasShield && (
            <div className="text-xs arcade-text mt-2 text-blue-400 animate-pulse border-t border-blue-400/30 pt-2">
              <div className="flex items-center justify-center">
                <span>💾 BACKUP</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Indicador central de invulnerabilidad */}
      {isInvulnerable && !isGameOver && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-green-900/80 text-green-100 px-6 py-3 rounded-lg border-2 border-green-400 animate-pulse">
            <div className="text-center">
              <div className="text-xl arcade-font mb-1">🛡️ INVULNERABLE 🛡️</div>
              <div className="text-sm arcade-text">
                {invulnerabilityTimeLeft ? `${invulnerabilityTimeLeft.toFixed(1)}s restantes` : ''}
              </div>
              <div className="w-32 bg-green-700 rounded-full h-1 mt-2">
                <div 
                  className="bg-green-300 h-1 rounded-full transition-all duration-100"
                  style={{ 
                    width: invulnerabilityTimeLeft && invulnerabilityTimeLeft > 0 
                      ? `${(invulnerabilityTimeLeft / 5) * 100}%` 
                      : '0%' 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador central de escudo */}
      {hasShield && !isGameOver && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-blue-900/80 text-blue-100 px-6 py-3 rounded-lg border-2 border-blue-400 animate-pulse">
            <div className="text-center">
              <div className="text-xl arcade-font mb-1">💾 HICISTE EL BACKUP 💾</div>
              <div className="text-sm arcade-text">
                Tenés una segunda oportunidad
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {isPaused && !isGameOver && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
          <div className="bg-black p-8 rounded-lg text-center border-2 border-yellow-400 text-white">
            <h2 className="text-3xl arcade-title mb-4 text-yellow-400">PAUSED</h2>
            <p className="arcade-text text-sm">PRESS ESC TO CONTINUE</p>
          </div>
        </div>
      )}

      {/* Game over overlay */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">

          <div className="bg-black p-8 rounded-lg text-center max-w-md border-2 border-red-500 text-white">
            <h2 className="text-4xl arcade-title mb-6 text-red-500 drop-shadow-md">GAME OVER</h2>
            <p className="text-sm arcade-text mb-3">YOU CRASHED INTO AN OBSTACLE!</p>
            <p className="text-lg arcade-font mb-2 text-yellow-400">FINAL SCORE: {Math.floor(finalScore)}</p>
            
            {/* Frase aleatoria */}
            <p className="text-sm arcade-text mb-6 text-gray-400 italic">"{randomPhrase}"</p>

            <div className="mb-6">
              <p className="text-xs arcade-text mb-3">ENTER YOUR NAME (5 LETTERS):</p>
              <div className="flex items-center justify-center">
                <div className="flex" onClick={() => inputsRef.current[0]?.focus()} role="button" tabIndex={0}>
                  {[0, 1, 2, 3, 4].map((i) => renderLetterBox(i))}
                </div>
              </div>
              <p className="text-xs arcade-text opacity-70 mt-3">TYPE LETTERS DIRECTLY. BACKSPACE REMOVES LAST LETTER.</p>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={submitScore}
                disabled={posting || posted}
                className={`px-4 py-2 rounded-md arcade-text text-sm ${
                  posting || posted
                    ? "bg-gray-600 text-white border-2 border-gray-500"
                    : "bg-yellow-400 text-black border-2 border-yellow-600 hover:scale-105"
                } transition-transform`}
              >
                {posting ? "SENDING..." : posted ? "SUBMITTED" : "SUBMIT SCORE"}
              </button>

              <button
                onClick={onRestart}
                className="bg-green-500 text-white px-4 py-2 rounded-md arcade-text text-sm border-2 border-green-700 hover:opacity-90"
              >
                PLAY AGAIN
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-500 text-white px-4 py-2 rounded-md arcade-text text-sm border-2 border-blue-700 hover:opacity-90"
              >
                BACK
              </button>
            </div>

            {message && <div className="mt-3 text-xs arcade-text">{message}</div>}
          </div>
        </div>
      )}
    </>
  )
}
