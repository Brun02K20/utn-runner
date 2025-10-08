# Console Cleaner System

Sistema de limpieza de consola que filtra mensajes no deseados de librerías (MediaPipe, TensorFlow.js, Three.js, etc.) mientras preserva errores críticos y logs manuales.

## 🎯 Características

### ✅ **Filtra Automáticamente**
- ❌ Warnings de MediaPipe / TensorFlow.js
- ❌ Mensajes de Three.js / React Three Fiber  
- ❌ Logs de WebGL / Canvas
- ❌ Warnings de desarrollo de React/Next.js
- ❌ Mensajes largos de librerías (>200 caracteres)
- ❌ URLs de CDNs y librerías

### ✅ **Preserva Siempre**
- ✅ Errores críticos (`console.error`)
- ✅ Logs con prefijos manuales: `[GAME]`, `[DEBUG]`, `[USER]`
- ✅ Mensajes del GameTimeManager

## 🚀 Uso

### **Automático**
El sistema se activa automáticamente al cargar la aplicación.

### **Logging Manual**
```typescript
import { gameLog } from '@/lib/console-cleaner';

// Estos logs SIEMPRE se muestran
gameLog.info('Información del juego');
gameLog.warn('Advertencia importante');
gameLog.error('Error crítico');
gameLog.debug('Información de debug');
gameLog.user('Acción del usuario');
```

### **Control Temporal**
En la consola del navegador puedes controlar la limpieza:

```javascript
// Deshabilitar filtrado temporalmente (para debugging)
disableConsoleCleaner();

// Rehabilitar filtrado
enableConsoleCleaner();
```

## 📝 Configuración

### **Modo Desarrollo**
- Filtra selectivamente mensajes de librerías
- Mantiene logs manuales y errores
- Permite control temporal

### **Modo Producción**
- Silencia casi todos los logs excepto errores críticos
- Máximo rendimiento

## 🔧 Personalización

Para modificar qué mensajes se filtran, edita `/lib/console-cleaner.ts`:

```typescript
// Agregar nuevas palabras clave a filtrar
const LIBRARY_KEYWORDS = [
  'MiLibreria',
  'nuevo-warning',
  // ...
];

// Agregar nuevos prefijos a preservar
const KEEP_PREFIXES = [
  '[MI_APP]',
  '[CUSTOM]',
  // ...
];
```

## 🎮 Estado Actual

- ✅ **Integrado**: Activado automáticamente en la aplicación
- ✅ **GameTimeManager**: Usa logging limpio (`gameLog.*`)
- ✅ **Debug Panel**: Habilitado con `visible={true}`
- ✅ **Controles**: Disponibles en `window.enableConsoleCleaner()` / `window.disableConsoleCleaner()`

## 🧪 Testing

1. **Ejecuta** `pnpm dev`
2. **Abre** DevTools (F12)
3. **Observa** consola limpia sin warnings de librerías
4. **Prueba** controles: `disableConsoleCleaner()` en consola
5. **Verifica** que logs del juego aparecen con prefijo `[GAME]`

El objetivo es tener una consola limpia y legible, enfocada en la información relevante del juego.