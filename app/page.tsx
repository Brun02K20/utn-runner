import Link from 'next/link'

export default function Home() {
  return (
    <div className="w-full h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full p-10 bg-black border-2 border-white/20 rounded-lg">
        <h1 className="text-xl md:text-2xl font-bold text-center mb-4">SUBWAY SURFERS</h1>
        <p className="text-center text-xs opacity-90 mb-6">Bienvenido! Elige una opción para comenzar.</p>

        <div className="flex flex-col space-y-3">
          <Link href="/game" className="w-full text-center py-3 rounded bg-white text-black font-semibold tracking-wider hover:opacity-90">
            JUGAR
          </Link>

          <Link href="/ranking" className="w-full text-center py-3 rounded border border-white/30 font-semibold tracking-wider hover:bg-white/5">
            VER RANKING
          </Link>

          <Link href="/credits" className="w-full text-center py-3 rounded border border-white/30 font-semibold tracking-wider hover:bg-white/5">
            CREDITOS
          </Link>
        </div>

        <div className="mt-6 text-center text-xs opacity-90">
          <p>Controles: ← → Cambiar carril | ↑ Saltar | ESC: Pausa</p>
        </div>
      </div>
    </div>
  )
}
