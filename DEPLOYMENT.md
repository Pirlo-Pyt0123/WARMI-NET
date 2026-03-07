# 🚀 Guía de Despliegue en AWS

## Arquitectura Propuesta

### Frontend (React)
- **AWS Amplify** o **S3 + CloudFront**

### Backend (Pendiente de implementar)
- **API Gateway + Lambda** (Serverless)
- **DynamoDB** (Base de datos NoSQL)
- **S3** (Almacenamiento de imágenes biométricas)
- **Cognito** (Autenticación de usuarios)

---

## 📦 Opción 1: AWS Amplify (Recomendado para empezar)

### Ventajas
- ✅ Despliegue automático desde GitHub
- ✅ CI/CD integrado
- ✅ HTTPS automático
- ✅ Preview de pull requests
- ✅ Logs y monitoreo

### Pasos
1. Ir a AWS Amplify Console
2. Conectar repositorio GitHub: `Pirlo-Pyt0123/WARMI-NET`
3. Configurar build:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
4. Desplegar

### Variables de entorno (futuras)
```
VITE_API_URL=https://api.warmi-net.com
VITE_S3_BUCKET=warmi-net-uploads
VITE_COGNITO_USER_POOL_ID=xxxxx
```

---

## 📦 Opción 2: S3 + CloudFront (Más económico)

### Pasos

1. **Crear bucket S3**
   ```bash
   aws s3 mb s3://warmi-net-frontend
   aws s3 website s3://warmi-net-frontend --index-document index.html
   ```

2. **Build del proyecto**
   ```bash
   npm run build
   ```

3. **Subir archivos**
   ```bash
   aws s3 sync dist/ s3://warmi-net-frontend --delete
   ```

4. **Configurar CloudFront**
   - Origin: S3 bucket
   - Viewer Protocol: Redirect HTTP to HTTPS
   - Default Root Object: index.html
   - Error Pages: Redirect 404 → /index.html (para SPA routing)

---

## 🔧 Backend (Por implementar)

### 1. Base de Datos DynamoDB

**Tablas necesarias:**

```javascript
// Tabla: Users
{
  PK: "USER#<ci>",
  SK: "PROFILE",
  nombres: String,
  apellidos: String,
  edad: Number,
  faceDescriptor: Array, // 128 dimensiones
  documentImage: String, // S3 URL
  createdAt: Timestamp
}

// Tabla: Communities
{
  PK: "COMMUNITY#<id>",
  SK: "INFO",
  name: String,
  members: Number,
  createdAt: Timestamp
}

// Tabla: Services
{
  PK: "COMMUNITY#<id>",
  SK: "SERVICE#<serviceId>",
  title: String,
  description: String,
  type: String, // "Servicio" | "Producto"
  price: String,
  author: String,
  createdAt: Timestamp
}
```

### 2. API con Lambda + API Gateway

**Endpoints necesarios:**

```
POST   /auth/register          - Registrar usuario
POST   /auth/login             - Login con CI + PIN
GET    /auth/verify-face       - Verificar rostro

GET    /communities            - Listar comunidades
POST   /communities            - Crear comunidad
GET    /communities/:id        - Obtener comunidad

GET    /services               - Listar servicios (todos)
GET    /communities/:id/services - Servicios de comunidad
POST   /services               - Crear servicio/producto
```

**Ejemplo de función Lambda (Node.js):**

```javascript
// lambda/auth/register.js
export const handler = async (event) => {
  const { nombres, apellidos, ci, edad, faceDescriptor } = JSON.parse(event.body);
  
  // Guardar en DynamoDB
  await dynamodb.put({
    TableName: 'WarmiNetUsers',
    Item: {
      PK: `USER#${ci}`,
      SK: 'PROFILE',
      nombres,
      apellidos,
      edad,
      faceDescriptor
    }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
```

### 3. Almacenamiento S3

**Buckets necesarios:**
- `warmi-net-faces` - Imágenes de verificación facial
- `warmi-net-documents` - Carnets escaneados
- `warmi-net-avatars` - Fotos de perfil

**Políticas de acceso:**
- Privado con acceso vía CloudFront signed URLs
- Lifecycle: Eliminar imágenes temporales después de 30 días

### 4. Cognito (Opcional)

Si usas Cognito en lugar de sistema custom:
- User Pool para autenticación
- Atributos personalizados: CI, edad
- MFA opcional con SMS

---

## 💰 Estimación de Costos (Mes)

### Tier Gratuito (12 meses)
- Lambda: 1M requests gratis
- DynamoDB: 25GB + 25 WCU/RCU gratis
- S3: 5GB gratis
- CloudFront: 50GB gratis

### Después del tier gratuito (~100 usuarios activos)
- Amplify Hosting: ~$15/mes
- Lambda: ~$5/mes
- DynamoDB: ~$10/mes
- S3: ~$5/mes
- **Total: ~$35/mes**

---

## 📝 Próximos Pasos

1. ✅ Frontend subido a GitHub
2. ⏳ Crear estructura de backend
3. ⏳ Implementar API REST con Lambda
4. ⏳ Configurar DynamoDB
5. ⏳ Integrar S3 para imágenes
6. ⏳ Desplegar frontend en Amplify
7. ⏳ Configurar dominio personalizado

---

## 🔐 Seguridad

- [ ] CORS configurado correctamente
- [ ] Validación de tokens JWT
- [ ] Rate limiting en API Gateway
- [ ] Encriptación de datos sensibles
- [ ] HTTPS obligatorio
- [ ] IAM roles con permisos mínimos

---

## 📊 Monitoreo

- CloudWatch Logs para Lambda
- CloudWatch Metrics para API Gateway
- X-Ray para tracing distribuido
- CloudWatch Alarms para errores
