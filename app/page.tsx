import Link from 'next/link'

export default function Home() {
  return (
    <div className="w-full h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full p-10 bg-black border-2 border-yellow-400 rounded-lg">
        <h1 className="text-2xl md:text-3xl arcade-title text-center mb-6 text-yellow-400">UTN RUNNER</h1>
        <p className="text-center text-xs arcade-text opacity-90 mb-8">BIENVENIDO! ELIGE UNA OPCION PARA COMENZAR.</p>

        <div className="flex flex-col space-y-4">
          <Link href="/game" className="w-full text-center py-3 rounded bg-yellow-400 text-black arcade-font text-sm tracking-wider hover:bg-yellow-500 transition-colors">
            JUGAR
          </Link>

          <Link href="/ranking" className="w-full text-center py-3 rounded border-2 border-green-400 arcade-font text-sm tracking-wider hover:bg-green-400/10 text-green-400">
            VER RANKING
          </Link>

          <Link href="/credits" className="w-full text-center py-3 rounded border-2 border-blue-400 arcade-font text-sm tracking-wider hover:bg-blue-400/10 text-blue-400">
            CREDITOS
          </Link>
        </div>

        <div className="mt-8 text-center text-xs arcade-text opacity-75">
          <p>CONTROLES: ← → CAMBIAR CARRIL | ↑ SALTAR | ESC: PAUSA</p>
        </div>
      </div>
    </div>
  )
}
