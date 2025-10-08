export class CameraController {
  private stream: MediaStream | null = null;

  async initializeCamera(
    video: HTMLVideoElement,
    width: number = 640,
    height: number = 480
  ): Promise<{ stream: MediaStream; isMirrored: boolean } | null> {
    console.log('[CameraController] Initializing camera with resolution:', width, 'x', height);
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width, height }
      });
      
      video.srcObject = this.stream;
      
      // Wait for video metadata
      await new Promise<void>((resolve) => {
        const onLoaded = () => {
          console.log('[CameraController] Video metadata loaded:', {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState
          });
          resolve();
        };
        
        video.addEventListener("loadedmetadata", onLoaded, { once: true });
        setTimeout(resolve, 2000); // Fallback timeout
      });
      
      await video.play();
      console.log('[CameraController] Video is playing');
      
      // Detect camera orientation
      const isMirrored = this.detectCameraOrientation(this.stream);
      console.log('[CameraController] Camera mirrored:', isMirrored);
      
      return { stream: this.stream, isMirrored };
      
    } catch (error) {
      console.error('[CameraController] Camera initialization failed:', error);
      return null;
    }
  }

  private detectCameraOrientation(stream: MediaStream): boolean {
    try {
      const track = stream.getVideoTracks()[0];
      const settings: any = track.getSettings?.() || {};
      const facing = settings.facingMode || settings.facing || undefined;
      
      const isFrontCamera = typeof facing === "string" && (facing === "user" || facing === "front");
      console.log('[CameraController] Detected facing mode:', facing, '-> mirrored:', isFrontCamera);
      
      return isFrontCamera;
    } catch (error) {
      console.error('[CameraController] Could not detect camera orientation:', error);
      return false; // Default to back camera (not mirrored)
    }
  }

  stopCamera(): void {
    console.log('[CameraController] Stopping camera...');
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        console.log('[CameraController] Stopped track:', track.kind);
      });
      this.stream = null;
    }
  }

  getStream(): MediaStream | null {
    return this.stream;
  }
}