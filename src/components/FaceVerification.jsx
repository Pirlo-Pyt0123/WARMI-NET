import { useState, useRef, useEffect } from 'react'
import { Camera, CheckCircle, XCircle, Loader2, UserCheck, RotateCcw, AlertTriangle } from 'lucide-react'
import { loadFaceApiModels, compareFaces, extractFaceFromDocument, detectFaceOrientation } from '../utils/faceComparison'

export default function FaceVerification({ documentNumber, documentImage, onVerificationComplete }) {
  const [cameraActive, setCameraActive] = useState(false)
  const [currentStep, setCurrentStep] = useState('loading') // loading, ready, center, left, right, up, down, capturing, comparing, complete
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [capturedFrames, setCapturedFrames] = useState([])
  const [selfieImage, setSelfieImage] = useState(null)
  const [faceComparisonResult, setFaceComparisonResult] = useState(null)
  const [documentFaceExtracted, setDocumentFaceExtracted] = useState(null)
  const [modelsReady, setModelsReady] = useState(false)
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)

  // Instrucciones para cada paso
  const instructions = {
    loading: 'Cargando modelos de reconocimiento facial...',
    ready: 'Mantén tu rostro en el círculo y presiona Iniciar',
    center: 'Mantén tu rostro de frente al centro',
    left: 'GIRA tu cabeza hacia TU IZQUIERDA',
    right: 'GIRA tu cabeza hacia TU DERECHA',
    capturing: 'Capturando... ¡Perfecto!',
    comparing: 'Comparando con foto del documento...',
    complete: '✓ Verificación completada'
  }

  // Calcular progreso del círculo (0-180 grados)
  const getCircleProgress = () => {
    const steps = ['center', 'left', 'right']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex === -1) return 0
    
    // Cada paso completo suma 60 grados (180/3)
    const baseProgress = currentIndex * 60
    
    // Agregar progreso parcial del paso actual basado en validación
    const stepProgress = (progress / 100) * 60
    
    return Math.min(180, baseProgress + stepProgress)
  }

  // Cargar modelos al iniciar
  useEffect(() => {
    const initModels = async () => {
      setCurrentStep('loading')
      const loaded = await loadFaceApiModels()
      if (loaded) {
        setModelsReady(true)
        setCurrentStep('ready')
        
        // Extraer rostro del documento si hay imagen
        if (documentImage) {
          const extracted = await extractFaceFromDocument(documentImage)
          if (extracted) {
            setDocumentFaceExtracted(extracted)
            console.log('✓ Rostro extraído del documento con confianza:', extracted.confidence)
          } else {
            console.log('⚠ No se pudo extraer rostro del documento - se hará comparación con imagen completa')
          }
        }
      } else {
        setError('No se pudieron cargar los modelos de reconocimiento facial')
        setCurrentStep('ready')
      }
    }
    initModels()
  }, [documentImage])

  // Activar cámara
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Cámara frontal
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
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
      setCameraActive(false)
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  // Capturar frame
  const captureFrame = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (canvas && video && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      return canvas.toDataURL('image/jpeg', 0.8)
    }
    return null
  }

  // Iniciar proceso de verificación con validación de posición
  const startVerification = async () => {
    if (!cameraActive) {
      await startCamera()
    }
    
    setCurrentStep('center')
    setProgress(0)
    setCapturedFrames([])
    
    // Secuencia de pasos (solo 180°: centro, izquierda, derecha)
    const steps = ['center', 'left', 'right']
    let stepIndex = 0
    let validationCount = 0
    const validationsRequired = 20 // Necesita 20 detecciones correctas consecutivas para avanzar
    
    const captureSequence = async () => {
      if (stepIndex >= steps.length) {
        // Completar verificación
        finishVerification()
        return
      }
      
      const currentStepName = steps[stepIndex]
      
      // Detectar orientación del rostro
      if (videoRef.current) {
        const orientation = await detectFaceOrientation(videoRef.current)
        
        if (orientation && orientation.orientation === currentStepName) {
          // La orientación es correcta, incrementar contador
          validationCount++
          
          // Actualizar progreso dentro del paso actual
          const stepProgress = (validationCount / validationsRequired) * 100
          const totalProgress = ((stepIndex * validationsRequired) + validationCount) / (steps.length * validationsRequired) * 100
          setProgress(Math.round(totalProgress))
          
          // Capturar algunos frames como evidencia
          if (validationCount % 5 === 0) {
            const frame = captureFrame()
            if (frame) {
              setCapturedFrames(prev => [...prev, { step: currentStepName, frame, orientation }])
            }
          }
          
          // Si completó las validaciones necesarias, avanzar al siguiente paso
          if (validationCount >= validationsRequired) {
            validationCount = 0
            stepIndex++
            
            if (stepIndex < steps.length) {
              setCurrentStep(steps[stepIndex])
              // Pausa corta para que el usuario se prepare
              await new Promise(resolve => setTimeout(resolve, 500))
            }
          }
        } else {
          // Orientación incorrecta, resetear contador
          validationCount = 0
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(captureSequence)
    }
    
    // Iniciar captura después de 1 segundo
    setTimeout(() => {
      captureSequence()
    }, 1000)
  }

  // Finalizar verificación y comparar rostros
  const finishVerification = async () => {
    setCurrentStep('capturing')
    
    // Capturar selfie final
    const finalSelfie = captureFrame()
    setSelfieImage(finalSelfie)
    
    // Comparar con foto del documento
    if (modelsReady && documentImage && finalSelfie) {
      setCurrentStep('comparing')
      setProgress(95)
      
      try {
        // Crear elementos de imagen para comparación
        const img1 = await createImageElement(documentFaceExtracted?.faceImage || documentImage)
        const img2 = await createImageElement(finalSelfie)
        
        // Detectar rostro y obtener descriptor del selfie
        const { detectFace } = await import('../utils/faceComparison')
        const selfieDetection = await detectFace(img2)
        const faceDescriptor = selfieDetection?.descriptor ? Array.from(selfieDetection.descriptor) : null
        
        // Comparar rostros
        const comparisonResult = await compareFaces(img1, img2)
        setFaceComparisonResult(comparisonResult)
        
        setTimeout(() => {
          setCurrentStep('complete')
          setProgress(100)
          
          // Notificar completado con resultado de comparación
          if (onVerificationComplete) {
            onVerificationComplete({
              documentNumber,
              selfie: finalSelfie,
              frames: capturedFrames,
              timestamp: new Date().toISOString(),
              faceComparison: comparisonResult,
              verified: comparisonResult.success && comparisonResult.isMatch,
              faceDescriptor: faceDescriptor
            })
          }
        }, 2000)
      } catch (error) {
        console.error('Error en comparación facial:', error)
        setError('Error al comparar rostros')
        setCurrentStep('complete')
      }
    } else {
      // Sin comparación (no hay imagen del documento o modelos no cargados)
      // Capturar descriptor facial del selfie de todos modos
      const img2 = await createImageElement(finalSelfie)
      const { detectFace } = await import('../utils/faceComparison')
      const selfieDetection = await detectFace(img2)
      const faceDescriptor = selfieDetection?.descriptor ? Array.from(selfieDetection.descriptor) : null
      
      setTimeout(() => {
        setCurrentStep('complete')
        setProgress(100)
        
        if (onVerificationComplete) {
          onVerificationComplete({
            documentNumber,
            selfie: finalSelfie,
            frames: capturedFrames,
            timestamp: new Date().toISOString(),
            verified: true,
            faceComparison: { success: false, error: 'No se pudo comparar con documento' },
            faceDescriptor: faceDescriptor
          })
        }
      }, 1000)
    }
  }

  // Helper: Crear elemento de imagen
  const createImageElement = (imageSrc) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = imageSrc
    })
  }

  // Reintentar
  const retry = () => {
    setCurrentStep('ready')
    setProgress(0)
    setCapturedFrames([])
    setSelfieImage(null)
    setError(null)
  }

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <UserCheck className="w-8 h-8 text-warmi-magenta" />
          <h2 className="text-2xl font-bold text-gray-800">Verificación Facial 3D</h2>
        </div>
        <p className="text-gray-600">Documento: <span className="font-mono font-bold">{documentNumber}</span></p>
      </div>

      {/* Vista de cámara */}
      {currentStep !== 'complete' && (
        <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {/* Overlay con guía facial */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {cameraActive && currentStep !== 'ready' && (
              <div className="relative w-64 h-64">
                {/* SVG para círculo de progreso */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Círculo base (fondo gris) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="3"
                  />
                  
                  {/* Círculo de progreso (se va llenando) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={currentStep === 'center' ? '#4ade80' : '#3b82f6'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - getCircleProgress() / 180)}`}
                    className="transition-all duration-300"
                    style={{ 
                      filter: 'drop-shadow(0 0 8px currentColor)',
                    }}
                  />
                </svg>
                
                {/* Círculo guía interno */}
                <div className={`absolute inset-4 rounded-full border-2 border-dashed transition-colors duration-300 ${
                  currentStep === 'center' ? 'border-green-400' :
                  'border-blue-400'
                }`} />
                
                {/* Indicador de dirección dentro del círculo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {currentStep === 'left' && (
                    <div className="text-6xl animate-bounce">←</div>
                  )}
                  {currentStep === 'right' && (
                    <div className="text-6xl animate-bounce">→</div>
                  )}
                  {currentStep === 'center' && (
                    <div className="text-4xl text-green-400">●</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Instrucciones */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <p className="text-white text-center text-lg font-semibold">
              {instructions[currentStep]}
            </p>
          </div>
        </div>
      )}

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Progreso */}
      {currentStep !== 'ready' && currentStep !== 'complete' && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progreso de verificación</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-warmi-magenta to-warmi-pink h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Botones de acción */}
      {currentStep === 'ready' && (
        <button
          onClick={startVerification}
          className="w-full bg-gradient-to-r from-warmi-magenta to-warmi-pink text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
        >
          <Camera className="w-5 h-5" />
          Iniciar Verificación Facial
        </button>
      )}

      {/* Resultado completado */}
      {currentStep === 'complete' && selfieImage && (
        <div className="space-y-4">
          {/* Resultado de comparación facial */}
          {faceComparisonResult && faceComparisonResult.success && (
            <div className={`flex items-center gap-2 p-4 rounded-xl ${
              faceComparisonResult.isMatch ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
            }`}>
              {faceComparisonResult.isMatch ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
              <div className="flex-1">
                <div className="font-semibold">
                  {faceComparisonResult.isMatch ? '✓ Rostros coinciden' : '✗ Rostros NO coinciden'}
                </div>
                <div className="text-sm">
                  Similitud: {faceComparisonResult.similarity}% • 
                  Distancia: {faceComparisonResult.distance}
                </div>
              </div>
            </div>
          )}

          {/* Si hay advertencia */}
          {faceComparisonResult && !faceComparisonResult.success && (
            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-4 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <div className="font-semibold">Advertencia</div>
                <div className="text-sm">{faceComparisonResult.error}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-xl">
            <CheckCircle className="w-6 h-6" />
            <div>
              <div className="font-semibold">¡Verificación facial completada!</div>
              <div className="text-sm">Se capturaron {capturedFrames.length} frames de validación</div>
            </div>
          </div>

          {/* Comparación lado a lado */}
          {documentFaceExtracted && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-3">Comparación Visual:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-2">Foto del Documento</p>
                  <img 
                    src={documentFaceExtracted.faceImage} 
                    alt="Rostro documento" 
                    className="w-full rounded-lg shadow-md border-2 border-gray-300"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Selfie Verificación</p>
                  <img 
                    src={selfieImage} 
                    alt="Selfie verificación" 
                    className="w-full rounded-lg shadow-md border-2 border-gray-300"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mostrar solo selfie si no se pudo extraer rostro del documento */}
          {!documentFaceExtracted && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-3">Selfie Capturada:</h3>
              <img 
                src={selfieImage} 
                alt="Selfie verificación" 
                className="w-full rounded-lg shadow-md"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
          )}

          <button
            onClick={retry}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Tomar Nueva Verificación
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
          </div>
        </div>
      )}
    </div>
  )
}
