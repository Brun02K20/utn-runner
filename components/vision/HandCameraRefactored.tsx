"use client";
import React, { useEffect, useRef, useState, useContext } from "react";
import { HandControlContext } from "./HandControlContext";
import { HandDetectionEngine } from "./HandDetectionEngine";
import { VideoRenderer } from "./VideoRenderer";
import { CameraController } from "./CameraController";
import { HandDetectionResult, CameraSettings, DetectionConfig, OnHandDetected } from "./types";

interface Props {
  onHandDetected?: OnHandDetected;
  width?: number;
  height?: number;
}

// Default configuration
const DEFAULT_CONFIG: DetectionConfig = {
  maxNumHands: 1,
  modelComplexity: 0, // Use lite model for better performance
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.5,
  targetFPS: 25,
  debounceMs: 100,
};

export default function HandCameraRefactored({ onHandDetected, width = 640, height = 480 }: Props) {
  // React refs and state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeLane, setActiveLane] = useState<"left" | "center" | "right" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Module instances
  const detectionEngineRef = useRef<HandDetectionEngine | null>(null);
  const rendererRef = useRef<VideoRenderer | null>(null);
  const cameraControllerRef = useRef<CameraController>(new CameraController());

  // Context integration
  const ctx = useContext(HandControlContext as any) as any | undefined;
  const setLaneFromContext: ((lane: "left" | "center" | "right" | null) => void) | undefined = ctx?.setLane;
  const setJumpFromContext: ((j: boolean) => void) | undefined = ctx?.setJump;

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;

    const initializeSystem = async () => {
      try {
        console.log('[HandCameraRefactored] Starting system initialization...');
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (!video || !canvas) {
          console.error('[HandCameraRefactored] Video or canvas element not found');
          return;
        }

        // Step 1: Initialize camera
        console.log('[HandCameraRefactored] Step 1: Initializing camera...');
        const cameraResult = await cameraControllerRef.current.initializeCamera(video, width, height);
        
        if (!cameraResult) {
          setError("No se pudo acceder a la cámara. Verificá permisos y https/localhost.");
          return;
        }

        const { stream, isMirrored } = cameraResult;

        // Step 2: Setup canvas dimensions
        console.log('[HandCameraRefactored] Step 2: Setting up canvas...');
        canvas.width = video.videoWidth || width;
        canvas.height = video.videoHeight || height;

        const cameraSettings: CameraSettings = {
          width: canvas.width,
          height: canvas.height,
          isMirrored
        };

        // Step 3: Initialize detection engine
        console.log('[HandCameraRefactored] Step 3: Initializing detection engine...');
        detectionEngineRef.current = new HandDetectionEngine(DEFAULT_CONFIG);
        const detectionSuccess = await detectionEngineRef.current.initialize(video);
        
        if (!detectionSuccess) {
          setError("No se pudo inicializar la detección de manos. Revisa la consola.");
          return;
        }

        // Step 4: Initialize renderer
        console.log('[HandCameraRefactored] Step 4: Initializing renderer...');
        rendererRef.current = new VideoRenderer(canvas, video, cameraSettings);

        // Step 5: Setup detection callback
        console.log('[HandCameraRefactored] Step 5: Setting up detection callback...');
        const handleDetection = (result: HandDetectionResult) => {
          if (!mounted) return;

          // Update local state
          setActiveLane(result.lane);

          // Update context if available
          try {
            setLaneFromContext?.(result.lane);
            setJumpFromContext?.(result.isClosed);
          } catch (e) {
            // Context not available, ignore
          }

          // Call external callback
          onHandDetected?.(result);

          // Render frame
          if (rendererRef.current) {
            rendererRef.current.render(result, result.lane);
          }
        };

        // Step 6: Start detection
        console.log('[HandCameraRefactored] Step 6: Starting detection...');
        detectionEngineRef.current.startDetection(video, cameraSettings, handleDetection);

        setIsInitialized(true);
        console.log('[HandCameraRefactored] System initialization completed successfully!');

      } catch (error) {
        console.error('[HandCameraRefactored] System initialization failed:', error);
        setError("Error al inicializar el sistema de detección. Revisa la consola.");
      }
    };

    initializeSystem();

    // Cleanup function
    return () => {
      console.log('[HandCameraRefactored] Cleaning up...');
      mounted = false;

      if (detectionEngineRef.current) {
        detectionEngineRef.current.cleanup();
        detectionEngineRef.current = null;
      }

      if (cameraControllerRef.current) {
        cameraControllerRef.current.stopCamera();
      }

      rendererRef.current = null;
    };
  }, [onHandDetected, width, height, setLaneFromContext, setJumpFromContext]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center rounded-lg overflow-hidden">
      {error ? (
        <div className="text-white text-center p-4">
          <p className="text-lg font-semibold">{error}</p>
          <p className="text-sm opacity-75">Verifica permisos de cámara y consola para más detalles.</p>
        </div>
      ) : (
        <>
          {/* Video element (hidden, used for MediaPipe processing) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: "cover",
              transform: "scaleX(-1)", // Mirror effect
              zIndex: 0,
            }}
          />
          
          {/* Lane indicators overlay */}
          <div className="absolute inset-0 flex pointer-events-none" style={{ zIndex: 1 }}>
            <div
              className={`flex-1 border-r-2 border-white/20 transition-colors duration-300 ${
                activeLane === "left" ? "bg-green-500/40" : "bg-white/5"
              }`}
              style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "1rem" }}
            >
              <span className="text-white text-sm font-bold uppercase drop-shadow-lg">Izquierda</span>
            </div>
            <div
              className={`flex-1 border-r-2 border-white/20 transition-colors duration-300 ${
                activeLane === "center" ? "bg-yellow-500/40" : "bg-white/5"
              }`}
              style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "1rem" }}
            >
              <span className="text-white text-sm font-bold uppercase drop-shadow-lg">Centro</span>
            </div>
            <div
              className={`flex-1 transition-colors duration-300 ${
                activeLane === "right" ? "bg-red-500/40" : "bg-white/5"
              }`}
              style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "1rem" }}
            >
              <span className="text-white text-sm font-bold uppercase drop-shadow-lg">Derecha</span>
            </div>
          </div>
          
          {/* Canvas for rendering video + landmarks */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              objectFit: "cover",
              zIndex: 2,
            }}
          />

          {/* Loading indicator */}
          {!isInitialized && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50" style={{ zIndex: 3 }}>
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Inicializando detección de manos...</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}