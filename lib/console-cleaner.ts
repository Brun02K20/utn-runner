/**
 * Console Cleaner - Limpia la consola de mensajes no deseados de librerías
 * Mantiene solo errores críticos y mensajes manuales específicos
 */

// Guardar las funciones originales
const originalLog = console.log;
const originalWarn = console.warn;
const originalInfo = console.info;
const originalError = console.error;

// Lista de palabras clave que indican mensajes de librerías que queremos filtrar
const LIBRARY_KEYWORDS = [
  // MediaPipe
  'MediaPipe',
  'MEDIAPIPE',
  'mediapipe',
  'Hands',
  'HandLandmarker',
  'hand_landmarker',
  'tasks-vision',
  '@mediapipe',
  
  // TensorFlow
  'TFJS',
  'TensorFlow',
  'tensorflow',
  '@tensorflow',
  'tf.js',
  'webgl',
  'WebGL',
  'WEBGL',
  'kernelRegistry',
  'backendRegistry',
  'GPU',
  'gpu',
  
  // Three.js / React Three Fiber
  'THREE',
  'Three.js',
  'three.js',
  'R3F',
  'react-three-fiber',
  '@react-three',
  'drei',
  'fiber',
  'WebGLRenderer',
  'WebGLProgram',
  'WebGLShader',
  'gl.getExtension',
  'gl.createShader',
  'ANGLE_instanced_arrays',
  'OES_vertex_array_object',
  'OES_element_index_uint',
  
  // Canvas/WebGL general
  'Canvas',
  'canvas',
  'getContext',
  'webgl2',
  'WebGL2',
  'shader',
  'Shader',
  'program',
  'Program',
  'buffer',
  'Buffer',
  'texture',
  'Texture',
  'framebuffer',
  'Framebuffer',
  
  // Three.js objetos específicos
  'geometry',
  'Geometry',
  'material',
  'Material',
  'mesh',
  'Mesh',
  'scene',
  'Scene',
  'camera',
  'Camera',
  'renderer',
  'Renderer',
  'dispose',
  'Dispose',
  
  // Performance/Animation
  'requestAnimationFrame',
  'RAF',
  'raf',
  'deltaTime',
  'frameTime',
  'memory',
  'Memory',
  'GC',
  'garbage collect',
  
  // Next.js/React dev warnings comunes
  'Warning:',
  'React DevTools',
  'DevTools',
  'HMR',
  'Hot Module Replacement',
  'Fast Refresh',
  'webpack',
  'Webpack',
  
  // Expo/React Native (si aparecen)
  'expo',
  'Expo',
  'react-native',
  'ReactNative',
  
  // Otras librerías comunes
  'zustand',
  'jotai',
  'radix',
  'Radix',
  '@radix-ui',
  'lucide',
  'Lucide',
  'framer',
  'Framer'
];

// Lista de prefijos de mensajes que queremos mantener (nuestros logs manuales)
const KEEP_PREFIXES = [
  '[GAME]',
  '[DEBUG]',
  '[USER]',
  '[MANUAL]',
  '[CUSTOM]',
  '[ERROR]',
  '[WARN]',
  '[INFO]',
  'Game Time Manager:',
  'Freeze detected:',
  'Recovering from freeze:'
];

// Patrones específicos de mensajes comunes que queremos filtrar
const FILTER_PATTERNS = [
  // MediaPipe específicos
  /Failed to load module script:/,
  /Uncaught.*MediaPipe/,
  /hands\.js/,
  /task.*vision/,
  /Unable to load.*wasm/,
  /WASM.*loading/,
  
  // TensorFlow específicos
  /TFJS.*kernel/,
  /WebGL.*extension/,
  /GL.*error/,
  /shader.*compilation/,
  /Unable to.*GPU/,
  /Backend.*registration/,
  /Platform.*browser/,
  
  // Three.js específicos
  /THREE\.WebGL/,
  /gl\.getShaderInfoLog/,
  /Program Info Log/,
  /WebGL.*deprecated/,
  /OES_.*not supported/,
  /ANGLE_.*not available/,
  
  // React/Next.js dev warnings
  /Warning.*React/,
  /componentWillReceiveProps/,
  /componentWillMount/,
  /findDOMNode/,
  /deprecated/i,
  /Dev server/,
  /webpack.*compiled/,
  
  // Performance/Animation comunes
  /requestAnimationFrame.*cancelled/,
  /Frame.*dropped/,
  /Performance.*entry/,
  /Memory.*usage/,
];

