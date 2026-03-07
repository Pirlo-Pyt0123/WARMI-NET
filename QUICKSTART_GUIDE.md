# 🚀 Guía de Inicio Rápido - Warmi Net

## ⚡ Inicio Rápido en 3 Pasos

### 1️⃣ Configurar y Iniciar Backend

```powershell
# Navegar a la carpeta backend
cd backend

# Instalar dependencias (solo la primera vez)
npm install

# Copiar archivo de configuración (solo la primera vez)
copy .env.example .env
# Edita el archivo .env con tus credenciales de MySQL

# Iniciar el servidor backend
npm start
```

**✅ Verificación:** Deberías ver:
```
🚀 Warmi Net Backend API
📡 Servidor escuchando en puerto 5000
```

### 2️⃣ Configurar y Iniciar Frontend

En una **nueva terminal**:

```powershell
# Volver a la raíz del proyecto
cd ..

# Instalar dependencias (solo la primera vez)
npm install

# Crear archivo .env (solo la primera vez)
echo VITE_API_URL=http://localhost:5000 > .env

# Iniciar el servidor de desarrollo
npm run dev
```

**✅ Verificación:** Deberías ver:
```
  VITE ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

### 3️⃣ Verificar la Conexión

1. Abre tu navegador en `http://localhost:5173`
2. Abre la consola del navegador (F12)
3. Deberías ver mensajes de verificación del backend

## 🔧 Configuración de Base de Datos

### Primera vez configurando MySQL:

```powershell
cd backend

# Ejecutar script de verificación de MySQL
.\verificar-mysql.bat

# Si MySQL está corriendo, inicializar la base de datos
npm run init-db
```

## ❌ Solución de Problemas

### Error: "Failed to Fetch" en Login

**Causa:** El backend no está ejecutándose o no está accesible.

**Solución:**
1. Verifica que el backend esté corriendo: `cd backend && npm start`
2. Verifica que MySQL esté corriendo: `cd backend && .\verificar-mysql.bat`
3. Verifica la URL del backend en `.env`: `VITE_API_URL=http://localhost:5000`
4. Prueba acceder a: http://localhost:5000/api/health

### El backend se cierra solo

**Causa:** Error de conexión a MySQL.

**Solución:**
1. Verifica que MySQL esté ejecutándose
2. Verifica las credenciales en `backend/.env`
3. Revisa los logs del backend para más detalles

### Error de CORS

**Causa:** El frontend está en un puerto no permitido.

**Solución:**
1. Verifica que `FRONTEND_URL` en `backend/.env` sea `http://localhost:5173`
2. Si usas otro puerto, agrégalo en `backend/src/app.js` en el array `allowedOrigins`

## 📋 Checklist Diario

Antes de empezar a trabajar:

- [ ] MySQL está ejecutándose
- [ ] Backend está ejecutándose en puerto 5000
- [ ] Frontend está ejecutándose en puerto 5173
- [ ] Los archivos .env están configurados correctamente
- [ ] Puedes acceder a http://localhost:5000/api/health

## 🛠️ Comandos Útiles

```powershell
# Ver si el backend está respondiendo
curl http://localhost:5000/api/health

# Reiniciar el backend
cd backend
# Ctrl+C para detener
npm start

# Reiniciar el frontend
cd ..
# Ctrl+C para detener
npm run dev

# Ver logs del backend con más detalle
cd backend
$env:NODE_ENV="development"; npm start

# Limpiar y reinstalar dependencias
cd backend
rm -r node_modules
npm install

cd ..
rm -r node_modules
npm install
```

## 📱 Estructura de Puertos

- **Frontend (Vite):** http://localhost:5173
- **Backend (Express):** http://localhost:5000
- **MySQL:** localhost:3306

## 🔐 Credenciales por Defecto

### MySQL (backend/.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=warmi_net
DB_PORT=3306
```

### JWT Secret (backend/.env)
```
JWT_SECRET=tu_clave_secreta_super_segura_aqui
```

## 📖 Documentación Adicional

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Guía completa de problemas
- [Backend README](./backend/README.md) - Documentación del backend
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía de despliegue

## 🆘 Soporte

Si después de seguir esta guía sigues teniendo problemas:

1. Verifica los logs del backend en la terminal
2. Verifica los errores en la consola del navegador (F12)
3. Revisa [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. Asegúrate de tener todas las dependencias instaladas
