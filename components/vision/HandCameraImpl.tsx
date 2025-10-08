"use client";
import React, { useEffect, useRef, useState, useContext, useCallback } from "react";
import { HandControlContext } from "./HandControlContext";

type OnHandDetected = (payload: {
  normalizedX: number;
  normalizedY: number;
  lane: "left" | "center" | "right" | null;
  isClosed: boolean;
}) => void;

interface Props {
  onHandDetected?: OnHandDetected;
  width?: number;
  height?: number;
}

// Performance constants
const TARGET_FPS = 12;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const LANE_DEBOUNCE_MS = 100;

export default function HandCameraImpl({ onHandDetected, width = 640, height = 480 }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [activeLane, setActiveLane] = useState<"left" | "center" | "right" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState(false);
  const [showCamera, setShowCamera] = useState(true); // Add toggle for camera

  // Performance refs
  const lastFrameTimeRef = useRef<number>(0);
  const lastLaneRef = useRef<"left" | "center" | "right" | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const frameCounterRef = useRef<number>(0);

  const ctx = useContext(HandControlContext as any) as any | undefined;
  const setLaneFromContext: ((lane: "left" | "center" | "right" | null) => void) | undefined = ctx?.setLane;
  const setJumpFromContext: ((j: boolean) => void) | undefined = ctx?.setJump;

  // Fixed computeLane with proper coordinate handling
  const computeLane = useCallback((normalizedX: number): "left" | "center" | "right" | null => {
    if (normalizedX == null || Number.isNaN(normalizedX)) return null;
    
    // Use dead zones to prevent flickering
    const deadZone = 0.07;
    
    if (normalizedX < (1/3 - deadZone)) return "left";
    if (normalizedX > (2/3 + deadZone)) return "right";
    if (normalizedX >= (1/3 + deadZone) && normalizedX <= (2/3 - deadZone)) return "center";
    
    return lastLaneRef.current; // Maintain current lane in dead zones
  }, []);

  // Optimized drawOverlay with proper canvas handling
  const drawOverlay = useCallback((ctx: CanvasRenderingContext2D, resultsLandmarks: Array<any> | null, video: HTMLVideoElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    
    // Always clear and draw video first
    ctx.clearRect(0, 0, w, h);
    
    if (showCamera) {
      ctx.drawImage(video, 0, 0, w, h);
    } else {
      // Fallback: solid background when camera is disabled
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, w, h);
    }
    
    ctx.save();
    
    // Grid overlay
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    
    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 3, 0);
    ctx.lineTo(w / 3, h);
    ctx.moveTo((2 * w) / 3, 0);
    ctx.lineTo((2 * w) / 3, h);
    ctx.stroke();

    // Draw landmarks if available
    if (resultsLandmarks?.[0]) {
      const hand = resultsLandmarks[0];
      
      ctx.strokeStyle = "#00FF00";
      ctx.fillStyle = "#00FF00";
      ctx.lineWidth = 2;

      const connections: Array<[number, number]> = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
      ];

      // Draw connections
      connections.forEach(([s, e]) => {
        const a = hand[s];
        const b = hand[e];
        ctx.beginPath();
        ctx.moveTo(a.x * w, a.y * h);
        ctx.lineTo(b.x * w, b.y * h);
        ctx.stroke();
      });

      // Draw landmarks
      hand.forEach((lm: any) => {
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw wrist point for reference
      if (hand[0]) {
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(hand[0].x * w, hand[0].y * h, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }, [showCamera]);

  // Optimized state updates
  const updateHandState = useCallback((lane: "left" | "center" | "right" | null, isClosed: boolean, normX: number, normY: number) => {
    const now = Date.now();
    
    // Debounce lane changes
    if (lane !== lastLaneRef.current && (now - lastUpdateTimeRef.current > LANE_DEBOUNCE_MS)) {
      setActiveLane(lane);
      lastLaneRef.current = lane;
      lastUpdateTimeRef.current = now;
      
      try {
        setLaneFromContext?.(lane);
      } catch (e) {
        console.warn('Error updating lane context:', e);
      }
    }

    // Always update jump state
    try {
      setJumpFromContext?.(isClosed);
    } catch (e) {
      console.warn('Error updating jump context:', e);
    }

    onHandDetected?.({ normalizedX: normX, normalizedY: normY, lane, isClosed });
  }, [onHandDetected, setLaneFromContext, setJumpFromContext]);

  // Camera setup with better resolution balance
  const startCamera = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, // Better resolution for detection
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 }
        } 
      });
      
      video.srcObject = stream;
      
      await new Promise<void>((resolve) => {
        const onLoaded = () => {
          // Set canvas to match video dimensions for proper coordinate mapping
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          resolve();
        };
        
        video.addEventListener("loadedmetadata", onLoaded, { once: true });
        setTimeout(resolve, 2000);
      });
      
      await video.play();
      
      // Detect camera orientation
      try {
        const track = stream.getVideoTracks()[0];
        const settings: any = track.getSettings?.() || {};
        const facing = settings.facingMode || settings.facing || undefined;
        setIsMirrored(typeof facing === "string" && (facing === "user" || facing === "front"));
      } catch (e) {
        setIsMirrored(false);
      }
      
      return stream;
    } catch (err: any) {
      setError("No se pudo acceder a la cámara. Verificá permisos y https/localhost.");
      console.error('Camera error:', err);
      return null;
    }
  }, []);

  // MediaPipe initialization with better configuration
  const initializeHandDetection = useCallback(async (stream: MediaStream) => {
    try {
      const [HandsModule, CameraModule] = await Promise.all([
        import("@mediapipe/hands"),
        import("@mediapipe/camera_utils")
      ]);

      // Get constructors with more robust detection
      let CameraCtor: any = undefined;
      if (CameraModule) {
        if (typeof CameraModule.Camera === "function") CameraCtor = CameraModule.Camera;
        else if (CameraModule.default) {
          if (typeof CameraModule.default === "function") CameraCtor = CameraModule.default;
          else if (typeof CameraModule.default.Camera === "function") CameraCtor = CameraModule.default.Camera;
        }
        if (!CameraCtor && typeof window !== "undefined" && (window as any).Camera) CameraCtor = (window as any).Camera;
      }

      // The @mediapipe packages sometimes export differently depending on bundler/UMD/Esm.
      // Be defensive and support multiple shapes: named export, default, or global-like factory.
      const getHandsConstructor = (mod: any) => {
        if (!mod) return undefined;
        // named export
        if (typeof mod.Hands === "function") return mod.Hands;
        // default export could be the factory/class or an object with Hands
        if (mod.default) {
          if (typeof mod.default === "function") return mod.default;
          if (typeof mod.default.Hands === "function") return mod.default.Hands;
        }
        // some builds attach to window (UMD); try to pick window.Hands if available
        if (typeof window !== "undefined" && (window as any).Hands) return (window as any).Hands;
        return undefined;
      };

      const HandsCtor = getHandsConstructor(HandsModule);

      if (!CameraCtor || !HandsCtor) {
        throw new Error("Required MediaPipe constructors not found");
      }

      const handsCdnVersion = "0.4.1675469240";
      const handsInstance = new HandsCtor({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${handsCdnVersion}/${file}`,
      });

      // Better configuration for accuracy/performance balance:cite[3]:cite[5]
      handsInstance.setOptions({
        maxNumHands: 1,
        modelComplexity: 0, // Use lite model for better performance
        minDetectionConfidence: 0.6, // Balanced threshold
        minTrackingConfidence: 0.5,
      });

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return null;

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      let lastProcessedTime = 0;

      handsInstance.onResults((results: any) => {
        const now = performance.now();
        
        // Consistent frame rate control
        if (now - lastProcessedTime < FRAME_INTERVAL) return;
        lastProcessedTime = now;
        frameCounterRef.current++;

        const multi = results.multiHandLandmarks || [];
        
        // Always draw overlay for consistent visual feedback
        drawOverlay(ctx, multi.length > 0 ? multi : null, video);

        if (multi.length > 0) {
          const hand = multi[0];
          const wrist = hand[0];
          const rawX = wrist.x;
          const normX = isMirrored ? 1 - rawX : rawX;
          const normY = wrist.y;
          const lane = computeLane(normX);

          const palm = hand[0];
          const tips = [4, 8, 12, 16, 20]
            .map((i) => Math.hypot(hand[i].x - palm.x, hand[i].y - palm.y))
            .reduce((a, b) => a + b, 0) / 5;
          const isClosed = tips < 0.12;

          updateHandState(lane, isClosed, normX, normY);
        } else {
          updateHandState(null, false, NaN, NaN);
        }
      });

      const cameraInstance = new CameraCtor(video, {
        onFrame: async () => {
          try {
            await handsInstance.send({ image: video });
          } catch (err) {
            console.warn('Frame processing error:', err);
          }
        },
        width: video.videoWidth,
        height: video.videoHeight,
      });

      await cameraInstance.start();
      return { handsInstance, cameraInstance };
      
    } catch (err) {
      console.error('Hand detection initialization error:', err);
      setError("Error inicializando detección de manos.");
      return null;
    }
  }, [computeLane, drawOverlay, isMirrored, updateHandState]);

  // Main effect
  useEffect(() => {
    if (typeof window === "undefined") return;

    let running = true;
    let stream: MediaStream | null = null;
    let detectionInstances: any = null;

    const initialize = async () => {
      try {
        stream = await startCamera();
        if (stream && running) {
          detectionInstances = await initializeHandDetection(stream);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError("Error al inicializar la aplicación.");
      }
    };

    initialize();

    return () => {
      running = false;
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Cleanup MediaPipe instances
      if (detectionInstances) {
        try {
          detectionInstances.handsInstance?.close?.();
          detectionInstances.cameraInstance?.stop?.();
        } catch (err) {
          console.warn('Cleanup warning:', err);
        }
      }
    };
  }, [startCamera, initializeHandDetection]);

  return (
    <div className="relative bg-black flex items-center justify-center rounded-lg overflow-hidden"
         style={{ width: '100%', height: '100%', minHeight: '200px' }}>
      
      {error ? (
        <div className="text-white text-center p-4">
          <p className="text-lg font-semibold">{error}</p>
          <p className="text-sm opacity-75">Verifica permisos de cámara y consola para más detalles.</p>
        </div>
      ) : (
        <>
          {/* Camera toggle button */}
          <button 
            className="absolute top-2 right-2 z-20 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
            onClick={() => setShowCamera(!showCamera)}
          >
            {showCamera ? 'Ocultar Cámara' : 'Mostrar Cámara'}
          </button>

          {/* Video element (always active for processing) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: isMirrored ? "scaleX(-1)" : "scaleX(1)",
              zIndex: 0,
              opacity: showCamera ? 1 : 0 // Hide visually but keep processing
            }}
          />
          
          {/* Lane indicators */}
          <div className="absolute inset-0 flex pointer-events-none" style={{ zIndex: 1 }}>
            {(['left', 'center', 'right'] as const).map((lane) => (
              <div
                key={lane}
                className={`flex-1 border-r-2 border-white/20 transition-colors duration-300 ${
                  activeLane === lane ? 
                  lane === 'left' ? 'bg-green-500/40' : 
                  lane === 'center' ? 'bg-yellow-500/40' : 'bg-red-500/40' 
                  : 'bg-white/5'
                }`}
                style={{ 
                  display: "flex", 
                  alignItems: "flex-end", 
                  justifyContent: "center", 
                  paddingBottom: "1rem",
                  borderRight: lane === 'right' ? 'none' : undefined
                }}
              >
                <span className="text-white text-sm font-bold uppercase drop-shadow-lg">
                  {lane === 'left' ? 'Izquierda' : lane === 'center' ? 'Centro' : 'Derecha'}
                </span>
              </div>
            ))}
          </div>
          
          {/* Canvas for overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              objectFit: "cover",
              zIndex: 2,
            }}
          />

          {/* Debug info */}
          <div className="absolute top-2 left-2 text-white text-xs bg-black/50 p-1 rounded z-10">
            Lane: {activeLane} | FPS: {TARGET_FPS} | Camera: {showCamera ? 'On' : 'Off'}
          </div>
        </>
      )}
    </div>
  );
}