/**
 * Verifica si un mensaje debe ser filtrado
 */
function shouldFilterMessage(args: any[]): boolean {
  // Si no hay argumentos, filtrar
  if (!args || args.length === 0) return true;
  
  const firstArg = String(args[0]);
  const fullMessage = args.join(' ');
  
  // Mantener mensajes con prefijos específicos
  if (KEEP_PREFIXES.some(prefix => firstArg.includes(prefix))) {
    return false;
  }
  
  // Filtrar por patrones regex específicos
  if (FILTER_PATTERNS.some(pattern => pattern.test(fullMessage))) {
    return true;
  }
  
  // Filtrar mensajes de librerías por keywords
  if (LIBRARY_KEYWORDS.some(keyword => fullMessage.toLowerCase().includes(keyword.toLowerCase()))) {
    return true;
  }
  
  // Filtrar mensajes muy largos (probablemente de librerías)
  if (firstArg.length > 200) {
    return true;
  }
  
  // Filtrar mensajes que contienen URLs de librerías
  if (firstArg.includes('http') && (
    firstArg.includes('cdn.jsdelivr') || 
    firstArg.includes('unpkg.com') ||
    firstArg.includes('tensorflow') ||
    firstArg.includes('mediapipe') ||
    firstArg.includes('threejs') ||
    firstArg.includes('github.com')
  )) {
    return true;
  }
  
  // Filtrar mensajes que empiezan con números (timestamps de librerías)
  if (/^\d+(\.\d+)?:/.test(firstArg)) {
    return true;
  }
  
  // Filtrar mensajes con brackets típicos de librerías [LibName]
  if (/^\[[\w\-\.]+\]/.test(firstArg) && !KEEP_PREFIXES.some(prefix => firstArg.includes(prefix))) {
    return true;
  }
  
  return false;
}

/**
 * Configura la limpieza de consola
 */
export function setupConsoleCleaner() {
  // Solo en desarrollo, en producción silenciar más agresivamente
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // En producción, silenciar casi todo excepto errores críticos
    console.log = () => {};
    console.info = () => {};
    console.warn = (...args) => {
      // Solo mostrar warnings críticos (con nuestros prefijos)
      if (!shouldFilterMessage(args)) {
        originalWarn(...args);
      }
    };
  } else {
    // En desarrollo, filtrar selectivamente
    console.log = (...args) => {
      if (!isCleanerEnabled || !shouldFilterMessage(args)) {
        originalLog(...args);
      }
    };
    
    console.info = (...args) => {
      if (!isCleanerEnabled || !shouldFilterMessage(args)) {
        originalInfo(...args);
      }
    };
    
    console.warn = (...args) => {
      if (!isCleanerEnabled || !shouldFilterMessage(args)) {
        originalWarn(...args);
      }
    };
  }
  
  // Mantener errores siempre (pero filtrar algunos spam)
  console.error = (...args) => {
    const firstArg = String(args[0]);
    
    // Filtrar algunos errores conocidos que no son críticos
    if (
      firstArg.includes('Non-critical') ||
      firstArg.includes('deprecated') ||
      firstArg.includes('Deprecation') ||
      (firstArg.includes('Warning') && LIBRARY_KEYWORDS.some(k => firstArg.includes(k)))
    ) {
      return;
    }
    
    originalError(...args);
  };
  
  console.log('[GAME] Console cleaner activated');
}

