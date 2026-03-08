import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ─────────────────────────────────────────────
// Middleware principal — requiere JWT válido
// Uso: router.get('/ruta', authMiddleware, controller)
// ─────────────────────────────────────────────
export const authMiddleware = async (req, res, next) => {
  try {
    // ── Obtener token del header Authorization ─────────────────
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }

    const token = authHeader.split(' ')[1];

    // ── Verificar y decodificar el token ───────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Buscar el usuario en la BD ─────────────────────────────
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'El usuario del token ya no existe'
      });
    }

    // ── Adjuntar usuario al request para los controllers ───────
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'La sesión ha expirado. Inicia sesión nuevamente.'
      });
    }

    console.error('Error en authMiddleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar autenticación'
    });
  }
};

// ─────────────────────────────────────────────
// Middleware opcional — no bloquea si no hay token
// Uso: rutas públicas que también sirven info extra si hay sesión
// Ejemplo: GET /api/services (todos ven, pero si hay token
//          se puede saber si el usuario ya contactó el servicio)
// ─────────────────────────────────────────────
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user; // Disponible si existe, pero no obligatorio
      }
    } catch {
      // Token inválido o expirado — se ignora y se continúa sin usuario
    }
  }

  next();
};

// ─────────────────────────────────────────────
// Middleware de rol — debe usarse DESPUÉS de authMiddleware
// Uso: router.post('/ruta', authMiddleware, requireRole('admin'), controller)
// ─────────────────────────────────────────────
export const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`
      });
    }

    next();
  };
};

// ─────────────────────────────────────────────
// Middleware — verificar que el usuario está verificado facialmente
// Uso: rutas que requieren cuenta verificada para publicar servicios
// ─────────────────────────────────────────────
export const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado'
    });
  }

  if (!req.user.verificado) {
    return res.status(403).json({
      success: false,
      message: 'Tu cuenta no está verificada. Completa la verificación facial para continuar.'
    });
  }

  next();
};