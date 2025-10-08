# Hand Detection System - Refactored Architecture

## 📋 Overview

This refactored hand detection system separates concerns into distinct, modular components for better maintainability, testing, and reusability. The system processes video from a camera, detects hand landmarks using MediaPipe, and renders the results in real-time.

## 🏗️ Architecture

### Core Modules

#### 1. **Types** (`types.ts`)
- `HandDetectionResult`: Structure for detection results
- `CameraSettings`: Camera configuration
- `DetectionConfig`: MediaPipe configuration
- `OnHandDetected`: Callback type for detection events

#### 2. **HandDetectionEngine** (`HandDetectionEngine.ts`)
**Purpose**: Pure hand detection logic using MediaPipe
- Initializes MediaPipe (tasks-vision or classic hands API)
- Processes video frames for hand landmarks
- Computes hand position, lane, and open/closed state
- Provides performance optimization with FPS limiting and debouncing
- **Logging**: Detailed detection events and performance metrics

**Key Methods**:
```typescript
async initialize(video: HTMLVideoElement): Promise<boolean>
startDetection(video, cameraSettings, onDetection): void
stopDetection(): void
cleanup(): void
```

#### 3. **VideoRenderer** (`VideoRenderer.ts`)
**Purpose**: Pure rendering logic for video and overlays
- Draws video frames to canvas
- Renders hand landmarks and skeleton
- Draws lane indicators and overlays
- Handles canvas operations efficiently
- **Logging**: FPS monitoring and render statistics

**Key Methods**:
```typescript
render(detectionResult, activeLane): void
drawHandLandmarks(landmarks): void
drawOverlayGrid(activeLane): void
resize(width, height): void
```

#### 4. **CameraController** (`CameraController.ts`)
**Purpose**: Camera management and video stream handling
- Initializes getUserMedia
- Detects camera orientation (front/back)
- Manages video metadata and playback
- **Logging**: Camera initialization and stream events

**Key Methods**:
```typescript
async initializeCamera(video, width, height): Promise<{stream, isMirrored}>
stopCamera(): void
getStream(): MediaStream | null
```

#### 5. **HandCameraRefactored** (`HandCameraRefactored.tsx`)
**Purpose**: React component orchestrating all modules
- Manages React lifecycle and state
- Coordinates between detection, rendering, and camera
- Handles context integration
- **Logging**: System-level initialization and coordination

## 🚀 Usage

### Simple Usage (Drop-in Replacement)
```tsx
import { HandCameraRefactored } from './components/vision';

function MyComponent() {
  const handleHandDetected = (result) => {
    console.log('Hand detected:', result.lane, result.isClosed);
  };

  return (
    <HandCameraRefactored
      onHandDetected={handleHandDetected}
      width={640}
      height={480}
    />
  );
}
```

### Advanced Usage (Custom Implementation)
```typescript
import { 
  HandDetectionEngine, 
  VideoRenderer, 
  CameraController, 
  DetectionConfig 
} from './components/vision';

const customConfig: DetectionConfig = {
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.6,
  targetFPS: 30,
  debounceMs: 50
};

const engine = new HandDetectionEngine(customConfig);
// ... custom initialization and processing
```

## 📊 Logging System

Each module provides detailed logging for debugging:

### Detection Logs
- `[HandDetection]` - MediaPipe initialization, hand detection events, lane changes
- Performance metrics and error handling

### Rendering Logs  
- `[VideoRenderer]` - FPS monitoring, landmark rendering, canvas operations
- Visual debugging information

### Camera Logs
- `[CameraController]` - Camera initialization, stream events, orientation detection
- Hardware and permission issues

### System Logs
- `[HandCameraRefactored]` - Overall system coordination and lifecycle events

## 🔧 Configuration

### Detection Configuration
```typescript
const config: DetectionConfig = {
  maxNumHands: 1,           // Number of hands to detect
  modelComplexity: 0,       // 0=lite, 1=full (performance vs accuracy)
  minDetectionConfidence: 0.6,  // Detection threshold
  minTrackingConfidence: 0.5,   // Tracking threshold  
  targetFPS: 25,            // Target processing FPS
  debounceMs: 100          // Lane change debouncing
};
```

### Camera Settings
```typescript
const cameraSettings: CameraSettings = {
  width: 640,
  height: 480,
  isMirrored: true  // Automatically detected for front cameras
};
```

## 🎯 Benefits of Refactoring

### 1. **Separation of Concerns**
- **Detection**: Pure MediaPipe logic, no rendering concerns
- **Rendering**: Pure canvas operations, no detection logic
- **Camera**: Pure hardware interface, no processing logic

### 2. **Modularity**
- Each module can be used independently
- Easy to test individual components
- Pluggable architecture for custom implementations

### 3. **Maintainability**
- Clear responsibilities for each module
- Logging separated by concern
- Easy to debug specific issues

### 4. **Performance**
- Optimized rendering loop
- FPS limiting and frame skipping
- Efficient canvas operations

### 5. **Extensibility**
- Easy to add new detection algorithms
- Custom rendering styles
- Different camera configurations

## 🔄 Migration from Original

The refactored component maintains the same external API:

```tsx
// Old
import HandCameraImpl from './HandCameraImpl';

// New (drop-in replacement)
import { HandCameraRefactored as HandCameraImpl } from './components/vision';

// Usage remains the same
<HandCameraImpl onHandDetected={callback} width={640} height={480} />
```

## 🐛 Debugging

Enable detailed logging by checking browser console:
- Detection issues: Look for `[HandDetection]` logs
- Rendering problems: Check `[VideoRenderer]` logs  
- Camera problems: Monitor `[CameraController]` logs
- Integration issues: Review `[HandCameraRefactored]` logs

Each log includes relevant context data for easier debugging.

## 📦 File Structure

```
components/vision/
├── types.ts                    # Shared type definitions
├── HandDetectionEngine.ts      # Detection logic
├── VideoRenderer.ts            # Rendering logic  
├── CameraController.ts         # Camera management
├── HandCameraRefactored.tsx    # Main React component
├── HandCameraImpl.tsx          # Original component (legacy)
├── examples.tsx                # Usage examples
├── index.ts                    # Module exports
└── README.md                   # This documentation
```