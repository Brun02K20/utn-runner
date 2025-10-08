"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface HandControlContextType {
  lane: "left" | "center" | "right" | null
  jump: boolean
  setLane: (lane: "left" | "center" | "right" | null) => void
  setJump: (jump: boolean) => void
}

export const HandControlContext = createContext<HandControlContextType | undefined>(undefined)

export function HandControlProvider({ children }: { children: ReactNode }) {
  const [lane, setLane] = useState<"left" | "center" | "right" | null>(null)
  const [jump, setJump] = useState(false)

  return <HandControlContext.Provider value={{ lane, jump, setLane, setJump }}>{children}</HandControlContext.Provider>
}

export function useHandControlContext() {
  const context = useContext(HandControlContext)
  if (context === undefined) {
    throw new Error("useHandControlContext must be used within a HandControlProvider")
  }
  return context
}
