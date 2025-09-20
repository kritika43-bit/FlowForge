const express = require('express');
const router = express.Router();
const {
  getWorkCenters,
  getWorkCenterById,
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter,
  getWorkCenterStats,
} = require('../controllers/workCentersController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateWorkCenter } = require('../middleware/validation');

// Get work center statistics - accessible to all authenticateTokend users
router.get('/stats', authenticateToken, getWorkCenterStats);

// Get all work centers with filtering - accessible to all authenticateTokend users
router.get('/', authenticateToken, getWorkCenters);

// Get single work center by ID - accessible to all authenticateTokend users
router.get('/:id', authenticateToken, getWorkCenterById);

// Create new work center - managers and admins only
router.post(
  '/',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER']),
  validateWorkCenter,
  createWorkCenter
);

// Update work center - managers and admins only
router.put(
  '/:id',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER']),
  updateWorkCenter
);

// Delete work center - admins only
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['ADMIN']),
  deleteWorkCenter
);

module.exports = router;
