import { useState } from 'react'
import { User, Calendar, Lock, CheckCircle, AlertCircle } from 'lucide-react'

export default function RegisterForm({ documentNumber, onRegisterComplete }) {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    edad: '',
    pin: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generar preview del username
  const generarUsernamePreview = () => {
    if (!formData.nombres || !formData.apellidos) return 'tunombre1234'
    const primeraLetraNombre = formData.nombres.trim().charAt(0).toLowerCase()
    const apellido = formData.apellidos.trim().split(' ')[0].toLowerCase().replace(/\s+/g, '')
    const ultimosDigitosCI = documentNumber.slice(-4)
    return `${primeraLetraNombre}${apellido}${ultimosDigitosCI}`
  }

  const validateAge = (age) => {
    const ageNum = parseInt(age)
    return !isNaN(ageNum) && ageNum >= 18 && ageNum <= 120
  }

  const validatePin = (pin) => {
    return /^\d{4}$/.test(pin)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let newErrors = { ...errors }
    
    if (name === 'edad') {
      if (value && !/^\d*$/.test(value)) return
      
      if (value && !validateAge(value)) {
        newErrors.edad = 'Debes ser mayor de 18 años'
      } else {
        delete newErrors.edad
      }
    }
    
    if (name === 'pin') {
      if (value && !/^\d*$/.test(value)) return
      if (value.length > 4) return
      
      if (value.length > 0 && value.length < 4) {
        newErrors.pin = 'El PIN debe tener 4 dígitos'
      } else if (value.length === 4) {
        delete newErrors.pin
      }
    }
    
    if (name === 'nombres' || name === 'apellidos') {
      if (value && value.length < 2) {
        newErrors[name] = 'Debe tener al menos 2 caracteres'
      } else {
        delete newErrors[name]
      }
    }
    
    setErrors(newErrors)
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nombres || formData.nombres.length < 2) {
      newErrors.nombres = 'Los nombres son obligatorios (mínimo 2 caracteres)'
    }
    
    if (!formData.apellidos || formData.apellidos.length < 2) {
      newErrors.apellidos = 'Los apellidos son obligatorios (mínimo 2 caracteres)'
    }
    
    if (!formData.edad) {
      newErrors.edad = 'La edad es obligatoria'
    } else if (!validateAge(formData.edad)) {
      newErrors.edad = 'Debes ser mayor de 18 años'
    }
    
    if (!formData.pin) {
      newErrors.pin = 'El PIN es obligatorio'
    } else if (!validatePin(formData.pin)) {
      newErrors.pin = 'El PIN debe tener exactamente 4 dígitos'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generar username único a partir del nombre
    // Formato: primera letra del nombre + apellido (sin espacios, lowercase) + últimos 4 dígitos del CI
    const generarUsername = () => {
      const primeraLetraNombre = formData.nombres.trim().charAt(0).toLowerCase()
      const apellido = formData.apellidos.trim().split(' ')[0].toLowerCase() // Primer apellido
      const ultimosDigitosCI = documentNumber.slice(-4) // Últimos 4 dígitos del CI
      return `${primeraLetraNombre}${apellido}${ultimosDigitosCI}`
    }
    
    const userData = {
      ci: documentNumber, // CI es el número del documento escaneado
      usuario: generarUsername(), // Usuario es el nombre generado
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      edad: parseInt(formData.edad),
      pin: formData.pin,
      nombreCompleto: `${formData.nombres.trim()} ${formData.apellidos.trim()}`,
      fechaRegistro: new Date().toISOString()
    }
    
    if (onRegisterComplete) {
      onRegisterComplete(userData)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <User className="w-8 h-8 text-warmi-magenta" />
          <h2 className="text-2xl font-bold text-gray-800">Registro de Usuario</h2>
        </div>
        <p className="text-gray-600">Completa tus datos para finalizar el registro</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Número de Documento
          </label>
          <div className="relative">
            <input
              type="text"
              value={documentNumber}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-xl font-mono font-bold text-gray-600 cursor-not-allowed"
            />
            <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ✓ Extraído automáticamente de tu documento
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Usuario
          </label>
          <div className="relative">
            <input
              type="text"
              value={generarUsernamePreview()}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-xl font-mono text-gray-600 cursor-not-allowed"
            />
            <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ✓ Generado automáticamente: @{generarUsernamePreview()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombres *
          </label>
          <input
            type="text"
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
              errors.nombres 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-warmi-magenta focus:ring-warmi-pink focus:ring-opacity-20'
            }`}
            placeholder="Ej: Juan Carlos"
          />
          {errors.nombres && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.nombres}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Apellidos *
          </label>
          <input
            type="text"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
              errors.apellidos 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-warmi-magenta focus:ring-warmi-pink focus:ring-opacity-20'
            }`}
            placeholder="Ej: García López"
          />
          {errors.apellidos && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.apellidos}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Edad *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              maxLength="3"
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                errors.edad 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-warmi-magenta focus:ring-warmi-pink focus:ring-opacity-20'
              }`}
              placeholder="Ej: 25"
            />
          </div>
          {errors.edad && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.edad}
            </p>
          )}
          {!errors.edad && formData.edad && validateAge(formData.edad) && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Edad válida ✓
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            PIN de Seguridad (4 dígitos) *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="password"
              name="pin"
              value={formData.pin}
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
          {!errors.pin && formData.pin.length === 4 && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              PIN válido ✓
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Este PIN será tu contraseña de acceso
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition ${
            isSubmitting || Object.keys(errors).length > 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-warmi-magenta to-warmi-pink hover:shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Completar Registro
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        * Campos obligatorios
      </p>
    </div>
  )
}
