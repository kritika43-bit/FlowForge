const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getProductionAnalytics,
  getEfficiencyMetrics,
  getCostAnalysis,
  getInventoryAnalysis,
  getCustomReport,
} = require('../controllers/reportsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Dashboard overview data - accessible to all authenticateTokend users
router.get('/dashboard', authenticateToken, getDashboardData);

// Production analytics - accessible to all authenticateTokend users
router.get('/production-analytics', authenticateToken, getProductionAnalytics);

// Efficiency metrics - accessible to all authenticateTokend users
router.get('/efficiency-metrics', authenticateToken, getEfficiencyMetrics);

// Cost analysis - managers and admins only
router.get('/cost-analysis', 
  authenticateToken, 
  requireRole(['ADMIN', 'MANAGER']), 
  getCostAnalysis
);

// Inventory analysis - accessible to all authenticateTokend users
router.get('/inventory-analysis', authenticateToken, getInventoryAnalysis);

// Custom report generation - managers and admins only
router.post('/custom',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER']),
  getCustomReport
);

module.exports = router;
