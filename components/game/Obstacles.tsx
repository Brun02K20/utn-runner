"use client"

import MateModel from "../MateModel"
import { GAME_CONFIG } from "./config"

interface Obstacle {
  id: number
  x: number
  z: number
  lane: string
}

interface Mate {
  id: number
  x: number
  z: number
  lane: string
}

interface ObstaclesProps {
  obstacles: Obstacle[]
  mates: Mate[]
  onCollectMate: (mateId: number) => void
}

export default function Obstacles({ obstacles, mates, onCollectMate }: ObstaclesProps) {
  return (
    <>
      {/* Obstacles */}
      {obstacles.map((obstacle) => (
        <mesh key={obstacle.id} position={[obstacle.x, GAME_CONFIG.obstacles.size[1] / 2 - 1, obstacle.z]} castShadow>
          <boxGeometry args={GAME_CONFIG.obstacles.size} />
          <meshStandardMaterial color="red" />
        </mesh>
      ))}

      {/* Mates */}
      {mates.map((mate) => (
        <MateModel
          key={mate.id}
          position={[mate.x, GAME_CONFIG.mate.height, mate.z]}
          onCollect={() => onCollectMate(mate.id)}
        />
      ))}
    </>
  )
}
