const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin, validate } = require('../middleware/validation');

// POST /api/auth/register - Register new user
router.post('/register', validateRegister, authController.register);

// POST /api/auth/signup - Alias for register
router.post('/signup', validateRegister, authController.register);

// POST /api/auth/login - Login user
router.post('/login', validateLogin, authController.login);

// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticateToken, authController.getProfile);

// PUT /api/auth/profile - Update user profile
router.put('/profile', 
  authenticateToken,
  [
    body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
    body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('skills').optional().isArray().withMessage('Skills must be an array'),
    validate,
  ],
  authController.updateProfile
);

// PUT /api/auth/change-password - Change password
router.put('/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    validate,
  ],
  authController.changePassword
);

module.exports = router;
