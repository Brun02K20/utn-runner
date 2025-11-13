"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getStoreData, buyHat, type StoreData } from '@/lib/store'

export default function Store() {
  const [storeData, setStoreData] = useState<StoreData | null>(null)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    setStoreData(getStoreData())
  }, [])

  const handleBuy = (hatId: string, hatName: string, price: number) => {
    if (!storeData) return
    
    if (storeData.coins < price) {
      setMessage('¡No tenés suficientes monedas!')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    
    const success = buyHat(hatId)
    if (success) {
      setStoreData(getStoreData())
      setMessage(`¡Compraste ${hatName}!`)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (!storeData) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl arcade-font">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full p-8 bg-black border-2 border-yellow-400 rounded-lg">
        <h1 className="text-3xl arcade-title text-center mb-4 text-yellow-400">TIENDA</h1>
        
        {/* Monedas disponibles */}
        <div className="text-center mb-8">
          <div className="inline-block bg-yellow-900/30 border-2 border-yellow-400 rounded-lg px-6 py-3">
            <span className="text-2xl arcade-font text-yellow-400">
              💰 {storeData.coins} MONEDAS
            </span>
          </div>
        </div>

        {/* Mensaje de feedback */}
        {message && (
          <div className="text-center mb-4 text-green-400 arcade-text animate-pulse">
            {message}
          </div>
        )}

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {storeData.hats.filter(hat => hat.id !== 'none').map((hat) => (
            <div
              key={hat.id}
              className={`border-2 rounded-lg p-6 flex flex-col items-center ${
                hat.owned 
                  ? 'border-green-400 bg-green-900/20' 
                  : 'border-gray-400 bg-gray-900/20'
              }`}
            >
              {/* SVG del gorro */}
              <div className="w-32 h-32 mb-4 flex items-center justify-center">
                {hat.id === 'cap-basic' && (
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Gorra básica - azul simple */}
                    <ellipse cx="50" cy="70" rx="35" ry="8" fill="#1e40af" />
                    <path d="M 15 70 Q 50 40 85 70" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" />
                    <ellipse cx="50" cy="55" rx="20" ry="15" fill="#3b82f6" />
                  </svg>
                )}
                {hat.id === 'cap-premium' && (
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Gorra premium - roja con detalles */}
                    <ellipse cx="50" cy="70" rx="35" ry="8" fill="#991b1b" />
                    <path d="M 15 70 Q 50 40 85 70" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />
                    <ellipse cx="50" cy="55" rx="20" ry="15" fill="#ef4444" />
                    <circle cx="50" cy="55" r="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
                  </svg>
                )}
                {hat.id === 'cap-legendary' && (
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Gorra legendaria - dorada con corona */}
                    <ellipse cx="50" cy="70" rx="35" ry="8" fill="#92400e" />
                    <path d="M 15 70 Q 50 40 85 70" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
                    <ellipse cx="50" cy="55" rx="20" ry="15" fill="#fbbf24" />
                    <path d="M 40 45 L 45 35 L 50 40 L 55 35 L 60 45" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
                    <circle cx="50" cy="50" r="3" fill="#dc2626" />
                  </svg>
                )}
              </div>

              {/* Nombre */}
              <h3 className="text-lg arcade-font mb-2 text-center">
                {hat.name}
              </h3>

              {/* Precio */}
              <div className="text-yellow-400 arcade-text mb-4">
                💰 {hat.price} monedas
              </div>

              {/* Botón */}
              {hat.owned ? (
                <div className="bg-green-600 text-white px-6 py-2 rounded arcade-text text-sm">
                  ✓ COMPRADO
                </div>
              ) : (
                <button
                  onClick={() => handleBuy(hat.id, hat.name, hat.price)}
                  disabled={storeData.coins < hat.price}
                  className={`px-6 py-2 rounded arcade-text text-sm ${
                    storeData.coins >= hat.price
                      ? 'bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  COMPRAR
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-center gap-4">
          <Link 
            href="/wardrobe" 
            className="px-6 py-3 rounded bg-purple-400 text-black arcade-font text-sm tracking-wider hover:bg-purple-500 transition-colors"
          >
            VESTIDOR
          </Link>
          <Link 
            href="/" 
            className="px-6 py-3 rounded border-2 border-yellow-400 arcade-font text-sm tracking-wider hover:bg-yellow-400/10 text-yellow-400"
          >
            VOLVER
          </Link>
        </div>
      </div>
    </div>
  )
}
