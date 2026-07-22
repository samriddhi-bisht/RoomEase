const { body } = require('express-validator');

const createListingValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('rent').isFloat({ gt: 0 }).withMessage('Rent must be a positive number'),
  body('deposit').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Deposit must be zero or more'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('genderPreference')
    .optional({ checkFalsy: true })
    .isIn(['male', 'female', 'any'])
    .withMessage('Invalid gender preference'),
];

module.exports = { createListingValidator };
