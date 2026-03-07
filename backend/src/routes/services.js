import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  contactService,
  addReview,
  getReviews
} from '../controllers/serviceController.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { validateService, validateReview } from '../middleware/validation.js';

const router = express.Router();

// Rutas públicas con autenticación opcional
router.get('/', optionalAuth, getAllServices);
router.get('/:id', optionalAuth, getServiceById);
router.get('/:id/reviews', getReviews);
router.post('/:id/contact', contactService);

// Rutas protegidas
router.post('/', authMiddleware, validateService, createService);
router.put('/:id', authMiddleware, updateService);
router.delete('/:id', authMiddleware, deleteService);
router.post('/:id/reviews', authMiddleware, validateReview, addReview);

export default router;
