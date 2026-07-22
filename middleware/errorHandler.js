// Centralized error handler. Every asyncHandler-wrapped controller funnels
// its errors here via next(err), so there is exactly one place that decides
// status codes and response shape instead of every controller repeating it.
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Something went wrong. Please try again.';

  if (!err.isOperational) {
    // Unexpected (programmer) errors get logged in full; operational ones
    // (bad input, not found, etc.) are routine and not worth a stack trace.
    console.error(err);
  }

  const isApiRequest = req.originalUrl.startsWith('/api');
  if (isApiRequest) {
    return res.status(statusCode).json({ error: message });
  }

  return res.status(statusCode).render('error', {
    statusCode,
    message,
    user: req.user || null,
  });
}

module.exports = errorHandler;
