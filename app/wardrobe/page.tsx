"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { getStoreData, equipHat, equipShoes, type StoreData } from '@/lib/store'
import CharacterModel from '@/components/CharacterModel'

export default function Wardrobe() {
  const [storeData, setStoreData] = useState<StoreData | null>(null)
  const [selectedHat, setSelectedHat] = useState<string>('none')
  const [selectedShoes, setSelectedShoes] = useState<string>('none')
  const [activeTab, setActiveTab] = useState<'hats' | 'shoes'>('hats')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const data = getStoreData()
    setStoreData(data)
    setSelectedHat(data.equippedHat || 'none')
    setSelectedShoes(data.equippedShoes || 'none')
  }, [])

  const handleEquip = () => {
    if (!storeData) return
    
    if (activeTab === 'hats') {
      const success = equipHat(selectedHat)
      if (success) {
        setStoreData(getStoreData())
        setMessage('¡Gorro equipado!')
        setTimeout(() => setMessage(''), 3000)
      }
    } else {
      const success = equipShoes(selectedShoes)
      if (success) {
        setStoreData(getStoreData())
        setMessage('¡Zapatillas equipadas!')
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  if (!storeData) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl arcade-font">Cargando...</div>
      </div>
    )
  }

  const ownedHats = storeData.hats.filter(h => h.owned)
  const ownedShoes = storeData.shoes.filter(s => s.owned)

  return (
    <div className="w-full min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-6xl w-full p-8 bg-black border-2 border-purple-400 rounded-lg">
        <h1 className="text-3xl arcade-title text-center mb-8 text-purple-400">VESTIDOR</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Preview del personaje */}
          <div className="border-2 border-purple-400/30 rounded-lg p-4">
            <h2 className="text-xl arcade-font text-center mb-4 text-purple-300">PREVIEW</h2>
            
            <div className="w-full h-96 bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden">
              <Canvas 
                camera={{ position: [0, 2, 5], fov: 50 }}
                shadows
              >
                <Suspense fallback={null}>
                  <color attach="background" args={['#111111']} />
                  
                  {/* Luz ambiental tenue */}
                  <ambientLight intensity={0.3} />
                  
                  {/* Luz direccional amarilla tenue desde arriba */}
                  <directionalLight 
                    position={[0, 8, 0]} 
                    intensity={0.8} 
                    color="#fbbf24"
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                    shadow-camera-far={20}
                    shadow-camera-left={-5}
                    shadow-camera-right={5}
                    shadow-camera-top={5}
                    shadow-camera-bottom={-5}
                  />
                  
                  {/* Luz de relleno sutil */}
                  <pointLight position={[-3, 2, 3]} intensity={0.3} color="#8b5cf6" />
                  
                  {/* Plano para recibir sombras */}
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                    <planeGeometry args={[10, 10]} />
                    <shadowMaterial opacity={0.4} />
                  </mesh>
                  
                  <CharacterModel 
                    position={[0, 0, 0]} 
                    isInvulnerable={false}
                    equippedHat={selectedHat}
                    equippedShoes={selectedShoes}
                  />
                  
                  <OrbitControls 
                    enableZoom={true}
                    enablePan={false}
                    minDistance={3}
                    maxDistance={8}
                    target={[0, 0.5, 0]}
                  />
                </Suspense>
              </Canvas>
            </div>

            <p className="text-center text-sm arcade-text text-gray-400 mt-4">
              Usa el mouse para rotar la vista
            </p>
          </div>

          {/* Selección de items */}
          <div className="border-2 border-purple-400/30 rounded-lg p-4">
            <h2 className="text-xl arcade-font text-center mb-4 text-purple-300">TU VESTIMENTA</h2>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={() => setActiveTab('hats')}
                className={`px-6 py-2 rounded arcade-font text-sm ${
                  activeTab === 'hats'
                    ? 'bg-purple-400 text-black'
                    : 'border-2 border-gray-400 text-gray-400 hover:border-purple-400 hover:text-purple-400'
                }`}
              >
                🧢 GORROS
              </button>
              <button
                onClick={() => setActiveTab('shoes')}
                className={`px-6 py-2 rounded arcade-font text-sm ${
                  activeTab === 'shoes'
                    ? 'bg-purple-400 text-black'
                    : 'border-2 border-gray-400 text-gray-400 hover:border-purple-400 hover:text-purple-400'
                }`}
              >
                👟 ZAPATILLAS
              </button>
            </div>

            {message && (
              <div className="text-center mb-4 text-green-400 arcade-text animate-pulse">
                {message}
              </div>
            )}

            {/* Lista de gorros */}
            {activeTab === 'hats' && (
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {ownedHats.map((hat) => (
                <button
                  key={hat.id}
                  onClick={() => setSelectedHat(hat.id)}
                  className={`w-full p-4 rounded-lg border-2 flex items-center gap-4 transition-colors ${
                    selectedHat === hat.id
                      ? 'border-purple-400 bg-purple-900/30'
                      : 'border-gray-600 bg-gray-900/20 hover:border-purple-400/50'
                  }`}
                >
                  {/* Icono del gorro */}
                  <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                    {hat.id === 'none' && (
                      <div className="text-4xl">🚫</div>
                    )}
                    {hat.id === 'cap-basic' && (
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <ellipse cx="50" cy="70" rx="35" ry="8" fill="#1e40af" />
                        <path d="M 15 70 Q 50 40 85 70" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" />
                        <ellipse cx="50" cy="55" rx="20" ry="15" fill="#3b82f6" />
                      </svg>
                    )}
                    {hat.id === 'cap-premium' && (
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <ellipse cx="50" cy="70" rx="35" ry="8" fill="#991b1b" />
                        <path d="M 15 70 Q 50 40 85 70" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />
                        <ellipse cx="50" cy="55" rx="20" ry="15" fill="#ef4444" />
                        <circle cx="50" cy="55" r="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
                      </svg>
                    )}
                    {hat.id === 'cap-legendary' && (
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <ellipse cx="50" cy="70" rx="35" ry="8" fill="#92400e" />
                        <path d="M 15 70 Q 50 40 85 70" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
                        <ellipse cx="50" cy="55" rx="20" ry="15" fill="#fbbf24" />
                        <path d="M 40 45 L 45 35 L 50 40 L 55 35 L 60 45" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
                        <circle cx="50" cy="50" r="3" fill="#dc2626" />
                      </svg>
                    )}
                  </div>

                  {/* Nombre */}
                  <div className="flex-1 text-left">
                    <div className="text-base arcade-font text-white">
                      {hat.name}
                    </div>
                    {storeData.equippedHat === hat.id && (
                      <div className="text-xs arcade-text text-green-400 mt-1">
                        ✓ Equipado
                      </div>
                    )}
                  </div>

                  {/* Indicador de selección */}
                  {selectedHat === hat.id && (
                    <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            )}

            {/* Lista de zapatillas */}
            {activeTab === 'shoes' && (
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {ownedShoes.map((shoe) => (
                  <button
                    key={shoe.id}
                    onClick={() => setSelectedShoes(shoe.id)}
                    className={`w-full p-4 rounded-lg border-2 flex items-center gap-4 transition-colors ${
                      selectedShoes === shoe.id
                        ? 'border-purple-400 bg-purple-900/30'
                        : 'border-gray-600 bg-gray-900/20 hover:border-purple-400/50'
                    }`}
                  >
                    {/* Icono de las zapatillas */}
                    <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                      {shoe.id === 'none' && (
                        <div className="text-4xl">🚫</div>
                      )}
                      {shoe.id === 'shoes-basic' && (
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <ellipse cx="50" cy="70" rx="30" ry="10" fill="#94a3b8" opacity="0.3" />
                          <path d="M 25 60 Q 30 45 45 40 L 55 40 Q 70 45 75 60 L 70 65 Q 50 70 30 65 Z" 
                            fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
                          <path d="M 30 50 L 70 50" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                          <path d="M 30 65 Q 50 68 70 65" fill="#1e293b" />
                        </svg>
                      )}
                      {shoe.id === 'shoes-premium' && (
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <ellipse cx="50" cy="70" rx="30" ry="10" fill="#94a3b8" opacity="0.3" />
                          <path d="M 25 60 Q 30 45 45 40 L 55 40 Q 70 45 75 60 L 70 65 Q 50 70 30 65 Z" 
                            fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                          <path d="M 30 50 L 70 50" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
                          <circle cx="40" cy="45" r="3" fill="#ef4444" />
                          <circle cx="60" cy="45" r="3" fill="#ef4444" />
                          <path d="M 30 65 Q 50 68 70 65" fill="#0f172a" />
                        </svg>
                      )}
                      {shoe.id === 'shoes-legendary' && (
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <ellipse cx="50" cy="70" rx="30" ry="10" fill="#fbbf24" opacity="0.3" />
                          <path d="M 25 60 Q 30 45 45 40 L 55 40 Q 70 45 75 60 L 70 65 Q 50 70 30 65 Z" 
                            fill="#f59e0b" stroke="#92400e" strokeWidth="2" />
                          <path d="M 30 50 L 70 50" stroke="#fef3c7" strokeWidth="4" strokeLinecap="round" />
                          <circle cx="50" cy="50" r="3" fill="#fef3c7" />
                          <path d="M 30 65 Q 50 68 70 65" fill="#d97706" />
                        </svg>
                      )}
                    </div>

                    {/* Nombre */}
                    <div className="flex-1 text-left">
                      <div className="text-base arcade-font text-white">
                        {shoe.name}
                      </div>
                      {storeData.equippedShoes === shoe.id && (
                        <div className="text-xs arcade-text text-green-400 mt-1">
                          ✓ Equipado
                        </div>
                      )}
                    </div>

                    {/* Indicador de selección */}
                    {selectedShoes === shoe.id && (
                      <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Botón equipar */}
            <button
              onClick={handleEquip}
              disabled={
                activeTab === 'hats' 
                  ? selectedHat === storeData.equippedHat 
                  : selectedShoes === storeData.equippedShoes
              }
              className={`w-full py-3 rounded arcade-font text-sm tracking-wider transition-colors ${
                (activeTab === 'hats' ? selectedHat === storeData.equippedHat : selectedShoes === storeData.equippedShoes)
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-400 text-black hover:bg-purple-500'
              }`}
            >
              {(activeTab === 'hats' ? selectedHat === storeData.equippedHat : selectedShoes === storeData.equippedShoes) 
                ? 'YA EQUIPADO' 
                : 'EQUIPAR'}
            </button>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-center gap-4 mt-8">
          <Link 
            href="/store" 
            className="px-6 py-3 rounded bg-yellow-400 text-black arcade-font text-sm tracking-wider hover:bg-yellow-500 transition-colors"
          >
            TIENDA
          </Link>
          <Link 
            href="/" 
            className="px-6 py-3 rounded border-2 border-purple-400 arcade-font text-sm tracking-wider hover:bg-purple-400/10 text-purple-400"
          >
            VOLVER
          </Link>
        </div>
      </div>
    </div>
  )
}
