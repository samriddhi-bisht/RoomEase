const { body } = require('express-validator');

const saveProfileValidator = [
  body('collegeId').optional({ checkFalsy: true }).isInt().withMessage('Invalid college'),
  body('budgetMin').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Invalid minimum budget'),
  body('budgetMax').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Invalid maximum budget'),
  body('bio').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Bio is too long'),
];

module.exports = { saveProfileValidator };
