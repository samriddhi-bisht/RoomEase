const { body } = require('express-validator');

const sendRequestValidator = [
  body('receiverId').isInt().withMessage('receiverId must be a valid user id').toInt(),
];

const respondValidator = [
  body('decision').isIn(['accepted', 'rejected']).withMessage('Decision must be accepted or rejected'),
];

module.exports = { sendRequestValidator, respondValidator };
