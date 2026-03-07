import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Amplify } from 'aws-amplify'
import amplifyConfig from '../amplify_outputs.json'

// Configurar Amplify solo si no es el placeholder
if (amplifyConfig.aws_user_pools_id !== 'PLACEHOLDER') {
  Amplify.configure(amplifyConfig)
} else {
  console.warn('⚠️ AWS Amplify no configurado. Ejecuta "amplify init" para generar amplify_outputs.json')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
