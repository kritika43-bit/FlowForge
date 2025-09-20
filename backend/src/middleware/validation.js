const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// User registration validation
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required'),
  body('position')
    .optional()
    .trim()
    .default('Operator'),
  body('department')
    .optional()
    .trim()
    .default('Manufacturing'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'MANAGER', 'OPERATOR', 'INVENTORY'])
    .withMessage('Invalid role'),
  validate,
];

// User login validation
const validateLogin = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('loginId')
    .optional()
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

// Manufacturing order validation
const validateManufacturingOrder = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('deadline')
    .isISO8601()
    .toDate()
    .withMessage('Valid deadline date is required'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority'),
  validate,
];

// Work order validation
const validateWorkOrder = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title is required'),
  body('manufacturingOrderId')
    .notEmpty()
    .withMessage('Manufacturing order ID is required'),
  body('workCenterId')
    .notEmpty()
    .withMessage('Work center ID is required'),
  body('estimatedHours')
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be a positive number'),
  body('dueDate')
    .isISO8601()
    .toDate()
    .withMessage('Valid due date is required'),
  validate,
];

// Work center validation
const validateWorkCenter = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name is required'),
  body('type')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Type is required'),
  body('location')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Location is required'),
  body('hourlyCost')
    .isFloat({ min: 0 })
    .withMessage('Hourly cost must be a positive number'),
  body('capacity')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Capacity must be between 0 and 100'),
  validate,
];

// Stock item validation
const validateStockItem = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name is required'),
  body('category')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Category is required'),
  body('quantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  body('unitCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit cost must be a positive number'),
  body('reorderPoint')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Reorder point must be a positive number'),
  validate,
];

// Stock movement validation
const validateStockMovement = [
  body('stockItemId')
    .notEmpty()
    .withMessage('Stock item ID is required'),
  body('type')
    .isIn(['IN', 'OUT', 'RETURN', 'ADJUSTMENT'])
    .withMessage('Invalid movement type'),
  body('quantity')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  body('reason')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Reason is required'),
  validate,
];

// BOM validation
const validateBOM = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('version')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Version is required'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'ACTIVE', 'OBSOLETE'])
    .withMessage('Invalid status'),
  validate,
];

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateManufacturingOrder,
  validateWorkOrder,
  validateWorkCenter,
  validateStockItem,
  validateStockMovement,
  validateBOM,
};
