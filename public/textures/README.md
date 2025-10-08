# 🎨 Sistema de Texturas del Juego

## 📁 Estructura de Carpetas

### `/public/textures/`
Carpeta principal para todas las texturas del juego. Organizadas por categorías:

#### `terrain/` 
Texturas del suelo y pistas
- `textura_pared.png` - pared
- `textura_piso.png` - piso
- `textura_tablero.png` - tableros que se cuelgan en la pared
- `textura_techo.png` - techo

#### `obstacles/`
Texturas para obstáculos y elementos del nivel


#### `characters/`


#### `environment/`


#### `ui/`
Texturas para interfaz de usuario


#### `effects/`
Texturas para efectos visuales


## 🔧 Formato Recomendado

### Texturas Principales
- **Formato**: JPG para texturas opacas, PNG para transparencias
- **Resolución**: 512x512px o 1024x1024px (potencias de 2)
- **Compresión**: Optimizada para web (calidad 80-90%)

### Texturas UI
- **Formato**: PNG (para transparencias)
- **Resolución**: Según necesidad (16x16 a 256x256px)
- **Densidad**: @1x y @2x para diferentes densidades de pantalla

### Efectos y Partículas
- **Formato**: PNG con canal alpha
- **Resolución**: 64x64px a 256x256px
- **Optimización**: Mínimo peso posible

## 📋 Lista de Texturas Requeridas

### Prioritarias (MVP)
- [ ] `terrain/road_asphalt.jpg` - Carretera principal
- [ ] `terrain/sidewalk.jpg` - Aceras
- [ ] `obstacles/barrier_metal.jpg` - Barreras
- [ ] `characters/player_skin.jpg` - Personaje
- [ ] `environment/sky_gradient.jpg` - Fondo

### Secundarias (Mejoras)
- [ ] `effects/particle_dust.png` - Efectos de carrera
- [ ] `ui/button_normal.png` - Interfaz
- [ ] `environment/buildings_facade.jpg` - Edificios
- [ ] `obstacles/car_body.jpg` - Autos
- [ ] `terrain/grass.jpg` - Césped

### Futuras (Expansión)
- [ ] Texturas animadas
- [ ] Variaciones de clima
- [ ] Temas estacionales
- [ ] Personajes adicionales

## 🎯 Uso en Three.js

### Cargar Texturas
```typescript
import { TextureLoader } from 'three';

const loader = new TextureLoader();
const roadTexture = loader.load('/textures/terrain/road_asphalt.jpg');
const barrierTexture = loader.load('/textures/obstacles/barrier_metal.jpg');
```

### Aplicar a Materiales
```typescript
const roadMaterial = new MeshLambertMaterial({ 
  map: roadTexture,
  transparent: false
});

const barrierMaterial = new MeshLambertMaterial({ 
  map: barrierTexture
});
```

### Configuración de Repetición
```typescript
roadTexture.wrapS = roadTexture.wrapT = RepeatWrapping;
roadTexture.repeat.set(4, 1); // Repetir 4 veces en X
```

## 🎨 Herramientas Recomendadas

### Creación
- **GIMP** (gratuito) - Editor de imágenes
- **Blender** (gratuito) - Texturas procedurales
- **Figma** (gratuito) - UI y elementos gráficos

### Optimización
- **TinyPNG** - Compresión PNG
- **ImageOptim** - Optimización general
- **Squoosh** - Compresión web

### Recursos Gratuitos
- **OpenGameArt.org** - Texturas libres
- **Freepik** (con atribución) - Recursos gráficos
- **Unsplash** - Fotografías de alta calidad

## 🚀 Próximos Pasos

1. **Recopilar texturas base** para MVP
2. **Crear sistema de carga** optimizado
3. **Implementar materiales** en los componentes
4. **Optimizar rendimiento** con mipmaps
5. **Añadir efectos visuales** avanzados