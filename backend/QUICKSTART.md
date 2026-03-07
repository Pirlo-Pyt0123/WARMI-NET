# 🚀 Inicio Rápido - Warmi Net Backend

## Paso 1: Configurar Base de Datos en XAMPP

### Opción A: Usar phpMyAdmin (Recomendado para empezar)

1. Abrir XAMPP Control Panel
2. Iniciar **Apache** y **MySQL**
3. Abrir phpMyAdmin: http://localhost/phpmyadmin
4. Clic en "Nueva" para crear base de datos
5. Nombre: `warmi_net`
6. Cotejamiento: `utf8mb4_unicode_ci`
7. Clic en "Crear"
8. Seleccionar la base `warmi_net`
9. Ir a pestaña "Importar"
10. **Importar el archivo**: `backend/sql/init.sql`
11. Clic en "Continuar"

### Opción B: Línea de comandos MySQL

```bash
# Abrir CMD o PowerShell
cd C:\xampp\mysql\bin

# Conectar a MySQL
.\mysql.exe -u root -p

# Crear base de datos
CREATE DATABASE warmi_net CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Salir
exit

# Importar estructura
.\mysql.exe -u root warmi_net < "C:\Users\LENOVO\Documents\warmi-net\backend\sql\init.sql"
```

---

## Paso 2: Iniciar Backend

```bash
cd backend
npm run dev
```

Deberías ver:

```
✅ Base de datos MySQL conectada correctamente
🚀 Warmi Net Backend API
📡 Servidor escuchando en puerto 5000
💚 Health check: http://localhost:5000/api/health
```

---

## Paso 3: Probar la API

### Verificar que funciona

Abre tu navegador o usa curl:

```
http://localhost:5000/api/health
```

Respuesta esperada:

```json
{
  "success": true,
  "message": "Warmi Net API funcionando correctamente",
  "timestamp": "2026-03-07T..."
}
```

### Probar registro de usuario

```bash
# Con PowerShell
Invoke-RestMethod -Uri http://localhost:5000/api/auth/register -Method POST -ContentType "application/json" -Body '{"ci":"12345678","nombres":"Juan","apellidos":"Perez","edad":25,"usuario":"juanp","pin":"1234","faceDescriptor":[]}'
```

---

## Paso 4: Ver Comunidades Iniciales

```
GET http://localhost:5000/api/communities
```

Deberías ver 4 comunidades:
- Barrio Japón
- Mercado Central
- Villa Copacabana
- Zona Sur

---

## 🐛 Problemas Comunes

### Error: "Cannot connect to database"

**Solución**: Verificar que MySQL esté corriendo en XAMPP

### Error: "Database does not exist"

**Solución**: Importar el archivo `sql/init.sql` en phpMyAdmin

### Error: "Port 5000 already in use"

**Solución**: Cambiar el puerto en `.env`:
```
PORT=5001
```

### Error: "Access denied for user 'root'"

**Solución**: Actualizar `.env` con tu contraseña de MySQL:
```
DB_PASSWORD=tu_contraseña
```

---

## 📝 Endpoints Principales

```
POST   /api/auth/register          # Registrar usuario
POST   /api/auth/login             # Login
GET    /api/communities            # Ver comunidades
POST   /api/communities/:id/join   # Unirse (requiere token)
GET    /api/services               # Ver servicios
POST   /api/services               # Crear servicio (requiere token)
```

---

## 🎯 Siguiente Paso

Ahora conecta tu **frontend de React** con el backend:

1. Actualizar URL del backend en el frontend: `http://localhost:5000`
2. Modificar las llamadas API para usar los nuevos endpoints
3. Guardar el token JWT en localStorage
4. Incluir el token en los headers de las peticiones protegidas

---

## 🐳 Alternativa: Usar Docker (Opcional)

Si prefieres Docker en lugar de XAMPP:

```bash
cd backend
docker-compose up -d
```

Esto inicia MySQL y el backend automáticamente.

---

**✅ ¡Listo! Tu backend está funcionando**
