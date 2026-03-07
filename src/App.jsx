import { useState } from 'react'
import { Heart, Thermometer, Users, Sparkles, Clock, Shield, LogOut } from 'lucide-react'
import LoginPage from './pages/LoginPage'
import SplashScreen from './components/SplashScreen'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)

  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Conexiones Auténticas",
      description: "Encuentra personas que compartan tus intereses y valores"
    },
    {
      icon: <Thermometer className="w-8 h-8" />,
      title: "Ambiente Cálido",
      description: "Crea conexiones genuinas en un espacio seguro y acogedor"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Comunidad Activa",
      description: "Únete a miles de usuarios que ya encontraron su match"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Experiencia Premium",
      description: "Interfaz moderna y funciones exclusivas para ti"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Disponible 24/7",
      description: "Conecta cuando quieras, donde quieras"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "100% Seguro",
      description: "Tu privacidad y seguridad son nuestra prioridad"
    }
  ]

  // Manejar autenticación exitosa
  const handleLoginSuccess = (data) => {
    setUserData(data)
    setIsAuthenticated(true)
  }

  // Cerrar sesión
  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserData(null)
  }

  // Mostrar splash screen al inicio
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  // Si NO está autenticado, mostrar SOLO el login
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  // Página de inicio
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-warmi-purple to-warmi-intense rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-warmi-purple to-warmi-magenta bg-clip-text text-transparent">
              Warmy
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-gray-600 hover:text-warmi-magenta transition">Características</a>
            <a href="#about" className="text-gray-600 hover:text-warmi-magenta transition">Sobre nosotros</a>
            <a href="#contact" className="text-gray-600 hover:text-warmi-magenta transition">Contacto</a>
          </nav>
          <div className="flex items-center gap-4">
            {userData && (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <div className="text-right">
                  <div className="font-semibold text-gray-800">{userData.nombres}</div>
                  <div className="text-gray-500 text-xs">{userData.numero}</div>
                </div>
              </div>
            )}
            <button 
              onClick={handleLogout}
              className="bg-gradient-to-r from-warmi-purple to-warmi-intense text-white px-6 py-2 rounded-full hover:shadow-lg transition transform hover:scale-105 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-warmi-purple via-warmi-magenta to-warmi-pink bg-clip-text text-transparent">
            ¡Bienvenido{userData?.nombres ? `, ${userData.nombres.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Encuentra tu conexión perfecta. La plataforma más cálida y segura para relaciones auténticas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-gradient-to-r from-warmi-magenta to-warmi-pink text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Explorar Perfiles
            </button>
            <button className="bg-white text-warmi-magenta px-8 py-4 rounded-full font-semibold border-2 border-purple-200 hover:border-warmi-magenta transition transform hover:scale-105">
              Completar Perfil
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="text-4xl font-bold text-warmi-magenta mb-2">10K+</div>
            <div className="text-gray-600">Usuarios Activos</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="text-4xl font-bold text-warmi-magenta mb-2">50K+</div>
            <div className="text-gray-600">Matches Exitosos</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="text-4xl font-bold text-warmi-magenta mb-2">4.9★</div>
            <div className="text-gray-600">Calificación</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-800">¿Por qué elegir Warmy?</h2>
          <p className="text-xl text-gray-600">Funciones diseñadas para crear conexiones reales</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition transform hover:-translate-y-2 cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-warmi-magenta to-warmi-pink rounded-2xl flex items-center justify-center text-white mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-warmi-purple to-warmi-magenta rounded-3xl p-12 text-center text-white max-w-4xl mx-auto shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">¡Empieza a Conectar!</h2>
          <p className="text-xl mb-8 opacity-90">
            Tu perfil está verificado. Es hora de encontrar tu match perfecto
          </p>
          <button 
            className="bg-white text-warmi-magenta px-8 py-4 rounded-full font-semibold hover:shadow-xl transition transform hover:scale-105"
          >
            Ver Matches Recomendados
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-warmi-magenta to-warmi-pink rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <span className="text-xl font-bold">Warmy</span>
          </div>
          <p className="text-gray-400 mb-4">
            Conectando corazones desde 2026
          </p>
          <div className="flex gap-6 justify-center text-sm text-gray-400">
            <a href="#" className="hover:text-warmi-pink transition">Términos</a>
            <a href="#" className="hover:text-warmi-pink transition">Privacidad</a>
            <a href="#" className="hover:text-warmi-pink transition">Ayuda</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
