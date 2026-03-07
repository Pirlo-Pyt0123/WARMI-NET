// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Timeout para las peticiones (10 segundos)
const REQUEST_TIMEOUT = 10000;

// Función para crear un timeout en fetch
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Función helper para hacer requests con manejo robusto de errores
const makeRequest = async (endpoint, options = {}, retries = 2) => {
  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      // Verificar que el API_URL esté configurado
      if (!API_URL) {
        throw new Error('URL de la API no configurada');
      }

      const url = `${API_URL}${endpoint}`;
      console.log(`Intentando conectar a: ${url}`);

      const response = await fetchWithTimeout(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      // Intentar parsear la respuesta como JSON
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || 'Respuesta sin contenido' };
      }

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      lastError = error;
      
      // Errores de red o conexión
      if (error.name === 'AbortError') {
        console.error(`Timeout en intento ${i + 1}/${retries + 1}`);
        lastError = new Error('La conexión tardó demasiado. Verifica tu conexión a internet.');
      } else if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        console.error(`Error de red en intento ${i + 1}/${retries + 1}`);
        lastError = new Error('No se pudo conectar con el servidor. Asegúrate de que el backend esté funcionando en ' + API_URL);
      }

      // Si no es el último intento, esperar antes de reintentar
      if (i < retries) {
        console.log(`Reintentando en 1 segundo... (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error('API Error después de todos los intentos:', lastError);
  throw lastError;
};

// Función para login
export const loginUser = async (ci, pin) => {
  return await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ ci, pin })
  });
};

// Función para registro
export const registerUser = async (userData) => {
  return await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

// Función para obtener usuario actual
export const getCurrentUser = async (token) => {
  return await makeRequest('/api/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export default {
  loginUser,
  registerUser,
  getCurrentUser
};
