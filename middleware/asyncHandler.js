// Express doesn't automatically catch rejected promises from async route
// handlers — an unawaited throw inside one just hangs the request. This
// wrapper catches the rejection and forwards it to next(), so it reaches
// errorHandler.js instead of crashing or hanging silently.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
