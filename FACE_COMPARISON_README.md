# 🤖 Comparación Facial con IA - Warmy

## ✅ Sistema Implementado

Ahora el sistema compara automáticamente la selfie capturada con la foto del documento usando **inteligencia artificial**.

### 🎯 Cómo Funciona

1. **Escaneas tu documento** → El sistema extrae:
   - Número de documento
   - Imagen completa del documento

2. **Verificación facial 3D** → El sistema:
   - Te pide movimientos de cabeza (liveness detection)
   - Captura tu selfie en vivo
   - **Extrae el rostro de la foto del documento**
   - **Compara ambos rostros usando IA**

3. **Resultado** → Muestra:
   - ✅ **Rostros coinciden** (similitud > 60%)
   - ✗ **Rostros NO coinciden** (similitud < 60%)
   - Porcentaje de similitud exacto
   - Comparación lado a lado de ambas fotos

## 🚀 Instalación y Setup

### 1. Instalar dependencias (ya hecho)
```bash
npm install face-api.js
```

### 2. Descargar modelos de IA (IMPORTANTE)
```powershell
.\download-models.ps1
```

Este script descarga los modelos necesarios (~6MB):
- Tiny Face Detector (detección rápida)
- Face Landmark 68 (puntos faciales)
- Face Recognition Net (comparación)
- Face Expression (expresiones)

Los modelos se guardan en `public/models/`.

### 3. Ejecutar la aplicación
```bash
npm run dev
```

## 🧠 Tecnología de Comparación Facial

### face-api.js + TensorFlow.js
- **Detección**: Encuentra rostros en las imágenes
- **Extracción**: Genera descriptores faciales (vectors de 128 dimensiones)
- **Comparación**: Calcula distancia euclidiana entre descriptores
- **Decisión**: Distancia < 0.6 = Coincidencia ✅

### Precisión
- **Similitud 80-100%**: Muy probable la misma persona
- **Similitud 60-79%**: Posible coincidencia (aceptable)
- **Similitud 0-59%**: Probablemente NO es la misma persona

### Factores que Afectan
- ✅ Buena iluminación → Mayor precisión
- ✅ Rostro frontal → Mejor comparación
- ❌ Foto borrosa del documento → Menor precisión
- ❌ Cambios de apariencia (barba, lentes) → Puede afectar

## 📂 Archivos Creados

- `src/utils/faceComparison.js` - Lógica de comparación facial
- `src/components/FaceVerification.jsx` - Actualizado con comparación
- `src/components/DocumentScanner.jsx` - Envía imagen del documento
- `src/pages/LoginPage.jsx` - Muestra resultado de comparación
- `download-models.ps1` - Script para descargar modelos
- `public/models/` - Carpeta con modelos de ML

## 🎨 Interfaz Actualizada

### Durante Verificación Facial
1. "Cargando modelos de reconocimiento facial..."
2. Extrae rostro del documento en segundo plano
3. Captura tu selfie con movimientos 3D
4. "Comparando con foto del documento..."
5. Muestra resultado de similitud

### Pantalla de Resultados
- **Badge verde/rojo**: Indica si coinciden
- **Porcentaje de similitud**: 0-100%
- **Comparación visual**: Ambas fotos lado a lado
- **Datos técnicos**: Distancia euclidiana, confianza

## 🔧 Troubleshooting

### "No se detectó rostro en el documento"
- Asegúrate que la foto del CI incluya la foto de la persona
- Buena iluminación y enfoque en el documento
- El CI debe estar completo en la imagen

### "No se pudieron cargar los modelos"
- Ejecuta `.\download-models.ps1` nuevamente
- Verifica que existe la carpeta `public/models/`
- Revisa la consola del navegador para errores

### Comparación da falso negativo
- Mejora la iluminación en la selfie
- Verifica que la foto del documento sea clara
- Asegúrate que el rostro esté frontal
- Considera factores como barba, lentes, etc.

## 📊 Resultados de Ejemplo

```javascript
{
  faceComparison: {
    success: true,
    isMatch: true,
    similarity: "87.3",
    distance: "0.456",
    face1Confidence: "0.982",
    face2Confidence: "0.995"
  }
}
```

## 🔒 Seguridad y Privacidad

- ✅ Todo se procesa **localmente** en el navegador
- ✅ No se envían imágenes a servidores externos
- ✅ Los modelos se descargan una sola vez
- ✅ Comparación ocurre en tiempo real sin almacenamiento
- ✅ Las imágenes se procesan solo durante la sesión

## 🎯 Próximas Mejoras Posibles

- 🔄 Comparar múltiples ángulos (no solo selfie final)
- 📊 Mostrar mapa de calor de similitud facial
- 🎭 Detectar expresiones faciales para mayor seguridad
- 🔐 Agregar backend para guardar verificaciones
- 📸 Mejorar extracción de foto del documento con preprocesamiento
