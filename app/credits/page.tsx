import Link from 'next/link'

const CREDITS = [
  { name: 'Bruno Virinni', role: 'Developer' },
  { name: 'Juan Liendo', role: 'Developer' },
  { name: 'Tomas Figueroa', role: 'Developer' }
]

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto bg-black border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">CRÉDITOS</h1>
          <Link href="/" className="text-sm opacity-80 hover:underline">VOLVER</Link>
        </div>

        <table className="w-full text-left table-auto mb-6">
          <thead>
            <tr className="text-sm text-white/80">
              <th className="py-2 px-3">NOMBRE</th>
              <th className="py-2 px-3">ROL</th>
            </tr>
          </thead>
          <tbody>
            {CREDITS.map((c) => (
              <tr key={c.name} className="odd:bg-white/3 even:bg-transparent">
                <td className="py-2 px-3 font-medium">{c.name}</td>
                <td className="py-2 px-3">{c.role}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 p-4 bg-white/5 rounded border border-white/6">
          <h3 className="font-semibold">AGRADECIMIENTOS</h3>
          <p className="text-sm opacity-85 mt-2">Un agradecimiento especial al Ing. Franco Mana por su apoyo y orientación durante el desarrollo.</p>
        </div>
      </div>
    </div>
  )
}
