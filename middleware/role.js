const AppError = require('../utils/AppError');

// requireAuth must run before this — it depends on req.user being set.
// Usage: router.post('/listings', requireAuth, requireRole('owner'), ...)
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to do this.', 403));
  }
  next();
};

module.exports = requireRole;
