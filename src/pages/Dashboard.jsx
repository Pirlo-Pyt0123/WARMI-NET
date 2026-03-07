import { useState } from 'react'
import { User, Menu, X, LogOut, Users, Plus, Package, MapPin } from 'lucide-react'
import logoWarmi from '../assets/LogoWarmi.png'

export default function Dashboard({ userData, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [showJoinModal, setShowJoinModal] = useState(false)

  // Comunidades disponibles
  const communities = [
    { id: 1, name: 'Barrio Japón', members: 45, services: 12 },
    { id: 2, name: 'Mercado Central', members: 78, services: 24 },
    { id: 3, name: 'Villa Copacabana', members: 32, services: 8 },
    { id: 4, name: 'Zona Sur', members: 56, services: 15 }
  ]

  // Servicios/Productos de ejemplo
  const services = [
    {
      id: 1,
      title: 'Clases de Costura',
      description: 'Aprende a coser y reparar ropa',
      community: 'Barrio Japón',
      author: 'María López',
      type: 'Servicio',
      price: 'Bs. 50/mes'
    },
    {
      id: 2,
      title: 'Venta de Pan Casero',
      description: 'Pan fresco todos los días',
      community: 'Mercado Central',
      author: 'Juan Pérez',
      type: 'Producto',
      price: 'Bs. 5/unidad'
    },
    {
      id: 3,
      title: 'Plomería a Domicilio',
      description: 'Reparación de grifos y cañerías',
      community: 'Barrio Japón',
      author: 'Carlos Mamani',
      type: 'Servicio',
      price: 'Bs. 100/visita'
    },
    {
      id: 4,
      title: 'Verduras Orgánicas',
      description: 'Verduras frescas de la huerta',
      community: 'Villa Copacabana',
      author: 'Ana Quispe',
      type: 'Producto',
      price: 'Bs. 30/paquete'
    },
    {
      id: 5,
      title: 'Clases de Inglés',
      description: 'Clases particulares nivel básico',
      community: 'Mercado Central',
      author: 'Pedro Silva',
      type: 'Servicio',
      price: 'Bs. 80/hora'
    },
    {
      id: 6,
      title: 'Masajes Terapéuticos',
      description: 'Alivio del estrés y dolores',
      community: 'Zona Sur',
      author: 'Rosa Condori',
      type: 'Servicio',
      price: 'Bs. 120/sesión'
    }
  ]

  // Filtrar servicios según comunidad seleccionada
  const displayedServices = selectedCommunity
    ? services.filter(s => s.community === selectedCommunity.name)
    : services

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoWarmi} alt="Warmi Net" className="w-10 h-10 rounded-full object-cover" />
              <span className="text-2xl font-bold text-purple-600">
                Warmi Net
              </span>
            </div>
            
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-purple-50 rounded-lg transition"
            >
              {menuOpen ? (
                <X className="w-6 h-6 text-purple-600" />
              ) : (
                <Menu className="w-6 h-6 text-purple-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMenuOpen(false)}>
          <div 
            className="absolute top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800">Menú</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="mb-8 p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {userData.nombres.charAt(0)}{userData.apellidos.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{userData.nombreCompleto}</h3>
                    <p className="text-xs text-gray-600">@{userData.usuario}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700"><strong>CI:</strong> {userData.documentNumber}</p>
                  <p className="text-gray-700"><strong>Edad:</strong> {userData.edad} años</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-xl transition text-left"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Mi Perfil</span>
                </button>

                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition text-left text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-semibold">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con título y acciones */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedCommunity ? selectedCommunity.name : 'Tablero de Comunidades'}
              </h1>
              <p className="text-gray-600">
                {selectedCommunity 
                  ? `Servicios y productos de ${selectedCommunity.name}`
                  : 'Descubre servicios y productos de todas las comunidades'}
              </p>
            </div>
            <div className="flex gap-3">
              {selectedCommunity ? (
                <>
                  <button
                    onClick={() => setSelectedCommunity(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold"
                  >
                    ← Volver
                  </button>
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-semibold flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Unirse a Comunidad
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tablero de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedServices.map(service => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {service.type === 'Servicio' ? (
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-pink-600" />
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    service.type === 'Servicio' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-pink-100 text-pink-700'
                  }`}>
                    {service.type}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {service.description}
                </p>

                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="font-semibold">{service.community}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    Por <span className="font-semibold text-gray-800">{service.author}</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {service.price}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayedServices.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No hay servicios disponibles
            </h3>
            <p className="text-gray-600">
              Sé el primero en agregar un servicio o producto a esta comunidad
            </p>
          </div>
        )}
      </main>

      {/* Modal para unirse a comunidad */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Unirse a una Comunidad</h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Selecciona una comunidad para ver y compartir servicios con tus vecinos
            </p>

            <div className="space-y-3">
              {communities.map(community => (
                <button
                  key={community.id}
                  onClick={() => {
                    setSelectedCommunity(community)
                    setShowJoinModal(false)
                  }}
                  className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition text-left border-2 border-transparent hover:border-purple-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">{community.name}</h3>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>👥 {community.members} miembros</span>
                        <span>📦 {community.services} servicios</span>
                      </div>
                    </div>
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
