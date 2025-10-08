import Link from 'next/link'

type Score = {
  id: number
  player: string
  points: number
  position: number
  createdAt: string
}

async function fetchScores(): Promise<Score[]> {
  try {
    const res = await fetch('https://utn-runner.vercel.app/scores', { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(`Failed fetching scores: ${res.status}`)
    }
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error fetching scores:', e)
    return []
  }
}

export default async function RankingPage() {
  const scores = await fetchScores()

  // Sort by position (ascending)
  const sorted = scores.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto bg-black border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">RANKING</h1>
          <Link href="/" className="text-sm opacity-80 hover:underline">VOLVER</Link>
        </div>

        <table className="w-full text-left table-auto">
          <thead>
            <tr className="text-sm text-white/80">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">NOMBRE</th>
              <th className="py-2 px-3">PUNTAJE</th>
              <th className="py-2 px-3">FECHA</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 px-3 text-center text-sm text-white/70">No hay puntuaciones disponibles</td>
              </tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.id} className="odd:bg-white/3 even:bg-transparent">
                  <td className="py-2 px-3 font-medium">{r.position}</td>
                  <td className="py-2 px-3">{r.player}</td>
                  <td className="py-2 px-3">{r.points}</td>
                  <td className="py-2 px-3 text-sm text-white/70">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
