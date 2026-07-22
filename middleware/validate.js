const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Runs after express-validator's check(...) rules on a route. If any rule
// failed, short-circuits with a 400 instead of letting bad input reach the
// controller/service layer.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(', ');
    return next(new AppError(message, 400));
  }
  next();
}

module.exports = validate;
