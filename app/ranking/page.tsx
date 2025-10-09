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
      <div className="max-w-3xl mx-auto bg-black border-2 border-green-400 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl arcade-title text-green-400">RANKING</h1>
          <Link href="/" className="text-xs arcade-text opacity-80 hover:opacity-100 text-yellow-400">VOLVER</Link>
        </div>

        <table className="w-full text-left table-auto">
          <thead>
            <tr className="text-xs arcade-font text-white/80 border-b border-green-400/30">
              <th className="py-3 px-3">#</th>
              <th className="py-3 px-3">NOMBRE</th>
              <th className="py-3 px-3">PUNTAJE</th>
              <th className="py-3 px-3">FECHA</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 px-3 text-center text-sm arcade-text text-white/70">NO HAY PUNTUACIONES DISPONIBLES</td>
              </tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.id} className="odd:bg-green-400/5 even:bg-transparent border-b border-green-400/10">
                  <td className="py-3 px-3 arcade-font text-yellow-400">{r.position}</td>
                  <td className="py-3 px-3 arcade-font">{r.player}</td>
                  <td className="py-3 px-3 arcade-font text-green-400">{r.points}</td>
                  <td className="py-3 px-3 text-xs arcade-text text-white/70">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
