const { body } = require('express-validator');

const addReviewValidator = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').toInt(),
  body('comment').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Comment is too long'),
];

module.exports = { addReviewValidator };
