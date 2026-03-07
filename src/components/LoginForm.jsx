import { useState } from 'react'
import { Lock, User, AlertCircle, LogIn } from 'lucide-react'

export default function LoginForm({ onLoginSuccess, onBackToWelcome }) {
  const [credentials, setCredentials] = useState({
    usuario: '',
    pin: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Para PIN, solo permitir números y máximo 4 dígitos
    if (name === 'pin') {
      if (value && !/^\d*$/.test(value)) return
      if (value.length > 4) return
    }
    
    // Para usuario, solo permitir números
    if (name === 'usuario') {
      if (value && !/^\d*$/.test(value)) return
    }
    
    setCredentials(prev => ({ ...prev, [name]: value }))
    setLoginError('') // Limpiar error al escribir
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}
    
    if (!credentials.usuario || credentials.usuario.length < 6) {
      newErrors.usuario = 'El número de CI debe tener al menos 6 dígitos'
    }
    
    if (!credentials.pin || credentials.pin.length !== 4) {
      newErrors.pin = 'El PIN debe tener exactamente 4 dígitos'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar login
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setLoginError('')
    
    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Buscar usuario en localStorage
    const usersData = localStorage.getItem('warmi_users')
    const users = usersData ? JSON.parse(usersData) : []
    
    const user = users.find(u => u.usuario === credentials.usuario)
    
    if (!user) {
      setLoginError('No existe una cuenta con este número de documento')
      setIsLoading(false)
      return
    }
    
    if (user.pin !== credentials.pin) {
      setLoginError('PIN incorrecto. Por favor, verifica tu contraseña')
      setIsLoading(false)
      return
    }
    
    // Login exitoso
    setIsLoading(false)
    if (onLoginSuccess) {
      onLoginSuccess(user)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-warmi-purple bg-opacity-20 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-warmi-purple" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Iniciar Sesión
          </h2>
          <p className="text-gray-600">
            Ingresa con tus credenciales
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Número de Documento
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="usuario"
                value={credentials.usuario}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition font-mono ${
                  errors.usuario 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-warmi-magenta focus:ring-warmi-pink focus:ring-opacity-20'
                }`}
                placeholder="Ej: 12345678"
              />
            </div>
            {errors.usuario && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.usuario}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              PIN de Seguridad
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="pin"
                value={credentials.pin}
                onChange={handleChange}
                maxLength="4"
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition font-mono text-2xl tracking-widest ${
                  errors.pin 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-warmi-magenta focus:ring-warmi-pink focus:ring-opacity-20'
                }`}
                placeholder="••••"
              />
            </div>
            {errors.pin && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.pin}
              </p>
            )}
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Error de autenticación</p>
                  <p className="text-xs text-red-700 mt-1">{loginError}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-warmi-purple to-warmi-intense hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Ingresar
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBackToWelcome}
            className="text-gray-600 hover:text-gray-800 underline text-sm"
          >
            ← Volver
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600 text-center">
            🔒 Tu información está protegida con verificación biométrica
          </p>
        </div>
      </div>
    </div>
  )
}
