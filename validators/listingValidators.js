const { body } = require('express-validator');

const createListingValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('rent').isFloat({ gt: 0 }).withMessage('Rent must be a positive number'),
  body('deposit').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Deposit must be zero or more'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('genderPreference')
    .optional({ checkFalsy: true })
    .isIn(['male', 'female', 'any'])
    .withMessage('Invalid gender preference'),
  body('propertyType')
    .optional({ checkFalsy: true })
    .isIn(['pg', 'flat', 'hostel', 'studio', 'room'])
    .withMessage('Invalid property type'),
  body('furnishing')
    .optional({ checkFalsy: true })
    .isIn(['unfurnished', 'semi_furnished', 'furnished'])
    .withMessage('Invalid furnishing type'),
  body('sharingType')
    .optional({ checkFalsy: true })
    .isIn(['single', 'double', 'triple', 'any'])
    .withMessage('Invalid sharing type'),
];

module.exports = { createListingValidator };
