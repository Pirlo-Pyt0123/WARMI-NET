# 📸 Sistema de Verificación Biométrica - Warmy

Sistema completo de verificación de identidad mediante OCR (Reconocimiento Óptico de Caracteres) y verificación facial 3D con liveness detection + comparación facial con IA.

## ⚠️ Setup Inicial Requerido

**Antes de usar el sistema por primera vez, debes descargar los modelos de face-api.js:**
```powershell
.\download-models.ps1
```
Esto descarga ~6MB de modelos de Machine Learning a `public/models/` para la comparación facial.

## ✨ Características Implementadas

### 🔐 Flujo de Autenticación Completo
1. **Página de Inicio** → Botón "Iniciar Sesión"
2. **Captura de Documento** → Dos opciones:
   - 📷 Tomar foto con la cámara
   - 📁 Subir imagen desde archivo
3. **Procesamiento OCR** → Análisis automático con Tesseract.js
4. **Validación de Confianza** → Mínimo 70% requerido
5. **Extracción de Datos** → Número de documento
6. **Verificación Facial 3D** → Nuevo sistema de liveness detection:
   - Captura de rostro en tiempo real
   - Detección de movimientos (centro → izquierda → derecha → arriba → abajo)
   - Validación anti-spoofing (previene uso de fotos o videos)
   - Captura de ~150 frames durante el proceso
7. **Pantalla de Éxito** → Muestra documento y verificación facial completada

### 🎯 Validaciones Implementadas

#### OCR del Documento
- ✅ Confianza mínima del 70% para aprobar
- ✅ Si confianza < 70% → Solicita tomar otra foto
- ✅ Extracción inteligente del número de documento
- ✅ **Validación cruzada**: Busca el número en múltiples ubicaciones
- ✅ Detecta número en zona principal y zona inferior izquierda (curva)
- ✅ Si el mismo número aparece 2+ veces → Validación confirmada
- ✅ Filtrado de fechas y años para evitar falsos positivos
- ✅ Opción de reintentar captura

#### Verificación Facial 3D
- ✅ Liveness detection con movimientos de cabeza
- ✅ Captura de video en tiempo real
- ✅ Guía visual con círculo animado
- ✅ Validación de 5 posiciones diferentes
- ✅ Captura de múltiples frames para análisis
- ✅ Selfie final para registro
- ✅ Prevención de fraude con fotos estáticas
- ✅ **Comparación facial con documento**: Usa face-api.js + TensorFlow.js
- ✅ **Extracción de rostro del documento**: Detecta y extrae foto del CI
- ✅ **Cálculo de similitud**: Compara descriptores faciales (embeddings)
- ✅ **Umbral de coincidencia**: 60% de similitud mínima
- ✅ **Visualización lado a lado**: Muestra ambas fotos para comparación

## 🚀 Cómo Usar

