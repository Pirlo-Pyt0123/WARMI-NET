# Guía de Solución de Problemas - Warmi Net

## Error: "Failed to Fetch" en Login

Este error ocurre cuando el frontend no puede conectarse al backend. Aquí están las soluciones:

### 1. Verificar que el Backend esté Ejecutándose

```powershell
# En la carpeta backend/
cd backend
npm start
```

Deberías ver:
```
🚀 Warmi Net Backend API
📡 Servidor escuchando en puerto 5000
💚 Health check: http://localhost:5000/api/health
```

### 2. Verificar la Conexión del Backend

Abre tu navegador y ve a: `http://localhost:5000/api/health`

Deberías ver:
```json
{
  "success": true,
  "message": "Warmi Net API funcionando correctamente",
  "timestamp": "..."
}
```

### 3. Verificar Variables de Entorno

#### Frontend (.env en la raíz del proyecto)
```
VITE_API_URL=http://localhost:5000
```

#### Backend (backend/.env)
```
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 4. Verificar que MySQL esté Funcionando

```powershell
# En la carpeta backend/
.\verificar-mysql.bat
```

### 5. Verificar CORS

Si estás usando un puerto diferente para el frontend, asegúrate de agregarlo en `backend/src/app.js`:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:TU_PUERTO_AQUI',
  // ...
];
```

## Problemas Comunes

### El backend se detiene automáticamente
- Verifica que MySQL esté funcionando
- Revisa los logs del backend para errores de conexión a la base de datos

### Error de CORS
- Asegúrate de que `FRONTEND_URL` en backend/.env coincida con tu URL del frontend
- Reinicia el backend después de cambiar variables de entorno

### Timeout en las peticiones
- Verifica tu conexión a internet
- El backend puede estar sobrecargado o la base de datos lenta
- Aumenta el timeout en `src/utils/api.js` si es necesario

### Credenciales incorrectas
- Verifica que el usuario esté registrado en la base de datos
- El PIN debe ser de 4 dígitos
- El CI debe estar registrado correctamente

## Checklist Rápido

Cuando tengas "Failed to Fetch":

- [ ] ¿El backend está ejecutándose? (`npm start` en carpeta backend)
- [ ] ¿MySQL está funcionando? (`.\verificar-mysql.bat`)
- [ ] ¿Puedes acceder a http://localhost:5000/api/health?
- [ ] ¿Existen los archivos .env con la configuración correcta?
- [ ] ¿Los puertos en .env coinciden con los que estás usando?
- [ ] ¿Hay errores en la consola del navegador? (F12)
- [ ] ¿Hay errores en la consola del backend?

## Comandos Útiles

```powershell
# Iniciar backend
cd backend
npm start

# Iniciar frontend
cd ..
npm run dev

# Verificar MySQL
cd backend
.\verificar-mysql.bat

# Ver logs detallados del backend
cd backend
$env:NODE_ENV="development"; npm start

# Reiniciar todo desde cero
# 1. Detener todo (Ctrl+C en ambas consolas)
# 2. Reiniciar MySQL si es necesario
# 3. Iniciar backend
cd backend
npm start
# 4. En otra terminal, iniciar frontend
cd ..
npm run dev
```

## Contacto y Soporte

Si el problema persiste después de seguir esta guía:
1. Revisa los logs del backend en la consola
2. Revisa los errores en la consola del navegador (F12)
3. Verifica que todos los archivos .env estén configurados correctamente
