# Game Time Synchronization System

## Problema Solucionado

Antes del cambio, el juego mezclaba diferentes sistemas de tiempo:
- **Movimiento del jugador**: Basado en FPS (deltaTime de Three.js)
- **Spawn de obstáculos**: Basado en tiempo real (`setInterval` con `Date.now()`)
- **Duración de saltos**: Basado en tiempo real (`Date.now()`)
- **Invulnerabilidad**: Basado en tiempo real (`setInterval`)

Esto causaba **desincronización** cuando bajaban los FPS:
- El jugador se movía más lento ✅ (correcto)
- Los obstáculos seguían apareciendo a velocidad normal ❌ (problema)
- Los saltos duraban lo mismo en tiempo real ❌ (problema)
- La invulnerabilidad duraba lo mismo ❌ (problema)

## Solución Implementada

### 1. GameTimeManager (Singleton)
Centraliza todo el manejo de tiempo del juego:

```typescript
// Tiempo del juego acumulado con deltaTime
gameTime += deltaTime

// Verificar si pasó suficiente tiempo de juego
hasTimeElapsed(lastTime, interval)

// Calcular progreso de eventos (0 a 1)
getEventProgress(startTime, duration)
```

### 2. Sistemas Unificados

#### **Movimiento del Jugador**
```typescript
// Antes: Solo deltaTime
const newZ = positionZ + GAME_CONFIG.playerSpeed

// Ahora: Normalizado a 60fps equivalente
const movementSpeed = GAME_CONFIG.playerSpeed * delta * 60
const newZ = positionZ + movementSpeed
```

#### **Spawn de Obstáculos**
```typescript
// Antes: Tiempo real
if (Date.now() / 1000 - lastObstacleSpawn > interval)

// Ahora: Tiempo de juego
if (gameTimeManager.hasTimeElapsed(lastObstacleSpawn, interval))
```

#### **Sistema de Saltos**
```typescript
// Antes: Tiempo real
const elapsed = (Date.now() - jumpStartTime) / 1000
const progress = elapsed / GAME_CONFIG.jump.duration

// Ahora: Tiempo de juego
const jumpProgress = gameTimeManager.getEventProgress(jumpStartTime, duration)
```

#### **Invulnerabilidad**
```typescript
// Antes: setInterval con Date.now()
setInterval(() => {
  if (Date.now() >= invulnerabilityEndTime) { /* */ }
}, 100)

// Ahora: Verificación en el loop principal
if (gameTimeManager.getGameTime() >= invulnerabilityEndTime) { /* */ }
```

## Comportamiento Resultante

### 🎯 **Cámara Lenta Coherente**
Cuando los FPS bajan (ej: de 60 a 30 FPS):

- **gameTime** avanza al 50% de velocidad
- **Movimiento**: 50% más lento ✅
- **Spawn de obstáculos**: 50% más lento ✅  
- **Duración de saltos**: 50% más lenta ✅
- **Invulnerabilidad**: 50% más lenta ✅

### 📊 **Monitoreo y Debug**

```typescript
// FPS actual y promedio
gameTimeManager.getCurrentFPS()
gameTimeManager.getAverageFPS()

// Tiempo de juego vs tiempo real
gameTimeManager.getGameTime() // Segundos de juego
performance.now() // Milisegundos reales
```

## Uso del Sistema

### Verificar Intervalos
```typescript
// En lugar de Date.now()
if (gameTimeManager.hasTimeElapsed(lastEventTime, intervalInSeconds)) {
  triggerEvent()
  lastEventTime = gameTimeManager.getGameTime()
}
```

### Animaciones con Duración
```typescript
// En lugar de calcular elapsed manualmente
const progress = gameTimeManager.getEventProgress(startTime, duration)
if (gameTimeManager.isEventComplete(startTime, duration)) {
  finishAnimation()
}
```

### Pausa/Reanudación
```typescript
// El sistema maneja pausas automáticamente
gameTimeManager.setPaused(isPaused)
```

### Reinicio
```typescript
// Limpiar todo el estado del tiempo
gameTimeManager.reset()
```

## Componente de Debug

Activar en `GameScene.tsx`:
```typescript
<GameTimeDebug visible={true} />
```

Muestra:
- Tiempo de juego actual
- FPS actual y promedio  
- Estado de pausa
- Indicador de cámara lenta

## Ventajas del Nuevo Sistema

✅ **Coherencia**: Todo se sincroniza con la misma escala de tiempo  
✅ **Experiencia**: Cámara lenta natural cuando bajan los FPS  
✅ **Mantenibilidad**: Sistema centralizado fácil de debuggear  
✅ **Performance**: Un solo update por frame  
✅ **Flexibilidad**: Fácil agregar nuevos eventos temporizados  

## Testing de Rendimiento

Para probar la sincronización:
1. Habilitar debug: `<GameTimeDebug visible={true} />`
2. Simular FPS bajos (abrir dev tools, throttle CPU)
3. Verificar que todo se ralentiza proporcionalmente
4. Los obstáculos deben aparecer más lento
5. Los saltos deben durar más tiempo de pantalla
6. La invulnerabilidad debe durar más tiempo de pantalla