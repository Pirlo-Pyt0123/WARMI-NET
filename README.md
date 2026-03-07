# WARMI-NET

Plataforma de red social comunitaria con verificación biométrica y tablero de servicios/productos locales.

## 🚀 Características

- **Autenticación Biométrica**: Verificación facial 180° con validación de posición
- **OCR de Documentos**: Escaneo automático de carnet de identidad
- **Sistema de Comunidades**: Tableros organizados por barrios/zonas
- **Servicios y Productos**: Marketplace local comunitario
- **Interfaz Moderna**: React + Vite con Tailwind CSS

## 🛠️ Tecnologías

- **Frontend**: React 19, Vite 7, Tailwind CSS 3
- **Reconocimiento Facial**: face-api.js
- **OCR**: Tesseract.js
- **Despliegue**: AWS (próximamente)

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Descargar modelos de face-api
.\download-models.ps1

# Iniciar servidor de desarrollo
npm run dev
```

## 🎨 Paleta de Colores

- **Warmi Purple**: `#4b135f`
- **Warmi Pink**: `#fd71b2`
- **Warmi Intense**: `#840078`
- **Warmi Magenta**: `#9c1281`

## 📋 Próximos Pasos

- [ ] Backend con AWS Lambda + API Gateway
- [ ] Base de datos (DynamoDB/RDS)
- [ ] Almacenamiento S3 para imágenes
- [ ] Autenticación con AWS Cognito
- [ ] CI/CD con AWS Amplify

## 📄 Licencia

Proyecto privado - Todos los derechos reservados
