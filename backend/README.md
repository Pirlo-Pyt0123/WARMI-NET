# Warmi Net - Backend API

API REST para la plataforma de red social comunitaria Warmi Net.

## 🛠️ Stack Tecnológico

- **Node.js** + **Express.js**
- **MySQL 8.0** con conexiones pool
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas
- **Docker** + **Docker Compose** para contenerización

## 📦 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración (DB, etc.)
│   ├── controllers/     # Lógica de negocio
│   ├── models/          # Modelos de datos
│   ├── routes/          # Definición de rutas
│   ├── middleware/      # Middleware (auth, validation)
│   ├── utils/           # Utilidades
│   ├── app.js          # Configuración de Express
│   └── server.js       # Punto de entrada
├── sql/
│   └── init.sql        # Script SQL inicial
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 🚀 Instalación y Uso

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar el repositorio
cd backend

# 2. Iniciar servicios con Docker
docker-compose up -d

# 3. Ver logs
docker-compose logs -f backend
```

La base de datos y el servidor se iniciarán automáticamente en:
- **Backend API**: http://localhost:5000
- **MySQL**: localhost:3306

### Opción 2: Sin Docker (XAMPP)

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar archivo de entorno
cp .env.example .env

# 3. Configurar .env con tus datos de XAMPP
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=warmi_net

# 4. Crear base de datos en MySQL (usando phpMyAdmin o MySQL Workbench)
# Importar el archivo: sql/init.sql

# 5. Iniciar servidor en modo desarrollo
npm run dev

# O en producción
npm start
```

## 📡 Endpoints Disponibles

### Autenticación (`/api/auth`)

```
POST   /register           - Registrar nuevo usuario
POST   /login              - Iniciar sesión (CI + PIN)
POST   /verify-face        - Verificar rostro (obtener descriptor)
GET    /me                 - Obtener perfil del usuario autenticado
PUT    /profile            - Actualizar perfil
```

### Comunidades (`/api/communities`)

```
GET    /                   - Listar todas las comunidades
GET    /:id                - Obtener comunidad por ID
POST   /                   - Crear nueva comunidad (requiere auth)
POST   /:id/join           - Unirse a comunidad (requiere auth)
POST   /:id/leave          - Salir de comunidad (requiere auth)
GET    /:id/members        - Obtener miembros de la comunidad
GET    /:id/services       - Obtener servicios de la comunidad
PUT    /:id                - Actualizar comunidad (requiere auth)
```

### Servicios (`/api/services`)

```
GET    /                   - Listar servicios (feed general)
GET    /:id                - Obtener servicio por ID
POST   /                   - Crear servicio (requiere auth)
PUT    /:id                - Actualizar servicio (requiere auth)
DELETE /:id                - Eliminar servicio (requiere auth)
POST   /:id/contact        - Registrar contacto
POST   /:id/reviews        - Agregar reseña (requiere auth)
GET    /:id/reviews        - Obtener reseñas del servicio
```

## 🔐 Autenticación

El sistema utiliza **JWT (JSON Web Tokens)**. Para acceder a rutas protegidas:

```javascript
// Headers
{
  "Authorization": "Bearer <tu_token_jwt>"
}
```

Ejemplo de uso con fetch:

```javascript
const response = await fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🗄️ Base de Datos

### Tablas Principales

- **users** - Usuarios con verificación biométrica
- **communities** - Comunidades/barrios
- **community_members** - Relación usuarios-comunidades
- **services** - Servicios y productos
- **service_reviews** - Reseñas de servicios
- **messages** - Sistema de mensajería
- **notifications** - Notificaciones

### Triggers Automáticos

- Actualización de contadores (total_miembros, total_servicios)
- Gestión de estadísticas en tiempo real

## 🧪 Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Registro de usuario
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "ci": "12345678",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "edad": 25,
    "usuario": "juanp",
    "pin": "1234",
    "faceDescriptor": []
  }'
```

## 🐳 Comandos Docker Útiles

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Reconstruir imágenes
docker-compose up -d --build

# Acceder a MySQL
docker exec -it warmi_mysql mysql -u warmi_user -p
# Password: warmi_pass_2026

# Borrar todo y empezar de nuevo
docker-compose down -v
docker-compose up -d
```

## 📝 Variables de Entorno

```env
# Puerto del servidor
PORT=5000

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=warmi_net

# JWT
JWT_SECRET=tu_secret_super_seguro
JWT_EXPIRES_IN=7d

# Entorno
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

## 🛡️ Seguridad

- ✅ Helmet.js para headers de seguridad
- ✅ Rate limiting (100 requests/15min por IP)
- ✅ CORS configurado
- ✅ Validación de datos con express-validator
- ✅ Hash de PINs con bcryptjs
- ✅ JWT con expiración

## 📊 Monitoreo

Los logs incluyen:
- Timestamp de cada petición
- Método HTTP y ruta
- Errores con stack trace (en desarrollo)

## 🚀 Despliegue en Producción

### AWS EC2

```bash
# 1. Conectar por SSH
ssh -i key.pem ec2-user@ip-address

# 2. Clonar repositorio
git clone https://github.com/Pirlo-Pyt0123/WARMI-NET.git

# 3. Iniciar con Docker
cd WARMI-NET/backend
docker-compose up -d
```

### Railway / Heroku

1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático

## 📧 Soporte

Para problemas o preguntas, crear un issue en el repositorio.

---

**Desarrollado con ❤️ para la comunidad Warmi Net**
