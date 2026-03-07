import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Generar JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const {
      ci,
      nombres,
      apellidos,
      edad,
      usuario,
      pin,
      faceDescriptor,
      faceImageUrl,
      documentImageUrl
    } = req.body;

    // Verificar si el CI ya existe
    const existingCI = await User.findByCI(ci);
    if (existingCI) {
      return res.status(400).json({
        success: false,
        message: 'El CI ya está registrado'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsername(usuario);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya está en uso'
      });
    }

    // Hash del PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // Crear usuario
    const userId = await User.create({
      ci,
      nombres,
      apellidos,
      edad,
      usuario,
      pin: hashedPin,
      faceDescriptor,
      faceImageUrl,
      documentImageUrl
    });

    // Generar token
    const token = generateToken(userId);

    // Obtener datos del usuario
    const user = await User.findById(userId);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        ci: user.ci,
        nombres: user.nombres,
        apellidos: user.apellidos,
        usuario: user.usuario, // El username generado (ej: jperez1234)
        edad: user.edad,
        verificado: user.verificado
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// @desc    Login con CI y PIN
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { ci, pin } = req.body;

    // Buscar usuario
    const user = await User.findByCI(ci);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'CI o PIN incorrectos'
      });
    }

    // Verificar PIN
    const isValidPin = await bcrypt.compare(pin, user.pin);
    
    if (!isValidPin) {
      return res.status(401).json({
        success: false,
        message: 'CI o PIN incorrectos'
      });
    }

    // Actualizar último login
    await User.updateLastLogin(user.id);

    // Generar token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        ci: user.ci,
        nombres: user.nombres,
        apellidos: user.apellidos,
        nombre_completo: user.nombre_completo,
        usuario: user.usuario, // El username generado
        edad: user.edad,
        email: user.email,
        telefono: user.telefono,
        verificado: user.verificado,
        face_descriptor: user.face_descriptor
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// @desc    Verificar facial
// @route   POST /api/auth/verify-face
// @access  Public
export const verifyFace = async (req, res) => {
  try {
    const { ci, faceDescriptor } = req.body;

    if (!ci || !faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: 'CI y descriptor facial son requeridos'
      });
    }

    // Buscar usuario
    const user = await User.findByCI(ci);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // El frontend ya hace la comparación facial con face-api.js
    // Aquí solo validamos que exista el usuario
    res.json({
      success: true,
      message: 'Usuario encontrado para verificación facial',
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        face_descriptor: user.face_descriptor
      }
    });
  } catch (error) {
    console.error('Error en verificación facial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar rostro',
      error: error.message
    });
  }
};

// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// @desc    Actualizar perfil
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { telefono, email } = req.body;
    
    const updated = await User.update(req.user.id, {
      telefono,
      email
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No hay cambios para actualizar'
      });
    }

    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};
