const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const prisma = require('./database');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug logging for all requests
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    // Sanitize password from logs
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '[REDACTED]';
    console.log('📦 Request body:', sanitizedBody);
  }
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'Connected',
      port: process.env.PORT || 5000,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'Disconnected',
      error: error.message,
    });
  }
});

// Debug echo endpoint
app.post('/api/debug/echo', (req, res) => {
  console.log('🔧 Debug Echo - Headers:', req.headers);
  console.log('🔧 Debug Echo - Body:', req.body);
  
  res.json({
    success: true,
    receivedHeaders: req.headers,
    receivedBody: req.body,
    timestamp: new Date().toISOString(),
    clientIP: req.ip || req.connection.remoteAddress,
  });
});

// Simple auth routes for testing (temporary)
app.post('/api/auth/signup', express.json(), (req, res) => {
  console.log('🔧 Signup request:', req.body);
  const { loginId, email, password } = req.body;
  
  if (!password || password.length < 6) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters'
    });
  }
  
  // Return success for any valid signup
  res.status(201).json({
    success: true,
    message: 'Account created successfully! Please login.',
    user: {
      id: 'temp-user-id',
      email: email || loginId,
      loginId: loginId,
      firstName: 'Test',
      lastName: 'User'
    }
  });
});

app.post('/api/auth/login', express.json(), (req, res) => {
  console.log('🔧 Login request:', req.body);
  const { email, loginId, password } = req.body;
  
  // Accept any login for demo purposes
  if (!password) {
    return res.status(400).json({
      error: 'Password is required'
    });
  }
  
  // Generate a simple token
  const token = 'demo-jwt-token-' + Date.now();
  
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: 'demo-user-123',
      email: email || loginId,
      loginId: loginId,
      firstName: 'Demo',
      lastName: 'User',
      role: 'OPERATOR',
      position: 'Manufacturing Operator',
      department: 'Production'
    }
  });
});

app.get('/api/auth/profile', (req, res) => {
  // Return a demo profile
  res.json({
    id: 'demo-user-123',
    email: 'demo@flowforge.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'OPERATOR',
    position: 'Manufacturing Operator',
    department: 'Production',
    joinDate: new Date().toISOString(),
    isActive: true
  });
});

// Add dashboard endpoint for KPI data (moved up to avoid conflicts)
app.get('/api/dashboard', (req, res) => {
  res.json({
    kpis: {
      totalOrders: 156,
      activeWorkOrders: 23,
      productionValue: 2500000,
      completionRate: 87.5,
      efficiency: 92.3,
      onTimeDelivery: 94.1,
      qualityScore: 98.2,
      ordersChange: "+12%",
      workOrdersChange: "+5%",
      valueChange: "+18%",
      efficiencyChange: "+2%",
      ordersTrend: "up",
      workOrdersTrend: "up",
      valueTrend: "up",
      efficiencyTrend: "up",
      completedToday: 8,
      pendingOrders: 15,
      overdueItems: 3,
      activeWorkers: 24
    },
    recentActivity: [
      { id: 1, type: 'order_completed', message: 'Manufacturing Order #MO-2024-001 completed', timestamp: new Date().toISOString() },
      { id: 2, type: 'work_order_started', message: 'Work Order #WO-2024-045 started at Assembly Line 1', timestamp: new Date(Date.now() - 300000).toISOString() },
      { id: 3, type: 'quality_check', message: 'Quality inspection passed for Batch #B-2024-012', timestamp: new Date(Date.now() - 600000).toISOString() }
    ],
    orders: [
      {
        id: "MO-001",
        orderNumber: "MO-2024-001",
        itemName: "Steel Frame Assembly",
        status: "in-progress",
        totalValue: 45000
      },
      {
        id: "MO-002", 
        orderNumber: "MO-2024-002",
        itemName: "Engine Block Casting",
        status: "pending",
        totalValue: 75000
      }
    ]
  });
});

// Simple endpoints for other pages
app.get('/api/manufacturing-orders', (req, res) => {
  res.json([
    {
      id: "MO-001",
      orderNumber: "MO-2024-001", 
      productName: "Steel Frame Assembly",
      status: "in-progress",
      quantity: 50,
      dueDate: "2024-01-20",
      progress: 65
    }
  ]);
});

app.get('/api/work-orders', (req, res) => {
  res.json([]);
});

app.get('/api/work-centers', (req, res) => {
  res.json([]);
});

app.get('/api/stock', (req, res) => {
  res.json([]);
});

app.get('/api/bom', (req, res) => {
  res.json([]);
});

app.get('/api/reports', (req, res) => {
  res.json([]);
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'FlowForge Manufacturing Management API',
    version: '1.0.0',
    documentation: {
      endpoints: {
        authentication: '/api/auth',
        manufacturingOrders: '/api/manufacturing-orders',
        workOrders: '/api/work-orders',
        workCenters: '/api/work-centers',
        stock: '/api/stock',
        billOfMaterials: '/api/bom',
        reports: '/api/reports',
      },
      health: '/health',
    },
    timestamp: new Date().toISOString(),
  });
});

// Import auth middleware
const { authenticateToken } = require('./middleware/auth');

// Add dashboard endpoint for KPI data
app.get('/api/dashboard', authenticateToken, (req, res) => {
  // Return sample KPI data for now
  res.json({
    kpis: {
      totalOrders: 156,
      activeWorkOrders: 23,
      completionRate: 87.5,
      efficiency: 92.3,
      onTimeDelivery: 94.1,
      qualityScore: 98.2
    },
    recentActivity: [
      { id: 1, type: 'order_completed', message: 'Manufacturing Order #MO-2024-001 completed', timestamp: new Date().toISOString() },
      { id: 2, type: 'work_order_started', message: 'Work Order #WO-2024-045 started at Assembly Line 1', timestamp: new Date(Date.now() - 300000).toISOString() },
      { id: 3, type: 'quality_check', message: 'Quality inspection passed for Batch #B-2024-012', timestamp: new Date(Date.now() - 600000).toISOString() }
    ],
    charts: {
      production: [
        { name: 'Mon', value: 120 },
        { name: 'Tue', value: 135 },
        { name: 'Wed', value: 148 },
        { name: 'Thu', value: 142 },
        { name: 'Fri', value: 156 },
        { name: 'Sat', value: 98 },
        { name: 'Sun', value: 87 }
      ],
      efficiency: [
        { name: 'Line 1', value: 94 },
        { name: 'Line 2', value: 87 },
        { name: 'Line 3', value: 92 },
        { name: 'Line 4', value: 89 }
      ]
    }
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Handle different types of errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      details: err.message,
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      details: 'Request body exceeds size limit',
    });
  }

  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return res.status(500).json({
      error: 'Database error',
      code: err.code,
      details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const PORT = process.env.PORT || 5000; // Changed from 5001 to 5000
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 FlowForge API Server running on http://${HOST}:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
  console.log(`📚 API docs: http://${HOST}:${PORT}/api`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

module.exports = app;
