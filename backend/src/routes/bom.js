const express = require('express');
const router = express.Router();
const {
  getBOMs,
  getBOMById,
  createBOM,
  updateBOM,
  deleteBOM,
  calculateMaterialRequirements,
  getBOMStats,
} = require('../controllers/bomController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateBOM } = require('../middleware/validation');

// Get BOM statistics - accessible to all authenticateTokend users
router.get('/stats', authenticateToken, getBOMStats);

// Calculate material requirements for manufacturing
router.post(
  '/calculate-requirements',
  authenticateToken,
  calculateMaterialRequirements
);

// Get all BOMs with filtering - accessible to all authenticateTokend users
router.get('/', authenticateToken, getBOMs);

// Get single BOM by ID - accessible to all authenticateTokend users
router.get('/:id', authenticateToken, getBOMById);

// Create new BOM - managers and admins only
router.post(
  '/',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER']),
  validateBOM,
  createBOM
);

// Update BOM - managers and admins only
router.put(
  '/:id',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER']),
  updateBOM
);

// Delete BOM - admins only
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['ADMIN']),
  deleteBOM
);

module.exports = router;
