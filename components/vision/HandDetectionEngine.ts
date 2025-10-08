import { HandDetectionResult, CameraSettings, DetectionConfig, OnHandDetected } from './types';

export class HandDetectionEngine {
  private handDetector: any = null;
  private cameraInstance: any = null;
  private isRunning = false;
  private animationFrame: number | null = null;
  private lastFrameTime = 0;
  private frameInterval: number;
  private lastLane: "left" | "center" | "right" | null = null;
  private lastUpdateTime = 0;

  constructor(private config: DetectionConfig) {
    this.frameInterval = 1000 / config.targetFPS;
    console.log('[HandDetection] Engine initialized with config:', config);
  }

  async initialize(video: HTMLVideoElement): Promise<boolean> {
    console.log('[HandDetection] Initializing MediaPipe...');
    
    try {
      // Try tasks-vision first (newer API)
      const success = await this.initializeTasksVision(video);
      if (success) {
        console.log('[HandDetection] Tasks-vision initialized successfully');
        return true;
      }
      
      // Fallback to classic @mediapipe/hands
      console.log('[HandDetection] Falling back to classic hands API...');
      return await this.initializeClassicHands(video);
      
    } catch (error) {
      console.error('[HandDetection] Initialization failed:', error);
      return false;
    }
  }

  private async initializeTasksVision(video: HTMLVideoElement): Promise<boolean> {
    try {
      const visionModule = await import("@mediapipe/tasks-vision");
      const { FilesetResolver, HandLandmarker } = visionModule;
      
      const tasksVisionVersion = "0.10.22-rc.20250304";
      const wasmUrl = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${tasksVisionVersion}/wasm`;
      
      const vision = await FilesetResolver.forVisionTasks(wasmUrl);
      
      this.handDetector = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        numHands: this.config.maxNumHands,
        runningMode: "VIDEO",
      });
      
      console.log('[HandDetection] Tasks-vision HandLandmarker created');
      return true;
      
    } catch (error) {
      console.error('[HandDetection] Tasks-vision initialization failed:', error);
      return false;
    }
  }

  private async initializeClassicHands(video: HTMLVideoElement): Promise<boolean> {
    try {
      const [HandsModule, CameraModule] = await Promise.all([
        import("@mediapipe/hands"),
        import("@mediapipe/camera_utils")
      ]);

      // Robust constructor detection
      let CameraCtor: any = undefined;
      if (CameraModule) {
        if (typeof CameraModule.Camera === "function") CameraCtor = CameraModule.Camera;
        else if (CameraModule.default) {
          if (typeof CameraModule.default === "function") CameraCtor = CameraModule.default;
          else if (typeof CameraModule.default.Camera === "function") CameraCtor = CameraModule.default.Camera;
        }
        if (!CameraCtor && typeof window !== "undefined" && (window as any).Camera) CameraCtor = (window as any).Camera;
      }

      const getHandsConstructor = (mod: any) => {
        if (!mod) return undefined;
        if (typeof mod.Hands === "function") return mod.Hands;
        if (mod.default) {
          if (typeof mod.default === "function") return mod.default;
          if (typeof mod.default.Hands === "function") return mod.default.Hands;
        }
        if (typeof window !== "undefined" && (window as any).Hands) return (window as any).Hands;
        return undefined;
      };

      const HandsCtor = getHandsConstructor(HandsModule);

      if (!CameraCtor || !HandsCtor) {
        throw new Error("Required MediaPipe constructors not found");
      }

      const handsCdnVersion = "0.4.1675469240";
      this.handDetector = new HandsCtor({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${handsCdnVersion}/${file}`,
      });

      this.handDetector.setOptions({
        maxNumHands: this.config.maxNumHands,
        modelComplexity: this.config.modelComplexity,
        minDetectionConfidence: this.config.minDetectionConfidence,
        minTrackingConfidence: this.config.minTrackingConfidence,
      });

      // Initialize camera utils
      this.cameraInstance = new CameraCtor(video, {
        onFrame: async () => {
          if (this.handDetector && this.isRunning) {
            await this.handDetector.send({ image: video });
          }
        },
        width: video.videoWidth || 640,
        height: video.videoHeight || 480,
      });

