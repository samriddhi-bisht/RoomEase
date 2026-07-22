const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

// The JWT lives in an httpOnly cookie (set at login) rather than
// localStorage, so client-side JS can never read or steal it, and it's
// still sent automatically on every request — both page loads and jQuery
// AJAX calls — without any extra code on the frontend.
function verifyTokenFromRequest(req) {
  const token = req.cookies && req.cookies.token;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Blocks the request entirely if there's no valid token.
function requireAuth(req, res, next) {
  const payload = verifyTokenFromRequest(req);
  if (!payload) {
    if (req.originalUrl.startsWith('/api')) {
      return next(new AppError('You must be logged in.', 401));
    }
    return res.redirect('/login');
  }
  req.user = { id: payload.userId, role: payload.role };
  next();
}

// Attaches req.user if a valid token exists, but never blocks the request.
// Used on public pages that render differently when logged in (e.g. navbar
// showing "Dashboard" vs "Log in").
function attachUserIfPresent(req, res, next) {
  const payload = verifyTokenFromRequest(req);
  req.user = payload ? { id: payload.userId, role: payload.role } : null;
  next();
}

module.exports = { requireAuth, attachUserIfPresent };
