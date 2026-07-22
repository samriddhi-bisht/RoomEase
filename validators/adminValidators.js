const { body } = require('express-validator');

const moderateListingValidator = [
  body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
];

module.exports = { moderateListingValidator };
