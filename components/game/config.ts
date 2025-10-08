export const GAME_CONFIG = {
  playerSpeed: 0.15, // Will scale from 0.3 to 1.0
  laneOffset: 4,
  lanes: {
    left: -4,
    center: 0,
    right: 4,
  },
  jump: {
    height: 3,
    duration: 0.9, // Will scale from 0.9 to 0.5 seconds
  },
  obstacles: {
    spawnInterval: 1.0, // Will scale from 1.0 to 0.2 seconds
    spawnDistance: 50,
    size: [1.5, 2, 1.5] as [number, number, number],
  },
  mate: {
    size: 0.5,
    spawnChance: 0.02, // 2% chance when spawning obstacles
    invulnerabilityDuration: 5000, // 5 seconds in milliseconds
    height: 3, // Height above obstacles
  },
  terrain: {
    segmentSize: 20,
    segmentsAhead: 5,
    segmentsBehind: 2,
    recycleDistance: 40,
    renderDistance: 200, // Distancia máxima para renderizar segmentos
  },
  scoring: {
    pointsPerSecond: 2,
    distanceMultiplier: 1,
  },
}

function sigmoidScale(score: number, min: number, max: number, midpoint = 500, steepness = 0.01) {
  const s = 1 / (1 + Math.exp(-steepness * (score - midpoint)))
  return min + (max - min) * s
}

export function updateGameDifficulty(score: number) {
  GAME_CONFIG.playerSpeed = sigmoidScale(score, 0.3, 1.0)
  GAME_CONFIG.jump.duration = sigmoidScale(score, 0.9, 0.5)
  GAME_CONFIG.obstacles.spawnInterval = sigmoidScale(score, 1.0, 0.2)
}
