import express from 'express';
import {
  getAllCommunities,
  getCommunityById,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  getCommunityServices,
  updateCommunity
} from '../controllers/communityController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateCommunity } from '../middleware/validation.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllCommunities);
router.get('/:id', getCommunityById);
router.get('/:id/members', getCommunityMembers);
router.get('/:id/services', getCommunityServices);

// Rutas protegidas
router.post('/', authMiddleware, validateCommunity, createCommunity);
router.post('/:id/join', authMiddleware, joinCommunity);
router.post('/:id/leave', authMiddleware, leaveCommunity);
router.put('/:id', authMiddleware, updateCommunity);

export default router;
