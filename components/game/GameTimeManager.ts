// Game Time Manager - Centralized time system for consistent game timing
import { gameLog } from '../../lib/console-cleaner';

class GameTimeManager {
  private static instance: GameTimeManager;
  
  // Game time accumulates with deltaTime, not real time
  private gameTime: number = 0;
  private lastRealTime: number = 0;
  private isPaused: boolean = false;
  private pauseStartTime: number = 0;
  
  // Delta time smoothing and limiting
  private readonly MAX_DELTA_TIME = 0.05; // 50ms max (20 FPS minimum)
  private readonly EXTREME_DELTA_THRESHOLD = 0.2; // 200ms - skip physics if exceeded
  private readonly SMOOTHING_SAMPLES = 5;
  private deltaHistory: number[] = [];
  private smoothedDelta: number = 1/60; // Start at 60fps equivalent
  
  // For debugging and monitoring
  private frameCount: number = 0;
  private fpsHistory: number[] = [];
  private currentFPS: number = 60;
  private freezeDetectedCount: number = 0;
  private extremeFrameCount: number = 0;

  private constructor() {
    this.lastRealTime = performance.now();
  }

  static getInstance(): GameTimeManager {
    if (!GameTimeManager.instance) {
      GameTimeManager.instance = new GameTimeManager();
    }
    return GameTimeManager.instance;
  }

  /**
   * Update game time with deltaTime from the main game loop
   * Call this once per frame from useFrame
   * Returns the processed deltaTime that should be used for game logic
   */
  updateTime(rawDeltaTime: number): { 
    processedDelta: number; 
    shouldSkipPhysics: boolean;
    isRecoveringFromFreeze: boolean;
  } {
    if (this.isPaused) {
      return { 
        processedDelta: 0, 
        shouldSkipPhysics: true, 
        isRecoveringFromFreeze: false 
      };
    }
    
    // Detect extreme frames (freeze recovery)
    const isExtremeFrame = rawDeltaTime > this.EXTREME_DELTA_THRESHOLD;
    const isRecoveringFromFreeze = rawDeltaTime > this.MAX_DELTA_TIME * 2;
    
    if (isExtremeFrame) {
      this.extremeFrameCount++;
      gameLog.warn(`Extreme frame detected: ${(rawDeltaTime * 1000).toFixed(1)}ms - skipping physics`);
      
      // Don't update game time for extreme frames to prevent jumps
      return { 
        processedDelta: 0, 
        shouldSkipPhysics: true, 
        isRecoveringFromFreeze: true 
      };
    }
    
    // Limit deltaTime to prevent huge jumps
    const clampedDelta = Math.min(rawDeltaTime, this.MAX_DELTA_TIME);
    
    // Add to smoothing history
    this.deltaHistory.push(clampedDelta);
    if (this.deltaHistory.length > this.SMOOTHING_SAMPLES) {
      this.deltaHistory.shift();
    }
    
    // Calculate smoothed delta (moving average)
    this.smoothedDelta = this.deltaHistory.reduce((sum, d) => sum + d, 0) / this.deltaHistory.length;
    
    // Use smoothed delta for game time accumulation
    this.gameTime += this.smoothedDelta;
    this.frameCount++;
    
    // Detect freeze recovery
    if (isRecoveringFromFreeze) {
      this.freezeDetectedCount++;
      gameLog.info(`Freeze recovery: raw=${(rawDeltaTime * 1000).toFixed(1)}ms, smoothed=${(this.smoothedDelta * 1000).toFixed(1)}ms`);
    }
    
    // Update FPS tracking for debugging
    const now = performance.now();
    if (now - this.lastRealTime > 1000) { // Every second
      this.currentFPS = this.frameCount;
      this.fpsHistory.push(this.currentFPS);
      if (this.fpsHistory.length > 10) this.fpsHistory.shift();
      
      // Log performance stats
      if (this.freezeDetectedCount > 0 || this.extremeFrameCount > 0) {
        gameLog.debug(`Performance: FPS=${this.currentFPS}, freezes=${this.freezeDetectedCount}, extreme=${this.extremeFrameCount}`);
        this.freezeDetectedCount = 0;
        this.extremeFrameCount = 0;
      }
      
      this.frameCount = 0;
      this.lastRealTime = now;
      
      // Log if FPS is significantly low
      if (this.currentFPS < 30) {
        gameLog.debug(`Low FPS detected: ${this.currentFPS}, smoothed delta: ${(this.smoothedDelta * 1000).toFixed(1)}ms`);
      }
    }
    
    return { 
      processedDelta: this.smoothedDelta, 
      shouldSkipPhysics: false,
      isRecoveringFromFreeze 
    };
  }

  /**
   * Get current game time (accumulated deltaTime)
   */
  getGameTime(): number {
    return this.gameTime;
  }

  /**
   * Check if enough game time has passed since lastTime
   */
  hasTimeElapsed(lastTime: number, interval: number): boolean {
    return this.gameTime - lastTime >= interval;
  }

  /**
   * Get time for next event based on interval
   */
  getNextEventTime(interval: number): number {
    return this.gameTime + interval;
  }

  /**
   * Pause/unpause game time
   */
  setPaused(paused: boolean): void {
    if (paused && !this.isPaused) {
      this.pauseStartTime = this.gameTime;
    }
    this.isPaused = paused;
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * Reset game time (for restart)
   */
  reset(): void {
    this.gameTime = 0;
    this.frameCount = 0;
    this.fpsHistory = [];
    this.currentFPS = 60;
    this.isPaused = false;
    this.pauseStartTime = 0;
    this.lastRealTime = performance.now();
    
    // Reset smoothing system
    this.deltaHistory = [];
    this.smoothedDelta = 1/60;
    this.freezeDetectedCount = 0;
    this.extremeFrameCount = 0;
    
    gameLog.info('Game time reset with smoothing system');
  }

  /**
   * Get current FPS for debugging
   */
  getCurrentFPS(): number {
    return this.currentFPS;
  }

  /**
   * Get average FPS over last 10 seconds
   */
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
  }

  /**
   * Get current smoothed delta time
   */
  getSmoothedDelta(): number {
    return this.smoothedDelta;
  }

  /**
   * Get performance stats for debugging
   */
  getPerformanceStats(): {
    currentFPS: number;
    averageFPS: number;
    smoothedDeltaMs: number;
    maxDeltaMs: number;
    isStable: boolean;
  } {
    return {
      currentFPS: this.currentFPS,
      averageFPS: this.getAverageFPS(),
      smoothedDeltaMs: this.smoothedDelta * 1000,
      maxDeltaMs: this.MAX_DELTA_TIME * 1000,
      isStable: this.getAverageFPS() > 45 && this.smoothedDelta < this.MAX_DELTA_TIME * 0.8
    };
  }

  /**
   * Calculate progress of a timed event (0 to 1)
   */
  getEventProgress(startTime: number, duration: number): number {
    const elapsed = this.gameTime - startTime;
    return Math.min(Math.max(elapsed / duration, 0), 1);
  }

  /**
   * Check if a timed event is complete
   */
  isEventComplete(startTime: number, duration: number): boolean {
    return this.gameTime - startTime >= duration;
  }
}

// Export singleton instance
export const gameTimeManager = GameTimeManager.getInstance();