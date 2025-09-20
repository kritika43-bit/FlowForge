const express = require('express');
const router = express.Router();
const {
  getWorkOrders,
  getWorkOrdersKanban,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  getWorkOrderStats,
} = require('../controllers/workOrdersController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateWorkOrder } = require('../middleware/validation');

// Get work order statistics - accessible to all authenticateTokend users
router.get('/stats', authenticateToken, getWorkOrderStats);

// Get work orders for kanban view - accessible to all authenticateTokend users
router.get('/kanban', authenticateToken, getWorkOrdersKanban);

// Get all work orders with filtering - accessible to all authenticateTokend users
router.get('/', authenticateToken, getWorkOrders);

// Get single work order by ID - accessible to all authenticateTokend users
router.get('/:id', authenticateToken, getWorkOrderById);

// Create new work order - managers and admins only
router.post(
  '/',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER']),
  validateWorkOrder,
  createWorkOrder
);

// Update work order - operators can update status/progress, managers can update all
router.put(
  '/:id',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER', 'OPERATOR']),
  updateWorkOrder
);

// Cancel/Delete work order - managers and admins only
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER']),
  deleteWorkOrder
);

module.exports = router;
