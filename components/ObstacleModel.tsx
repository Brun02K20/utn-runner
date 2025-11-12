"use client";

import { useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";
import type { Group } from "three";
import { Mesh } from "three";

interface ObstacleModelProps {
  position: [number, number, number];
  type: "libros" | "pcvieja" | "silla";
  scale?: number;
}

const OBSTACLE_MODELS = {
  libros: "/models/libros.glb",
  pcvieja: "/models/pcvieja.glb", 
  silla: "/models/silla.glb"
} as const;

// Configuración específica para cada tipo de obstáculo
const OBSTACLE_CONFIGS = {
  libros: { scale: 0.7, yOffset: 0 },
  pcvieja: { scale: 0.7, yOffset: 0 },
  silla: { scale: 0.45, yOffset: 0 }
} as const;

export default function ObstacleModel({ position, type, scale }: ObstacleModelProps) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(OBSTACLE_MODELS[type]);
  
  // Usar la configuración específica del tipo de obstáculo, o la escala pasada como prop
  const config = OBSTACLE_CONFIGS[type];
  const finalScale = scale || config.scale;
  const adjustedPosition: [number, number, number] = [
    position[0], 
    position[1] + config.yOffset, 
    position[2]
  ];

  // Configurar sombras para todos los meshes del modelo
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  return (
    <group ref={groupRef} position={adjustedPosition} scale={[finalScale, finalScale, finalScale]} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={scene.clone()} />
    </group>
  );
}

// Preload all obstacle models for better performance
useGLTF.preload("/models/libros.glb");
useGLTF.preload("/models/pcvieja.glb");
useGLTF.preload("/models/silla.glb");