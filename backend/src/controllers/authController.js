import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import {
  uploadImageToS3,
  deleteImageFromS3,
  compareFaces,
  detectFace
} from '../services/awsService.js';

// ─────────────────────────────────────────────
// Helper: Generar JWT
// ─────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─────────────────────────────────────────────
// Helper: Convertir base64 a Buffer
// ─────────────────────────────────────────────
const base64ToBuffer = (base64String) => {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
};

// ─────────────────────────────────────────────
// @desc    Registrar nuevo usuario con verificación facial AWS
// @route   POST /api/auth/register
// @access  Public
// Body: { ci, nombres, apellidos, edad, usuario, pin,
//         faceImageBase64, documentImageBase64 }
// ─────────────────────────────────────────────
export const register = async (req, res) => {
  let faceKey = null;
  let documentKey = null;

  try {
    const {
      ci,
      nombres,
      apellidos,
      edad,
      usuario,
      pin,
      faceImageBase64,
      documentImageBase64
    } = req.body;

    // ── Validar campos requeridos ──────────────────────────────
    if (!faceImageBase64 || !documentImageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere la foto del rostro y la foto del documento (CI)'
      });
    }

    // ── Verificar CI único ─────────────────────────────────────
    const existingCI = await User.findByCI(ci);
    if (existingCI) {
      return res.status(400).json({
        success: false,
        message: 'El CI ya está registrado en el sistema'
      });
    }

    // ── Verificar usuario único ────────────────────────────────
    const existingUser = await User.findByUsername(usuario);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya está en uso'
      });
    }

    // ── Convertir imágenes base64 a Buffer ─────────────────────
    const faceBuffer = base64ToBuffer(faceImageBase64);
    const documentBuffer = base64ToBuffer(documentImageBase64);

    // ── Detectar rostro en la foto de la cámara ────────────────
    const faceDetection = await detectFace(faceBuffer);

    if (!faceDetection.hasFace) {
      return res.status(400).json({
        success: false,
        message: 'No se detectó un rostro en tu fotografía. Asegúrate de estar bien iluminado y mirar a la cámara.'
      });
    }

    if (faceDetection.faceCount > 1) {
      return res.status(400).json({
        success: false,
        message: 'Se detectaron múltiples rostros. La fotografía debe ser únicamente de ti.'
      });
    }

    if (faceDetection.confidence < 90) {
      return res.status(400).json({
        success: false,
        message: `Calidad de imagen insuficiente (${faceDetection.confidence.toFixed(1)}%). Mejora la iluminación e intenta de nuevo.`
      });
    }

    // ── Subir ambas imágenes a S3 ──────────────────────────────
    faceKey = await uploadImageToS3(faceBuffer, 'faces');
    documentKey = await uploadImageToS3(documentBuffer, 'documents');

    // ── Comparar rostro con documento usando Rekognition ───────
    const comparison = await compareFaces(faceKey, documentKey);

    if (!comparison.match) {
      // Limpiar imágenes subidas si no pasan la verificación
      await deleteImageFromS3(faceKey);
      await deleteImageFromS3(documentKey);

      return res.status(400).json({
        success: false,
        message: `El rostro no coincide con la foto del documento (similitud: ${comparison.similarity}%). Verifica que tu CI muestre claramente tu cara.`,
        similarity: comparison.similarity
      });
    }

    // ── Hash del PIN ───────────────────────────────────────────
    const hashedPin = await bcrypt.hash(pin, 10);

    // ── Crear usuario verificado en la BD ──────────────────────
    const userId = await User.create({
      ci,
      nombres,
      apellidos,
      edad,
      usuario,
      pin: hashedPin,
      faceImageUrl: faceKey,       // Key de S3 (no URL pública)
      documentImageUrl: documentKey
    });

    // ── Generar token y retornar ───────────────────────────────
    const token = generateToken(userId);
    const user = await User.findById(userId);

    return res.status(201).json({
      success: true,
      message: `¡Registro exitoso! Identidad verificada con ${comparison.similarity}% de similitud.`,
      token,
      user: {
        id: user.id,
        ci: user.ci,
        nombres: user.nombres,
        apellidos: user.apellidos,
        usuario: user.usuario,
        edad: user.edad,
        verificado: true
      }
    });

  } catch (error) {
    // Limpiar imágenes si algo falló después de subirlas
    if (faceKey) await deleteImageFromS3(faceKey).catch(() => {});
    if (documentKey) await deleteImageFromS3(documentKey).catch(() => {});

    console.error('Error en registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Login con CI y PIN (método clásico)
// @route   POST /api/auth/login
// @access  Public
// Body: { ci, pin }
// ─────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { ci, pin } = req.body;

    // ── Buscar usuario ─────────────────────────────────────────
    const user = await User.findByCI(ci);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'CI o PIN incorrectos'
      });
    }

    // ── Verificar PIN con bcrypt ───────────────────────────────
    const isValidPin = await bcrypt.compare(pin, user.pin);

    if (!isValidPin) {
      return res.status(401).json({
        success: false,
        message: 'CI o PIN incorrectos'
      });
    }

    // ── Actualizar último login ────────────────────────────────
    await User.updateLastLogin(user.id);

    const token = generateToken(user.id);

    return res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        ci: user.ci,
        nombres: user.nombres,
        apellidos: user.apellidos,
        nombre_completo: user.nombre_completo,
        usuario: user.usuario,
        edad: user.edad,
        email: user.email,
        telefono: user.telefono,
        verificado: user.verificado
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Login con reconocimiento facial AWS
// @route   POST /api/auth/login-face
// @access  Public
// Body: { ci, faceImageBase64 }
// ─────────────────────────────────────────────
export const loginWithFace = async (req, res) => {
  let tempKey = null;

  try {
    const { ci, faceImageBase64 } = req.body;

    if (!ci || !faceImageBase64) {
      return res.status(400).json({
        success: false,
        message: 'El CI y la fotografía son requeridos'
      });
    }

    // ── Buscar usuario y verificar que tiene foto registrada ───
    const user = await User.findByCI(ci);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!user.face_image_url) {
      return res.status(400).json({
        success: false,
        message: 'Este usuario no tiene registro facial. Usa CI y PIN para ingresar.'
      });
    }

    // ── Subir foto temporal a S3 para comparar ─────────────────
    const faceBuffer = base64ToBuffer(faceImageBase64);
    tempKey = await uploadImageToS3(faceBuffer, 'temp');

    // ── Comparar con la foto de registro ──────────────────────
    const comparison = await compareFaces(tempKey, user.face_image_url);

    // ── Eliminar foto temporal (siempre, pase o no) ────────────
    await deleteImageFromS3(tempKey);
    tempKey = null;

    if (!comparison.match) {
      return res.status(401).json({
        success: false,
        message: 'Rostro no reconocido. Intenta con mejor iluminación o usa CI y PIN.',
        similarity: comparison.similarity
      });
    }

    // ── Login exitoso ──────────────────────────────────────────
    await User.updateLastLogin(user.id);
    const token = generateToken(user.id);

    return res.json({
      success: true,
      message: `Bienvenido, ${user.nombres}. Identidad verificada.`,
      token,
      user: {
        id: user.id,
        ci: user.ci,
        nombres: user.nombres,
        apellidos: user.apellidos,
        nombre_completo: user.nombre_completo,
        usuario: user.usuario,
        edad: user.edad,
        email: user.email,
        telefono: user.telefono,
        verificado: user.verificado
      }
    });

  } catch (error) {
    // Limpiar foto temporal si algo falló
    if (tempKey) await deleteImageFromS3(tempKey).catch(() => {});

    console.error('Error en login facial:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en la verificación facial',
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/auth/me
// @access  Private (requiere JWT)
// ─────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    return res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Actualizar perfil (teléfono, email)
// @route   PUT /api/auth/profile
// @access  Private (requiere JWT)
// Body: { telefono?, email? }
// ─────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { telefono, email } = req.body;

    const updated = await User.update(req.user.id, { telefono, email });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No hay cambios para actualizar'
      });
    }

    const user = await User.findById(req.user.id);

    return res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};