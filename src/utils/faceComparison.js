import * as faceapi from 'face-api.js'

let modelsLoaded = false

// Cargar modelos de face-api.js
export const loadFaceApiModels = async () => {
  if (modelsLoaded) return true
  
  try {
    const MODEL_URL = '/models'
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ])
    
    modelsLoaded = true
    console.log('✓ Modelos de face-api.js cargados')
    return true
  } catch (error) {
    console.error('Error cargando modelos de face-api.js:', error)
    return false
  }
}

// Detectar rostro en imagen y obtener descriptor
export const detectFace = async (imageElement) => {
  try {
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()
    
    if (!detection) {
      console.log('No se detectó rostro en la imagen')
      return null
    }
    
    console.log('✓ Rostro detectado con confianza:', detection.detection.score)
    return detection
  } catch (error) {
    console.error('Error detectando rostro:', error)
    return null
  }
}

// Comparar dos rostros usando sus descriptores
export const compareFaces = async (imageElement1, imageElement2) => {
  try {
    // Detectar rostros en ambas imágenes
    const face1 = await detectFace(imageElement1)
    const face2 = await detectFace(imageElement2)
    
    if (!face1 || !face2) {
      return {
        success: false,
        error: !face1 ? 'No se detectó rostro en documento' : 'No se detectó rostro en selfie',
        similarity: 0
      }
    }
    
    // Calcular distancia euclidiana entre descriptores
    const distance = faceapi.euclideanDistance(face1.descriptor, face2.descriptor)
    
    // Convertir distancia a porcentaje de similitud (0.6 es el umbral común)
    // Menor distancia = mayor similitud
    const similarity = Math.max(0, Math.min(100, (1 - distance / 0.6) * 100))
    
    // Determinar si la verificación es exitosa (umbral: 60% de similitud)
    const isMatch = distance < 0.6
    
    console.log('Distancia facial:', distance.toFixed(3))
    console.log('Similitud:', similarity.toFixed(1) + '%')
    console.log('Coincidencia:', isMatch ? '✓ SÍ' : '✗ NO')
    
    return {
      success: true,
      isMatch,
      similarity: similarity.toFixed(1),
      distance: distance.toFixed(3),
      face1Confidence: face1.detection.score.toFixed(3),
      face2Confidence: face2.detection.score.toFixed(3)
    }
  } catch (error) {
    console.error('Error en comparación facial:', error)
    return {
      success: false,
      error: error.message,
      similarity: 0
    }
  }
}

// Extraer rostro de imagen del documento (zona donde suele estar la foto)
export const extractFaceFromDocument = async (documentImage) => {
  try {
    // Crear elemento de imagen
    const img = await createImageElement(documentImage)
    
    // Detectar todos los rostros en el documento
    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
    
    if (detections.length === 0) {
      console.log('No se detectó rostro en el documento')
      return null
    }
    
    // Si hay múltiples rostros, tomar el más grande (probablemente la foto principal)
    const mainFace = detections.reduce((prev, current) => {
      const prevArea = prev.detection.box.width * prev.detection.box.height
      const currentArea = current.detection.box.width * current.detection.box.height
      return currentArea > prevArea ? current : prev
    })
    
    // Extraer región del rostro
    const box = mainFace.detection.box
    const canvas = document.createElement('canvas')
    canvas.width = box.width
    canvas.height = box.height
    const ctx = canvas.getContext('2d')
    
    ctx.drawImage(
      img,
      box.x, box.y, box.width, box.height,
      0, 0, box.width, box.height
    )
    
    return {
      faceImage: canvas.toDataURL('image/jpeg', 0.9),
      detection: mainFace,
      confidence: mainFace.detection.score
    }
  } catch (error) {
    console.error('Error extrayendo rostro del documento:', error)
    return null
  }
}

// Detectar orientación del rostro (center, left, right)
export const detectFaceOrientation = async (videoElement) => {
  try {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
    
    if (!detection) {
      return null
    }
    
    const landmarks = detection.landmarks
    const positions = landmarks.positions
    
    // Usar puntos clave de la nariz y ojos para determinar orientación
    const noseTip = positions[30] // Punta de la nariz
    const leftEye = positions[36] // Ojo izquierdo (del usuario)
    const rightEye = positions[45] // Ojo derecho (del usuario)
    
    // Calcular centro entre los ojos
    const eyeCenter = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2
    }
    
    // Calcular desviación horizontal de la nariz respecto al centro de los ojos
    const horizontalDeviation = noseTip.x - eyeCenter.x
    const eyeDistance = Math.abs(rightEye.x - leftEye.x)
    
    // Normalizar desviación como porcentaje de la distancia entre ojos
    const deviationPercent = (horizontalDeviation / eyeDistance) * 100
    
    // Determinar orientación:
    // - Centro: desviación menor a 15%
    // - Izquierda: desviación > 15% hacia la izquierda (valor negativo porque la cámara está espejada)
    // - Derecha: desviación > 15% hacia la derecha (valor positivo)
    let orientation = 'center'
    if (deviationPercent < -15) {
      orientation = 'right' // Usuario gira a su derecha (izquierda en cámara espejada)
    } else if (deviationPercent > 15) {
      orientation = 'left' // Usuario gira a su izquierda (derecha en cámara espejada)
    }
    
    return {
      orientation,
      deviation: deviationPercent.toFixed(1),
      confidence: detection.detection.score
    }
  } catch (error) {
    console.error('Error detectando orientación:', error)
    return null
  }
}

// Helper: Crear elemento de imagen desde base64 o URL
const createImageElement = (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageSrc
  })
}
