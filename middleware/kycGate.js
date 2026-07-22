const pool = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('./asyncHandler');

// kyc_status can change (admin approves it) without the user logging back
// in, so the JWT's claims can't be trusted for this check — we read the
// current value straight from the database instead of caching it in the
// token payload.
const requireKycVerified = asyncHandler(async (req, res, next) => {
  const { rows } = await pool.query('SELECT kyc_status FROM users WHERE id = $1', [req.user.id]);
  if (rows.length === 0 || rows[0].kyc_status !== 'verified') {
    return next(new AppError('This action requires a verified KYC status.', 403));
  }
  next();
});

module.exports = requireKycVerified;