      console.log('[HandDetection] Classic hands API initialized');
      return true;
      
    } catch (error) {
      console.error('[HandDetection] Classic hands initialization failed:', error);
      return false;
    }
  }

  startDetection(
    video: HTMLVideoElement,
    cameraSettings: CameraSettings,
    onDetection: OnHandDetected
  ): void {
    if (!this.handDetector) {
      console.error('[HandDetection] Detector not initialized');
      return;
    }

    this.isRunning = true;
    console.log('[HandDetection] Starting detection loop...');

    if (this.cameraInstance) {
      // Classic hands API with camera utils
      this.handDetector.onResults((results: any) => {
        if (!this.isRunning) return;
        this.processResults(results.multiHandLandmarks || [], cameraSettings, onDetection);
      });
      
      this.cameraInstance.start();
    } else {
      // Tasks-vision API with manual loop
      this.detectLoop(video, cameraSettings, onDetection);
    }
  }

  private detectLoop(
    video: HTMLVideoElement,
    cameraSettings: CameraSettings,
    onDetection: OnHandDetected
  ): void {
    const detect = async () => {
      if (!this.isRunning || !this.handDetector) return;

      const now = performance.now();
      if (now - this.lastFrameTime < this.frameInterval) {
        this.animationFrame = requestAnimationFrame(detect);
        return;
      }

      this.lastFrameTime = now;

      if (video.readyState >= 2) {
        try {
          const results = await this.handDetector.detectForVideo(video, now);
          const landmarks = results?.landmarks || results?.multiHandLandmarks || results?.handLandmarks || [];
          this.processResults(landmarks, cameraSettings, onDetection);
        } catch (error) {
          console.error('[HandDetection] Detection error:', error);
        }
      }

      this.animationFrame = requestAnimationFrame(detect);
    };

    detect();
  }

  private processResults(
    landmarksArray: Array<any>,
    cameraSettings: CameraSettings,
    onDetection: OnHandDetected
  ): void {
    if (!landmarksArray || landmarksArray.length === 0) {
      onDetection({
        normalizedX: NaN,
        normalizedY: NaN,
        lane: null,
        isClosed: false,
        landmarks: [],
        confidence: 0
      });
      return;
    }

    const hand = landmarksArray[0];
    const wrist = hand[0];
    
    // Apply mirroring if needed
    const rawX = wrist.x;
    const normalizedX = cameraSettings.isMirrored ? 1 - rawX : rawX;
    const normalizedY = wrist.y;
    
    // Compute lane with debouncing
    const lane = this.computeLane(normalizedX);
    const now = performance.now();
    
    if (lane !== this.lastLane && now - this.lastUpdateTime > this.config.debounceMs) {
      this.lastLane = lane;
      this.lastUpdateTime = now;
      console.log('[HandDetection] Lane changed to:', lane);
    }

    // Estimate hand state (open/closed)
    const isClosed = this.estimateHandClosure(hand);
    
    console.log('[HandDetection] Hand detected:', { 
      normalizedX: normalizedX.toFixed(3), 
      normalizedY: normalizedY.toFixed(3), 
      lane: this.lastLane,
      isClosed 
    });

    onDetection({
      normalizedX,
      normalizedY,
      lane: this.lastLane,
      isClosed,
      landmarks: hand,
      confidence: wrist.confidence || 1.0
    });
  }

  private computeLane(normalizedX: number): "left" | "center" | "right" | null {
    if (normalizedX == null || Number.isNaN(normalizedX)) return null;
    
    // Use dead zones to prevent flickering
    const deadZone = 0.07;
    
    if (normalizedX < (1/3 - deadZone)) return "left";
    if (normalizedX > (2/3 + deadZone)) return "right";
    if (normalizedX >= (1/3 + deadZone) && normalizedX <= (2/3 - deadZone)) return "center";
    
    return null; // In dead zone
  }

  private estimateHandClosure(landmarks: Array<{ x: number; y: number }>): boolean {
    if (!landmarks || landmarks.length < 21) return false;
    
    // Calculate average distance from fingertips to palm
    const palm = landmarks[0];
    const fingertips = [4, 8, 12, 16, 20]; // Thumb, index, middle, ring, pinky tips
    
    const avgDistance = fingertips
      .map(i => Math.hypot(landmarks[i].x - palm.x, landmarks[i].y - palm.y))
      .reduce((a, b) => a + b, 0) / fingertips.length;
    
    return avgDistance < 0.12; // Empirical threshold
  }

  stopDetection(): void {
    console.log('[HandDetection] Stopping detection...');
    this.isRunning = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.cameraInstance) {
      this.cameraInstance.stop?.();
    }
  }

  cleanup(): void {
    console.log('[HandDetection] Cleaning up resources...');
    this.stopDetection();
    
    try {
      if (this.handDetector) {
        this.handDetector.close?.();
        this.handDetector = null;
      }
    } catch (error) {
      console.error('[HandDetection] Cleanup error:', error);
    }
    
    this.cameraInstance = null;
  }
}