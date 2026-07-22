const { body } = require('express-validator');

const signupValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  // Admin accounts are seeded directly in the database, never created
  // through the public signup form.
  body('role').isIn(['student', 'owner']).withMessage('Role must be student or owner'),
  body('phone').optional({ checkFalsy: true }).isLength({ min: 7, max: 20 }).withMessage('Invalid phone number'),
];

const loginValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { signupValidator, loginValidator };
