import { useState } from 'react'
import { CheckCircle, UserPlus, LogIn, Shield } from 'lucide-react'
import DocumentScanner from '../components/DocumentScanner'
import FaceVerification from '../components/FaceVerification'
import RegisterForm from '../components/RegisterForm'
import LoginForm from '../components/LoginForm'
import Dashboard from './Dashboard'
import logoWarmi from '../assets/LogoWarmi.png'

export default function LoginPage({ onLoginSuccess }) {
  const [step, setStep] = useState('welcome')
  const [userData, setUserData] = useState(null)
  const [verificationData, setVerificationData] = useState(null)
  const [registeredUser, setRegisteredUser] = useState(null)

  const handleDataExtracted = (data) => {
    setUserData(data)
    setStep('face-verification')
  }

  const handleVerificationComplete = (faceData) => {
    setVerificationData(faceData)
    setStep('register')
  }

  const handleRegisterComplete = (completeUserData) => {
    const usersData = localStorage.getItem('warmi_users')
    const users = usersData ? JSON.parse(usersData) : []
    users.push(completeUserData)
    localStorage.setItem('warmi_users', JSON.stringify(users))
    
    setRegisteredUser(completeUserData)
    setStep('dashboard')
  }

  const handleLoginSuccess = (user) => {
    setRegisteredUser(user)
    setStep('dashboard')
  }

  const handleLogout = () => {
    // Resetear todo al estado inicial
    setStep('welcome')
    setUserData(null)
    setVerificationData(null)
    setRegisteredUser(null)
  }

  const handleContinue = () => {
    if (userData && verificationData && onLoginSuccess) {
      onLoginSuccess({
        ...userData,
        faceVerification: verificationData
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="container mx-auto px-4">
        {step !== 'dashboard' && (
          <div className="flex items-center justify-center mb-8">
            
          </div>
        )}

        {step === 'welcome' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800">
                Bienvenido a <span className="bg-gradient-to-r from-warmi-purple to-warmi-pink bg-clip-text text-transparent">Warmi Net</span>
              </h1>
              
            
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-warmi-pink transition">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-warmi-pink bg-opacity-20 rounded-full mb-4">
                    <UserPlus className="w-8 h-8 text-warmi-magenta" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    Registrarse
                  </h2>
                  <p className="text-gray-600 mb-6">
                    ¿Primera vez aquí? Crea tu cuenta con verificación biométrica completa
                  </p>
                  <ul className="text-left space-y-2 mb-6 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Escaneo de documento con OCR</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Verificación facial 3D (180°)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Comparación facial con documento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>PIN de seguridad de 4 dígitos</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => setStep('scan')}
                    className="w-full bg-gradient-to-r from-warmi-magenta to-warmi-pink text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
                  >
                    <UserPlus className="w-5 h-5" />
                    Crear Cuenta Nueva
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-warmi-purple transition">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-warmi-purple bg-opacity-20 rounded-full mb-4">
                    <LogIn className="w-8 h-8 text-warmi-purple" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    Iniciar Sesión
                  </h2>
                  <p className="text-gray-600 mb-6">
                    ¿Ya tienes cuenta? Ingresa con tus credenciales
                  </p>
                  <ul className="text-left space-y-2 mb-6 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-warmi-purple mt-0.5 flex-shrink-0" />
                      <span>Acceso rápido con número de CI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-warmi-purple mt-0.5 flex-shrink-0" />
                      <span>PIN de 4 dígitos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-warmi-purple mt-0.5 flex-shrink-0" />
                      <span>Seguro y encriptado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-warmi-purple mt-0.5 flex-shrink-0" />
                      <span>Ingreso inmediato al dashboard</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => setStep('login')}
                    className="w-full bg-gradient-to-r from-warmi-purple to-warmi-intense text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
                  >
                    <LogIn className="w-5 h-5" />
                    Ingresar a mi Cuenta
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Formulario de Login */}
        {step === 'login' && (
          <LoginForm 
            onLoginSuccess={handleLoginSuccess}
            onBackToWelcome={() => setStep('welcome')}
          />
        )}

        {step === 'scan' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Verificación de Identidad
              </h1>
              <p className="text-lg text-gray-600">
                Para garantizar tu seguridad, necesitamos verificar tu documento de identidad
              </p>
            </div>

            <DocumentScanner onDataExtracted={handleDataExtracted} />
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setStep('welcome')}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                ← Volver a opciones de acceso
              </button>
            </div>
          </div>
        )}

        {step === 'face-verification' && userData && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Verificación Facial 3D
              </h1>
              <p className="text-lg text-gray-600">
                Ahora verificaremos que eres la persona del documento
              </p>
            </div>

            <div className="bg-purple-50 border border-warmi-purple rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-warmi-purple mb-3">🎯 Instrucciones:</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>✓ Mantén tu rostro dentro del círculo</li>
                <li>✓ NO muevas tu cuerpo - solo gira tu cabeza</li>
                <li>✓ Gira tu cabeza: frente → izquierda → derecha (180°)</li>
                <li>✓ La barra se llenará conforme detecte cada posición</li>
                <li>✓ Solo avanza cuando valide tu posición actual</li>
              </ul>
            </div>

            <FaceVerification 
              documentNumber={userData.numero}
              documentImage={userData.documentImage}
              onVerificationComplete={handleVerificationComplete}
            />

            <div className="mt-6 text-center">
              <button
                onClick={() => setStep('scan')}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                ← Volver a escanear documento
              </button>
            </div>
          </div>
        )}

        {step === 'register' && userData && verificationData && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Formulario de Registro
              </h1>
              <p className="text-lg text-gray-600">
                Completa tu información para finalizar el registro
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-green-900 mb-3">✓ Verificaciones Completadas:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-green-800 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Documento escaneado ({userData.numero})</span>
                </div>
                <div className="flex items-center gap-2 text-green-800 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verificación facial 3D completada</span>
                </div>
                {verificationData.faceComparison?.isMatch && (
                  <div className="flex items-center gap-2 text-green-800 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Rostro coincide con documento ({verificationData.faceComparison.similarity}%)</span>
                  </div>
                )}
              </div>
            </div>

            <RegisterForm 
              documentNumber={userData.numero}
              onRegisterComplete={handleRegisterComplete}
            />

            <div className="mt-6 text-center">
              <button
                onClick={() => setStep('welcome')}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                ← Cancelar y volver al inicio
              </button>
            </div>
          </div>
        )}

        {step === 'dashboard' && registeredUser && (
          <Dashboard userData={registeredUser} onLogout={handleLogout} />
        )}
      </div>
    </div>
  )
}
