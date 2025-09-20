const jwt = require('jsonwebtoken');
const prisma = require('../database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // DEVELOPMENT BYPASS: If no token, inject demo user
  if (!token) {
    req.user = {
      id: 'demo-user-1',
      email: 'demo@flowforge.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      department: 'Engineering',
      position: 'Administrator',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        department: true,
        position: true,
      },
    });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }
    req.user = user;
    next();
  } catch (error) {
    // DEVELOPMENT BYPASS: If token invalid, inject demo user
    console.warn('Token verification error (bypassed for dev):', error);
    req.user = {
      id: 'demo-user-1',
      email: 'demo@flowforge.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      department: 'Engineering',
      position: 'Administrator',
    };
    next();
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
};

// Common role combinations
const requireAdmin = requireRole(['ADMIN']);
const requireManagerOrAdmin = requireRole(['ADMIN', 'MANAGER']);
const requireInventoryAccess = requireRole(['ADMIN', 'MANAGER', 'INVENTORY']);
const requireAnyUser = requireRole(['ADMIN', 'MANAGER', 'OPERATOR', 'INVENTORY']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireManagerOrAdmin,
  requireInventoryAccess,
  requireAnyUser,
};
