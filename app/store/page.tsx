"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getStoreData, buyHat, buyShoes, type StoreData } from '@/lib/store'

export default function Store() {
  const [storeData, setStoreData] = useState<StoreData | null>(null)
  const [message, setMessage] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'hats' | 'shoes'>('hats')

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

  const handleBuyShoes = (shoesId: string, shoesName: string, price: number) => {
    if (!storeData) return
    
    if (storeData.coins < price) {
      setMessage('¡No tenés suficientes monedas!')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    
    const success = buyShoes(shoesId)
    if (success) {
      setStoreData(getStoreData())
      setMessage(`¡Compraste ${shoesName}!`)
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

        {/* Tabs para categorías */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('hats')}
            className={`px-6 py-2 rounded arcade-font text-sm ${
              activeTab === 'hats'
                ? 'bg-yellow-400 text-black'
                : 'border-2 border-gray-400 text-gray-400 hover:border-yellow-400 hover:text-yellow-400'
            }`}
          >
            🧢 GORROS
          </button>
          <button
            onClick={() => setActiveTab('shoes')}
            className={`px-6 py-2 rounded arcade-font text-sm ${
              activeTab === 'shoes'
                ? 'bg-yellow-400 text-black'
                : 'border-2 border-gray-400 text-gray-400 hover:border-yellow-400 hover:text-yellow-400'
            }`}
          >
            👟 ZAPATILLAS
          </button>
        </div>

        {/* Grid de productos - Gorros */}
        {activeTab === 'hats' && (
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
        )}

        {/* Grid de productos - Zapatillas */}
        {activeTab === 'shoes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {storeData.shoes.filter(shoe => shoe.id !== 'none').map((shoe) => (
              <div
                key={shoe.id}
                className={`border-2 rounded-lg p-6 flex flex-col items-center ${
                  shoe.owned 
                    ? 'border-green-400 bg-green-900/20' 
                    : 'border-gray-400 bg-gray-900/20'
                }`}
              >
                {/* SVG de las zapatillas */}
                <div className="w-32 h-32 mb-4 flex items-center justify-center">
                  {shoe.id === 'shoes-basic' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Zapatilla básica - blanca con detalles azules */}
                      <ellipse cx="50" cy="70" rx="30" ry="10" fill="#94a3b8" opacity="0.3" />
                      <path d="M 25 60 Q 30 45 45 40 L 55 40 Q 70 45 75 60 L 70 65 Q 50 70 30 65 Z" 
                        fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
                      <path d="M 30 50 L 70 50" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="35" cy="50" r="2" fill="#3b82f6" />
                      <circle cx="50" cy="50" r="2" fill="#3b82f6" />
                      <circle cx="65" cy="50" r="2" fill="#3b82f6" />
                      <path d="M 30 65 Q 50 68 70 65" fill="#1e293b" />
                    </svg>
                  )}
                  {shoe.id === 'shoes-premium' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Zapatilla premium - negra con detalles rojos */}
                      <ellipse cx="50" cy="70" rx="30" ry="10" fill="#94a3b8" opacity="0.3" />
                      <path d="M 25 60 Q 30 45 45 40 L 55 40 Q 70 45 75 60 L 70 65 Q 50 70 30 65 Z" 
                        fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                      <path d="M 30 50 L 70 50" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
                      <path d="M 28 55 Q 35 52 42 55" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                      <path d="M 58 55 Q 65 52 72 55" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="40" cy="45" r="3" fill="#ef4444" />
                      <circle cx="60" cy="45" r="3" fill="#ef4444" />
                      <path d="M 30 65 Q 50 68 70 65" fill="#0f172a" />
                      <path d="M 35 65 L 37 62" stroke="#dc2626" strokeWidth="1" />
                      <path d="M 50 66 L 50 63" stroke="#dc2626" strokeWidth="1" />
                      <path d="M 65 65 L 63 62" stroke="#dc2626" strokeWidth="1" />
                    </svg>
                  )}
                  {shoe.id === 'shoes-legendary' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Zapatilla legendaria - dorada con efectos brillantes */}
                      <ellipse cx="50" cy="70" rx="30" ry="10" fill="#fbbf24" opacity="0.3" />
                      <path d="M 25 60 Q 30 45 45 40 L 55 40 Q 70 45 75 60 L 70 65 Q 50 70 30 65 Z" 
                        fill="#f59e0b" stroke="#92400e" strokeWidth="2" />
                      <path d="M 30 50 L 70 50" stroke="#fef3c7" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="35" cy="50" r="3" fill="#fef3c7" />
                      <circle cx="50" cy="50" r="3" fill="#fef3c7" />
                      <circle cx="65" cy="50" r="3" fill="#fef3c7" />
                      <path d="M 30 65 Q 50 68 70 65" fill="#d97706" />
                      {/* Detalles brillantes */}
                      <path d="M 32 42 L 34 45 L 30 44 Z" fill="#fef3c7" />
                      <path d="M 48 38 L 50 41 L 46 40 Z" fill="#fef3c7" />
                      <path d="M 68 42 L 66 45 L 70 44 Z" fill="#fef3c7" />
                      <circle cx="55" cy="55" r="2" fill="#dc2626" />
                      {/* Llama en el lateral */}
                      <path d="M 73 55 Q 78 52 76 48 Q 80 50 78 45" 
                        fill="#ef4444" stroke="#dc2626" strokeWidth="0.5" opacity="0.8" />
                    </svg>
                  )}
                </div>

                {/* Nombre */}
                <h3 className="text-lg arcade-font mb-2 text-center">
                  {shoe.name}
                </h3>

                {/* Precio */}
                <div className="text-yellow-400 arcade-text mb-4">
                  💰 {shoe.price} monedas
                </div>

                {/* Botón */}
                {shoe.owned ? (
                  <div className="bg-green-600 text-white px-6 py-2 rounded arcade-text text-sm">
                    ✓ COMPRADO
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyShoes(shoe.id, shoe.name, shoe.price)}
                    disabled={storeData.coins < shoe.price}
                    className={`px-6 py-2 rounded arcade-text text-sm ${
                      storeData.coins >= shoe.price
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
        )}

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
