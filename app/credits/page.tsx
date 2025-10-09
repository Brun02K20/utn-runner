import Link from 'next/link'

const CREDITS = [
  { name: 'Bruno Virinni', role: 'Developer' },
  { name: 'Juan Liendo', role: 'Developer' },
  { name: 'Tomas Figueroa', role: 'Developer' }
]

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto bg-black border-2 border-blue-400 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl arcade-title text-blue-400">CREDITOS</h1>
          <Link href="/" className="text-xs arcade-text opacity-80 hover:opacity-100 text-yellow-400">VOLVER</Link>
        </div>

        <table className="w-full text-left table-auto mb-8">
          <thead>
            <tr className="text-xs arcade-font text-white/80 border-b border-blue-400/30">
              <th className="py-3 px-3">NOMBRE</th>
              <th className="py-3 px-3">ROL</th>
            </tr>
          </thead>
          <tbody>
            {CREDITS.map((c) => (
              <tr key={c.name} className="odd:bg-blue-400/5 even:bg-transparent border-b border-blue-400/10">
                <td className="py-3 px-3 arcade-font text-yellow-400">{c.name}</td>
                <td className="py-3 px-3 arcade-font">{c.role}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 p-4 bg-purple-500/10 rounded border-2 border-purple-400">
          <h3 className="arcade-font text-purple-400 mb-3">AGRADECIMIENTOS</h3>
          <p className="text-xs arcade-text opacity-85">UN AGRADECIMIENTO ESPECIAL AL ING. FRANCO MANA POR SU APOYO Y ORIENTACION DURANTE EL DESARROLLO.</p>
        </div>
      </div>
    </div>
  )
}