### 1. Iniciar la Aplicación
\`\`\`bash
npm run dev
\`\`\`

### 2. Navegar al Login
- Clic en botón "Iniciar Sesión" en la página principal
- O clic en "Comenzar Gratis"

### 3. Escanear Documento (Paso 1)
**Opción A - Tomar Foto:**
- Clic en "Tomar Foto del Documento"
- Permitir acceso a la cámara
- Posicionar el documento con buena iluminación
- Clic en "Capturar"

**Opción B - Subir Imagen:**
- Clic en "Subir Imagen del Documento"
- Seleccionar archivo JPG/PNG
- Máximo 10MB

### 4. Procesar Documento
- Clic en "Procesar Documento"
- Esperar análisis OCR (muestra progreso)
- Sistema extrae automáticamente el número de documento

### 5. Verificación Facial 3D (Paso 2)
- **Automáticamente** pasa a verificación facial después del OCR
- Permitir acceso a la cámara
- Clic en "Iniciar Verificación Facial"
- **El círculo permanece FIJO en el centro**
- **Seguir las instrucciones - GIRAR tu cabeza (no moverte):**
  1. Mantén tu rostro de **frente al centro** (2 segundos)
  2. **GIRA** tu cabeza hacia **TU IZQUIERDA** (1 segundo)
  3. **GIRA** tu cabeza hacia **TU DERECHA** (1 segundo)
  4. **INCLINA** tu cabeza hacia **ARRIBA** (1 segundo)
  5. **INCLINA** tu cabeza hacia **ABAJO** (1 segundo)
- **Barra circular de progreso** se va llenando (0-360°)
- La barra muestra qué tan completa está la verificación
- El sistema captura ~150 frames automáticamente
- Compara tu selfie con la foto del documento
- Toma una selfie final para registro

### 6. Resultados
**Si OCR ≥ 70%:**
- ✅ Extrae número de documento
- ✅ Pasa a verificación facial

**Si OCR < 70%:**
- ⚠️ Muestra error
- 🔄 Solicita tomar otra foto más clara

**Verificación Facial Completada:**
- ✅ Muestra selfie capturada
- ✅ Indica cantidad de frames validados
- ✅ Permite acceso a la plataforma

## 📋 Datos Capturados

El sistema captura:

### Del Documento (OCR)
1. **Número de Documento**: DNI, CI, ID, pasaporte (formato alfanumérico 7-13 caracteres)
   - Busca en múltiples ubicaciones del documento
   - **Zona principal**: Área central del documento
   - **Zona inferior izquierda**: Número en curva (común en CIs modernos)
   - **Validación cruzada**: Si detecta el mismo número en ambas zonas → Mayor confianza

### De la Verificación Facial 3D
2. **Selfie verificada**: Imagen final del rostro del usuario
3. **Frames de liveness**: ~150 frames capturados durante los movimientos
4. **Timestamp de verificación**: Fecha y hora de la verificación
5. **Estado de verificación**: Confirmación de persona real (anti-spoofing)
6. **Comparación facial**: Resultado de similitud con la foto del documento
   - **Similitud porcentual**: 0-100% (umbral: 60%)
   - **Distancia euclidiana**: Medida de diferencia entre rostros
   - **Confianza de detección**: Para cada rostro detectado
   - **Estado de coincidencia**: isMatch (true/false)
## 🔄 Validación Cruzada de Número de Documento

El sistema implementa una **validación cruzada inteligente** para mayor precisión:

### Cómo Funciona
1. **Búsqueda múltiple**: Escanea TODO el texto del documento buscando números válidos
2. **Detección de candidatos**: Identifica todos los números de 7-13 caracteres
3. **Filtrado inteligente**: Excluye fechas (DDMMYYYY) y años (YYYY)
4. **Análisis de frecuencia**: Cuenta cuántas veces aparece cada número
5. **Validación cruzada**: Si un número aparece 2+ veces → ✅ Alta confianza

### Ubicaciones Comunes en CI/DNI
- **Zona principal**: Número grande en el centro del documento
- **Zona inferior izquierda**: Número en la curva inferior (texto más pequeño)
- **Códigos adicionales**: Algunos documentos tienen el número en múltiples formatos

### Indicadores Visuales
- ✅ **"Validación cruzada"**: El número fue encontrado en múltiples ubicaciones
- ⚠️ **"X números diferentes"**: Se detectaron varios números distintos (posible confusión)
- ❌ **"No detectado"**: No se pudo extraer ningún número válido

### Consejos para Mejor Detección
- 📸 Captura el documento **completo** (no cortar bordes)
- 💡 Asegúrate que la **zona inferior izquierda** sea visible
- 🔍 Evita zoom excesivo que corte partes del documento
- ✨ Buena iluminación en **todas las zonas** del CI

## 🛠️ Tecnologías Utilizadas

- **React 19** - Framework principal
- **Tesseract.js** - Motor OCR para extracción de texto
- **face-api.js** - Reconocimiento facial y comparación (TensorFlow.js)
- **TensorFlow.js** - Machine Learning para detección facial
- **WebRTC / MediaDevices API** - Captura de cámara en tiempo real
- **HTML5 Canvas** - Procesamiento de frames y captura de imágenes
- **Tailwind CSS 3** - Estilos y animaciones
- **Lucide React** - Iconos consistentes
- **Vite 7** - Build tool y desarrollo rápido

### Modelos de Face-API.js
- **Tiny Face Detector**: Detección rápida de rostros
- **Face Landmark 68**: Puntos faciales para alineación
- **Face Recognition Net**: Descriptores faciales para comparación
- **Face Expression**: (Opcional) Reconocimiento de expresiones

## 🔒 Seguridad y Anti-Fraude

### Comparación Facial con IA 🆕
El sistema implementa reconocimiento facial avanzado para validar identidad:

#### Cómo Funciona
1. **Extracción de rostro del documento**:
   - Detecta todos los rostros en la imagen del CI/DNI
   - Selecciona el rostro más grande (foto principal)
   - Extrae región facial para comparación

2. **Captura de selfie en vivo**:
   - Verifica liveness con movimientos 3D
   - Captura selfie final de alta calidad
   - Asegura que es una persona real

3. **Generación de descriptores faciales**:
   - Usa redes neuronales (Face Recognition Net)
   - Genera vector de 128 dimensiones por rostro
   - Descriptores únicos que representan características faciales

4. **Cálculo de similitud**:
   - Calcula distancia euclidiana entre descriptores
   - Distancia < 0.6 = Coincidencia ✅
   - Convierte distancia a porcentaje de similitud (0-100%)

5. **Visualización del resultado**:
   - Muestra ambos rostros lado a lado
   - Indica porcentaje de similitud
   - Verde si coinciden, rojo si no

#### Precisión y Umbrales
- **Umbral de coincidencia**: 0.6 de distancia euclidiana
- **Similitud recomendada**: > 60% para aprobar
- **Factores que afectan**:
  - Calidad de foto del documento
  - Iluminación en la selfie
  - Ángulo de la cara
  - Cambios en apariencia (barba, lentes, etc.)

### Liveness Detection 3D
El sistema implementa verificación de persona real mediante:

✅ **Movimientos naturales**: Detecta 5 posiciones diferentes del rostro
✅ **Captura continua**: 150 frames capturados durante 5-7 segundos
✅ **Anti-spoofing básico**: Dificulta el uso de fotos estáticas
✅ **Secuencia temporal**: Valida que los movimientos sean fluidos
✅ **Múltiples ángulos**: Centro, izquierda, derecha, arriba, abajo

### Recomendaciones para Mejorar
Para producción, considera agregar:
- 🔐 Análisis facial con ML (face-api.js, TensorFlow.js)
- 🔐 Comparación con foto del documento
- 🔐 Detección de textura de piel (anti-pantalla)
- 🔐 Análisis de profundidad (si hay sensor disponible)
- 🔐 Backend para validación adicional

## 📱 Características UX

### Escaneo de Documento
- 🎨 Interfaz moderna y responsiva
- 📊 Barra de progreso durante procesamiento OCR
- ⚡ Feedback instantáneo de confianza
- 🔄 Reintentos ilimitados si falla
- 📸 Soporte de cámara móvil y desktop
- 🎯 Instrucciones optimizadas

### Verificación Facial 3D ⭐
- 🎭 **Círculo de guía fijo** en el centro de la pantalla
- 🔵 **Barra circular de progreso** que se llena de 0° a 360°
- ➡️ **Indicadores direccionales** con flechas animadas (←↑→↓)
- 🎯 Progreso visual en tiempo real mientras giras tu cabeza
- 💚 Verde cuando estás en el centro, azul durante movimientos
- ⏱️ Captura automática de frames en cada posición
- 🔄 Opción de reintentar verificación
- 🎥 Video espejado para mejor experiencia
- ✅ Confirmación visual al completar cada segmento
- 📊 **5 segmentos:** Cada posición completa llena 72° del círculo

### General
- 🔐 Flujo de 2 pasos: documento + rostro
- 📱 Totalmente responsive
- ⚡ Transiciones suaves
- 🎯 Instrucciones claras en cada paso
- 🔙 Opción de volver atrás en cualquier momento

## 🎨 Componentes Creados

### `DocumentScanner.jsx`
Componente de escaneo de documentos que maneja:
- Captura de cámara/archivo
- Procesamiento OCR con Tesseract.js
- Extracción simplificada del número de documento
- Pre-procesamiento de imagen para mejor detección
- Validación de confianza (mínimo 70%)
- UI de progreso y errores
- Opción de debugging con texto OCR raw

### `FaceVerification.jsx` ⭐ NUEVO
Componente de verificación facial 3D con liveness detection:
- Activación de cámara frontal con alta resolución
- Guía visual animada (círculo que se mueve)
- Detección de 5 posiciones faciales:
  - Centro (punto de referencia)
  - Izquierda (rotación)
  - Derecha (rotación)
  - Arriba (inclinación)
  - Abajo (inclinación)
- Captura de ~30 frames por posición (150 total)
- Selfie final para registro
- Prevención de fraude (liveness detection)
- Barra de progreso en tiempo real
- Indicadores visuales de dirección (emojis animados)

### `LoginPage.jsx`
Página principal del flujo de login con 3 pasos:
1. **Escaneo de documento** (DocumentScanner)
2. **Verificación facial 3D** (FaceVerification)
3. **Pantalla de éxito** con todos los datos

### `LoginPage.jsx`
Página que integra:
- DocumentScanner
- Flujo de verificación
- Pantalla de éxito
- Navegación

## 📝 Próximos Pasos Sugeridos

1. **Integrar con Backend**
   - Enviar datos extraídos a API
   - Verificar autenticidad del documento
   - Guardar información en base de datos

2. **Mejoras de OCR**
   - Entrenar modelo con más documentos
   - Agregar pre-procesamiento de imagen
   - Detección automática de tipo de documento

3. **Seguridad**
   - Encriptación de datos sensibles
   - Detección de documentos falsos
   - Verificación biométrica adicional

4. **UX Mejorada**
   - Guías visuales para captura
   - Recorte automático de documento
   - Comparación facial (liveness detection)

## 🔧 Archivos del Proyecto

\`\`\`
src/
├── App.jsx                    # App principal con navegación
├── components/
│   └── DocumentScanner.jsx    # Componente OCR
└── pages/
    └── LoginPage.jsx          # Página de login/verificación
\`\`\`

## 💡 Tips para Mejores Resultados

1. **Iluminación**: Usar luz natural o buena iluminación artificial
2. **Enfoque**: Documento completamente visible y enfocado
3. **Ángulo**: Tomar foto perpendicular al documento
4. **Fondo**: Superficie plana y contraste con el documento
5. **Limpieza**: Documento limpio sin manchas o dobleces

---

**Desarrollado con ❤️ para Warmy**
