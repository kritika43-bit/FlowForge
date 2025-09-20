const express = require('express');
const router = express.Router();
const {
  getStockItems,
  getStockItemById,
  createStockItem,
  updateStockItem,
  deleteStockItem,
  createStockMovement,
  getStockMovements,
  getStockStats,
} = require('../controllers/stockController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateStockItem, validateStockMovement } = require('../middleware/validation');

// Get stock statistics - accessible to all authenticateTokend users
router.get('/stats', authenticateToken, getStockStats);

// Get stock movements with filtering - accessible to all authenticateTokend users
router.get('/movements', authenticateToken, getStockMovements);

// Create stock movement (adjust stock) - inventory managers and admins
router.post(
  '/movements',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER', 'INVENTORY']),
  validateStockMovement,
  createStockMovement
);

// Get all stock items with filtering - accessible to all authenticateTokend users
router.get('/', authenticateToken, getStockItems);

// Get single stock item by ID - accessible to all authenticateTokend users
router.get('/:id', authenticateToken, getStockItemById);

// Create new stock item - inventory managers and admins
router.post(
  '/',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER', 'INVENTORY']),
  validateStockItem,
  createStockItem
);

// Update stock item - inventory managers and admins
router.put(
  '/:id',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER', 'INVENTORY']),
  updateStockItem
);

// Delete stock item - admins only
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['ADMIN']),
  deleteStockItem
);

module.exports = router;