/**
 * Restaura las funciones originales de consola
 */
export function restoreConsole() {
  console.log = originalLog;
  console.warn = originalWarn;
  console.info = originalInfo;
  console.error = originalError;
  
  console.log('[GAME] Console restored to original state');
}

/**
 * Funciones helper para logging manual (siempre visible)
 */
export const gameLog = {
  info: (...args: any[]) => originalLog('[GAME]', ...args),
  warn: (...args: any[]) => originalWarn('[GAME]', ...args),
  error: (...args: any[]) => originalError('[GAME]', ...args),
  debug: (...args: any[]) => originalLog('[DEBUG]', ...args),
  user: (...args: any[]) => originalLog('[USER]', ...args)
};

/**
 * Control global para habilitar/deshabilitar la limpieza
 * Útil para debugging temporal
 */
let isCleanerEnabled = true;

export function enableConsoleCleaner() {
  isCleanerEnabled = true;
  gameLog.info('Console cleaner enabled');
}

export function disableConsoleCleaner() {
  isCleanerEnabled = false;
  gameLog.info('Console cleaner disabled - all logs will show');
}

// Exponer controles globalmente para debugging
if (typeof window !== 'undefined') {
  (window as any).enableConsoleCleaner = enableConsoleCleaner;
  (window as any).disableConsoleCleaner = disableConsoleCleaner;
}

// Configuraciones específicas de librerías
export function configureLibraryLogging() {
  if (typeof window !== 'undefined') {
    const configureLibraries = () => {
      try {
        // MediaPipe configuraciones
        if ((window as any).MediaPipe) {
          const mp = (window as any).MediaPipe;
          if (mp.setOptions) {
            mp.setOptions({ logLevel: 'ERROR' });
          }
          if (mp.config) {
            mp.config.logLevel = 'ERROR';
          }
        }
        
        // TensorFlow.js configuraciones
        if ((window as any).tf) {
          const tf = (window as any).tf;
          if (tf.enableProdMode) {
            tf.enableProdMode();
          }
          if (tf.env && tf.env().set) {
            // Reducir warnings de WebGL
            tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', -1);
            tf.env().set('WEBGL_FORCE_F16_TEXTURES', false);
            tf.env().set('WEBGL_PACK', false);
            tf.env().set('WEBGL_EXP_CONV', false);
            tf.env().set('DEBUG', false);
          }
          // Silenciar warnings específicos de TensorFlow
          if (tf.util && tf.util.warn) {
            tf.util.warn = () => {};
          }
        }
        
        // Three.js configuraciones si existe
        if ((window as any).THREE) {
          // Reducir warnings de Three.js si es posible
          const THREE = (window as any).THREE;
          if (THREE.Object3D && THREE.Object3D.DefaultUp) {
            // Configuraciones que reduzcan warnings
          }
        }
        
        // React Three Fiber - silenciar warnings de desarrollo
        if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          const devtools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
          if (devtools.onCommitFiberRoot) {
            const originalCommit = devtools.onCommitFiberRoot;
            devtools.onCommitFiberRoot = (id: any, root: any, ...args: any[]) => {
              try {
                // Silenciar errors no críticos de R3F
                return originalCommit(id, root, ...args);
              } catch (e) {
                // Ignorar errores de devtools
              }
            };
          }
        }
        
        gameLog.debug('Library logging configured');
      } catch (e) {
        // Ignorar errores de configuración
        gameLog.debug('Some library configurations failed (expected)');
      }
    };
    
    // Ejecutar inmediatamente
    configureLibraries();
    
    // También ejecutar después de que las librerías se carguen
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', configureLibraries);
    }
    
    // Intentar múltiples veces para asegurar configuración
    setTimeout(configureLibraries, 500);
    setTimeout(configureLibraries, 2000);
    setTimeout(configureLibraries, 5000);
  }
}