// Verificación de salud del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Verifica si el backend está disponible
 * @returns {Promise<boolean>} true si el backend está disponible
 */
export const checkBackendHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend conectado:', data);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Backend no disponible:', error.message);
    return false;
  }
};

/**
 * Obtiene información del estado del backend
 * @returns {Promise<Object|null>} Información del backend o null si no está disponible
 */
export const getBackendInfo = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (response.ok) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export default {
  checkBackendHealth,
  getBackendInfo
};
