"use client"

import { useEffect } from 'react'
import { setupConsoleCleaner, configureLibraryLogging } from '../lib/console-cleaner'

/**
 * Componente que inicializa la limpieza de consola
 * Debe ser montado una sola vez en la aplicación
 */
export default function ConsoleCleanerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configurar limpieza de consola inmediatamente
    setupConsoleCleaner()
    
    // Configurar librerías específicas
    configureLibraryLogging()
    
    // Cleanup function para desarrollo (Hot Module Replacement)
    return () => {
      // En desarrollo, no restaurar para evitar spam durante HMR
      if (process.env.NODE_ENV !== 'production') {
        // restoreConsole()
      }
    }
  }, [])

  return <>{children}</>
}