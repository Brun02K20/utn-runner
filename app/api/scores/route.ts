import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Basic validation
    const player = typeof body.player === 'string' ? body.player.toUpperCase().slice(0, 5) : null
    const points = typeof body.points === 'number' ? body.points : null

    if (!player || !points) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Forward to external API
    const res = await fetch('https://utn-runner.vercel.app/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player, points }),
    })

    const data = await res.text()
    // proxy status and body
    return new NextResponse(data, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
  } catch (err: any) {
    console.error('API proxy error:', err)
    return NextResponse.json({ error: 'Proxy error' }, { status: 502 })
  }
}
