import Link from 'next/link'

export default function Instructions() {
  return (
    <div className="w-full min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full p-8 bg-black border-2 border-purple-400 rounded-lg">
        <h1 className="text-3xl arcade-title text-center mb-8 text-purple-400">INSTRUCCIONES</h1>

        {/* Controles */}
        <div className="mb-8">
          <h2 className="text-xl arcade-font text-yellow-400 mb-4">🎮 CONTROLES</h2>
          <div className="space-y-2 text-sm arcade-text">
            <p>• <strong>← →</strong> - Cambiar de carril</p>
            <p>• <strong>↑</strong> - Saltar</p>
            <p>• <strong>ESC</strong> - Pausar el juego</p>
            <p>• <strong>Mano</strong> - Controlar minijuegos con gestos</p>
          </div>
        </div>

        {/* Power-ups */}
        <div className="mb-8">
          <h2 className="text-xl arcade-font text-green-400 mb-4">⚡ POWER-UPS</h2>
          <div className="space-y-4">
            <div className="border-2 border-green-400/30 rounded-lg p-4">
              <h3 className="text-base arcade-font text-green-300 mb-2">🧉 MATE</h3>
              <p className="text-sm arcade-text text-gray-300">
                Te otorga invulnerabilidad temporal de 5 segundos. Durante este tiempo, no podés chocar con ningún obstáculo.
              </p>
            </div>
            
            <div className="border-2 border-blue-400/30 rounded-lg p-4">
              <h3 className="text-base arcade-font text-blue-300 mb-2">💾 USB (BACKUP)</h3>
              <p className="text-sm arcade-text text-gray-300">
                Actúa como un escudo protector de un solo uso. Te protege de una colisión con libros o sillas.
              </p>
            </div>
          </div>
        </div>

        {/* Minijuegos */}
        <div className="mb-8">
          <h2 className="text-xl arcade-font text-red-400 mb-4">🎯 MINIJUEGOS</h2>
          <p className="text-sm arcade-text text-gray-400 mb-4">
            Al chocar con una <strong>PC vieja</strong>, se activa un minijuego aleatorio. ¡Ganar te da bonificación en el puntaje!
          </p>
          
          <div className="space-y-3">
            <div className="border-2 border-red-400/30 rounded-lg p-3">
              <h3 className="text-sm arcade-font text-red-300 mb-1">1. Selección de Bolas</h3>
              <p className="text-xs arcade-text text-gray-300">
                Movete a la posición de la bola correcta en 5 segundos.
              </p>
            </div>
            
            <div className="border-2 border-red-400/30 rounded-lg p-3">
              <h3 className="text-sm arcade-font text-red-300 mb-1">2. Cálculo Rápido</h3>
              <p className="text-xs arcade-text text-gray-300">
                Resolvé la operación matemática y movete a la respuesta correcta en 8 segundos.
              </p>
            </div>
            
            <div className="border-2 border-red-400/30 rounded-lg p-3">
              <h3 className="text-sm arcade-font text-red-300 mb-1">3. Esquivar Parciales</h3>
              <p className="text-xs arcade-text text-gray-300">
                Esquivá los rectángulos que caen durante 8 segundos sin chocar.
              </p>
            </div>
            
            <div className="border-2 border-red-400/30 rounded-lg p-3">
              <h3 className="text-sm arcade-font text-red-300 mb-1">4. Entregar TP</h3>
              <p className="text-xs arcade-text text-gray-300">
                ¡Son las 23:59! Cerrá y abrí la mano 5 veces en 4 segundos para subir el TP a tiempo.
              </p>
            </div>
            
            <div className="border-2 border-red-400/30 rounded-lg p-3">
              <h3 className="text-sm arcade-font text-red-300 mb-1">5. Ya Están Las Notas</h3>
              <p className="text-xs arcade-text text-gray-300">
                Juego de suerte: 80% de probabilidad de "N/A", 20% de obtener una nota del 1 al 10. Solo promocionando (8+) ganás invulnerabilidad.
              </p>
            </div>
          </div>
        </div>

        {/* Obstáculos */}
        <div className="mb-8">
          <h2 className="text-xl arcade-font text-orange-400 mb-4">⚠️ OBSTÁCULOS</h2>
          <div className="space-y-2 text-sm arcade-text">
            <p>• <strong>📚 Libros</strong> - Te hacen perder (excepto con escudo USB)</p>
            <p>• <strong>🪑 Sillas</strong> - Te hacen perder (excepto con escudo USB)</p>
            <p>• <strong>💻 PC Vieja</strong> - Activa un minijuego aleatorio</p>
          </div>
        </div>

        {/* Botón volver */}
        <div className="flex justify-center mt-8">
          <Link 
            href="/" 
            className="px-8 py-3 rounded bg-purple-400 text-black arcade-font text-sm tracking-wider hover:bg-purple-500 transition-colors"
          >
            VOLVER
          </Link>
        </div>
      </div>
    </div>
  )
}
