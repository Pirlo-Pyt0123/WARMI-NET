import express from 'express';
import {
  register,
  login,
  verifyFace,
  getMe,
  updateProfile
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Rutas públicas
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/verify-face', verifyFace);

// Rutas protegidas
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);

export default router;
