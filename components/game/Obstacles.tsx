"use client"

import MateModel from "../MateModel"
import UsbModel from "../UsbModel"
import ObstacleModel from "../ObstacleModel"
import { GAME_CONFIG } from "./config"

interface Obstacle {
  id: number
  x: number
  z: number
  lane: string
  type: "libros" | "pcvieja" | "silla"
}

interface Mate {
  id: number
  x: number
  z: number
  lane: string
}

interface Usb {
  id: number
  x: number
  z: number
  lane: string
}

interface ObstaclesProps {
  obstacles: Obstacle[]
  mates: Mate[]
  usbs: Usb[]
  onCollectMate: (mateId: number) => void
  onCollectUsb: (usbId: number) => void
}

export default function Obstacles({ obstacles, mates, usbs, onCollectMate, onCollectUsb }: ObstaclesProps) {
  return (
    <>
      {/* Obstacles */}
      {obstacles.map((obstacle) => (
        <ObstacleModel
          key={obstacle.id}
          position={[obstacle.x, 0, obstacle.z]}
          type={obstacle.type}
        />
      ))}

      {/* Mates */}
      {mates.map((mate) => (
        <MateModel
          key={mate.id}
          position={[mate.x, GAME_CONFIG.mate.height, mate.z]}
          onCollect={() => onCollectMate(mate.id)}
        />
      ))}

      {/* USBs */}
      {usbs.map((usb) => (
        <UsbModel
          key={usb.id}
          position={[usb.x, GAME_CONFIG.usb.height, usb.z]}
          onCollect={() => onCollectUsb(usb.id)}
        />
      ))}
    </>
  )
}
