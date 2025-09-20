const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStats,
} = require('../controllers/ordersController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateManufacturingOrder } = require('../middleware/validation');

// Get order statistics - accessible to all authenticated users
router.get('/stats', authenticateToken, getOrderStats);

// Get all manufacturing orders with filtering - accessible to all authenticated users
router.get('/', authenticateToken, getOrders);

// Get single manufacturing order by ID - accessible to all authenticated users
router.get('/:id', authenticateToken, getOrderById);

// Create new manufacturing order - managers and admins only
router.post(
  '/',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER']),
  validateManufacturingOrder,
  createOrder
);

// Update manufacturing order - managers and admins can update all, operators can update status/notes
router.put(
  '/:id',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER', 'OPERATOR']),
  updateOrder
);

// Cancel/Delete manufacturing order - managers and admins only
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER']),
  deleteOrder
);

module.exports = router;
