import { useState, useRef } from 'react'
import { Camera, Upload, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import Tesseract from 'tesseract.js'

export default function DocumentScanner({ onDataExtracted }) {
  const [image, setImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [extractedData, setExtractedData] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [showRawText, setShowRawText] = useState(false)
  const [rawOcrText, setRawOcrText] = useState('')
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  // Activar cámara
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
        setError(null)
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara. Por favor, permite el acceso.')
      console.error('Error al acceder a la cámara:', err)
    }
  }

  // Detener cámara
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
    }
  }

  // Capturar foto desde cámara
  const capturePhoto = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (canvas && video) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' })
        handleImageUpload({ target: { files: [file] } })
        stopCamera()
      }, 'image/jpeg', 0.95)
    }
  }

  // Manejar subida de imagen
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target.result)
        setError(null)
        setExtractedData(null)
        setConfidence(0)
      }
      reader.readAsDataURL(file)
    }
  }

  // Extraer información del CI/DNI - Solo número de documento
  const extractDocumentData = (text) => {
    const data = {
      numero: null,
      validacionCruzada: false, // Si el número aparece múltiples veces
      candidatosEncontrados: 0 // Cantidad de números detectados
    }

    // Limpiar y normalizar texto
    const cleanText = text
      .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
      .replace(/[|]/g, ' ') // Barras a espacios
      .trim()

    console.log('Texto limpio:', cleanText)

    // ========== NÚMERO DE DOCUMENTO ==========
    // Patrones para diferentes formatos de CI/DNI
    const numeroPatterns = [
      // Con etiquetas explícitas
      /(?:N[UÚ]M(?:ERO)?|DNI|CI|ID|DOC(?:UMENTO)?)[:\s]+([A-Z0-9]{7,13})/gi,
      // Solo números largos (7-13 dígitos)
      /\b(\d{7,13})\b/g,
      // Formato con guiones
      /\b(\d{4,5}[-\s]?\d{4,5}[-\s]?\d{1,2})\b/g,
      // Alfanumérico
      /\b([A-Z]{1,3}\d{6,10})\b/g
    ]

    // Recolectar TODOS los candidatos de números
    const todosLosCandidatos = []
    
    for (const pattern of numeroPatterns) {
      const matches = [...cleanText.matchAll(pattern)]
      for (const match of matches) {
        const candidato = match[1].replace(/[\s-]/g, '')
        if (candidato.length >= 7 && candidato.length <= 13) {
          todosLosCandidatos.push(candidato)
        }
      }
    }

    console.log('Candidatos de números encontrados:', todosLosCandidatos)

    // Si hay múltiples candidatos, buscar coincidencias
    if (todosLosCandidatos.length > 0) {
      data.candidatosEncontrados = todosLosCandidatos.length
      
      // Contar frecuencia de cada número
      const frecuencia = {}
      todosLosCandidatos.forEach(num => {
        frecuencia[num] = (frecuencia[num] || 0) + 1
      })

      // Si un número aparece 2+ veces, es muy probable que sea el correcto (aparece en ambas ubicaciones)
      const numeroRepetido = Object.keys(frecuencia).find(num => frecuencia[num] >= 2)
      
      if (numeroRepetido) {
        data.numero = numeroRepetido
        data.validacionCruzada = true
        console.log('✓ Número validado (aparece múltiples veces):', numeroRepetido)
      } else {
        // Si no hay repetidos, tomar el primero
        data.numero = todosLosCandidatos[0]
        data.validacionCruzada = false
        console.log('→ Número detectado (único):', todosLosCandidatos[0])
      }
    }

    console.log('Datos extraídos:', data)
    return data
  }

  // Mejorar calidad de imagen para OCR
  const preprocessImage = (imageData) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Aumentar resolución
        const scale = 2
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        // Aplicar mejoras
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Convertir a escala de grises y aumentar contraste
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        for (let i = 0; i < data.length; i += 4) {
          // Escala de grises
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          
          // Aumentar contraste (threshold adaptativo)
          const threshold = 128
          const contrast = 1.5
          let value = ((avg - threshold) * contrast) + threshold
          value = Math.max(0, Math.min(255, value))
          
          data[i] = value     // R
          data[i + 1] = value // G
          data[i + 2] = value // B
        }
        
        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = imageData
    })
  }

  // Procesar imagen con OCR
  const processImage = async () => {
    if (!image) {
      setError('Por favor, selecciona o captura una imagen primero')
      return
    }

    setIsProcessing(true)
    setError(null)
    setProgress(0)

    try {
      // Pre-procesar imagen para mejorar OCR
      console.log('Pre-procesando imagen...')
      const processedImage = await preprocessImage(image)
      
      // Configuración optimizada de Tesseract
      const result = await Tesseract.recognize(
        processedImage,
        'eng+spa', // Inglés + Español para mejor detección
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100))
            }
          },
          tessedit_pageseg_mode: Tesseract.PSM.AUTO, // Detección automática de layout
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÑabcdefghijklmnopqrstuvwxyzáéíóúñ0123456789 /-.:',
          tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY, // Usar solo LSTM (mejor precisión)
          // Configuraciones adicionales para mejor detección en zonas curvas
          preserve_interword_spaces: '1',
        }
      )

      const avgConfidence = result.data.confidence
      setConfidence(avgConfidence)

      console.log('Confianza del OCR:', avgConfidence)
      console.log('Texto extraído:', result.data.text)

      // Reducir umbral a 70% para ser más flexible
      if (avgConfidence < 70) {
        setError(`Confianza del OCR: ${avgConfidence.toFixed(1)}%. Por favor, toma una foto más clara del documento.`)
        setIsProcessing(false)
        return
      }

      // Extraer datos del texto
      const extractedText = result.data.text
      const documentData = extractDocumentData(extractedText)

      setExtractedData(documentData)
      setRawOcrText(extractedText) // Guardar texto raw para debug
      
      // Validar que se extrajo el número de documento
      if (!documentData.numero) {
        setError('No se pudo extraer el número de documento. Por favor, intenta con otra foto más clara.')
      } else if (onDataExtracted) {
        onDataExtracted({
          ...documentData,
          confidence: avgConfidence,
          rawText: extractedText,
          documentImage: image // Enviar imagen del documento para comparación facial
        })
      }

    } catch (err) {
      setError('Error al procesar la imagen: ' + err.message)
      console.error('Error en OCR:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Reintentar con nueva foto
  const retry = () => {
    setImage(null)
    setExtractedData(null)
    setError(null)
    setConfidence(0)
    setProgress(0)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Verificación de Documento
      </h2>

      {/* Área de captura/subida */}
      {!image && (
        <div className="space-y-4">
          {/* Cámara */}
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="w-full bg-gradient-to-r from-warmi-magenta to-warmi-pink text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
            >
              <Camera className="w-5 h-5" />
              Tomar Foto del Documento
            </button>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-xl"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition"
                >
                  Capturar
                </button>
                <button
                  onClick={stopCamera}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Canvas oculto para captura */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Divisor */}
          {!isCameraActive && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>

              {/* Subir archivo */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 py-8 rounded-xl hover:border-warmi-pink hover:bg-warmi-pink hover:bg-opacity-10 transition flex flex-col items-center justify-center gap-2 text-gray-600"
              >
                <Upload className="w-8 h-8" />
                <span className="font-medium">Subir Imagen del Documento</span>
                <span className="text-sm">JPG, PNG (máx. 10MB)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </>
          )}
        </div>
      )}

      {/* Preview de imagen */}
      {image && !extractedData && (
        <div className="space-y-4">
          <img src={image} alt="Documento" className="w-full rounded-xl shadow-md" />
          
          {!isProcessing ? (
            <div className="flex gap-2">
              <button
                onClick={processImage}
                className="flex-1 bg-gradient-to-r from-warmi-magenta to-warmi-pink text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
              >
                Procesar Documento
              </button>
              <button
                onClick={retry}
                className="px-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-warmi-magenta">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Procesando... {progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-warmi-magenta h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resultados */}
      {extractedData && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-xl">
            <CheckCircle className="w-6 h-6" />
            <div className="flex-1">
              <div className="font-semibold">Documento procesado exitosamente</div>
              <div className="text-sm">Confianza: {confidence.toFixed(1)}%</div>
              {extractedData.validacionCruzada && (
                <div className="text-sm font-semibold text-green-700 mt-1">
                  ✓ Validación cruzada: Número detectado en múltiples ubicaciones
                </div>
              )}
              {extractedData.candidatosEncontrados > 1 && !extractedData.validacionCruzada && (
                <div className="text-sm text-orange-600 mt-1">
                  ⚠️ Se detectaron {extractedData.candidatosEncontrados} números diferentes
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl space-y-3">
            <h3 className="font-bold text-gray-800 mb-4">Datos Extraídos:</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Número de Documento:</span>
                <span className="font-semibold text-lg">{extractedData.numero || '❌ No detectado'}</span>
              </div>
              
              {extractedData.validacionCruzada && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold">Número validado</span>
                  </div>
                  <p className="text-green-600 text-xs mt-1">
                    Este número apareció en múltiples ubicaciones del documento (ej: zona principal y zona inferior izquierda)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mostrar texto OCR raw para debugging */}
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-200 transition"
          >
            {showRawText ? '🔽 Ocultar' : '👁️ Ver'} Texto OCR Completo (Debug)
          </button>

          {showRawText && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-60">
              <div className="text-gray-400 mb-2">// Texto extraído por OCR:</div>
              <pre className="whitespace-pre-wrap">{rawOcrText}</pre>
            </div>
          )}

          <button
            onClick={retry}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Escanear Otro Documento
          </button>
        </div>
      )}

      {/* Errores */}
      {error && (
        <div className="flex items-start gap-2 text-red-600 bg-red-50 p-4 rounded-xl mt-4">
          <XCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <div className="font-semibold">Error</div>
            <div className="text-sm">{error}</div>
            {confidence > 0 && confidence < 85 && (
              <button
                onClick={retry}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Intentar con otra foto
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
