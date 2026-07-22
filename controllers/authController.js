const authService = require('../services/authService');
const userModel = require('../models/userModel');
const asyncHandler = require('../middleware/asyncHandler');

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true, // client-side JS can never read this cookie
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // HTTPS-only outside local dev
    maxAge: COOKIE_MAX_AGE,
  });
}

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const { user, token } = await authService.signup({ name, email, password, role, phone });
  setAuthCookie(res, token);
  res.status(201).json({ user });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login(email, password);
  setAuthCookie(res, token);
  res.status(200).json({ user });
});

const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out' });
};

const me = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  res.json({ user });
});

module.exports = { signup, login, logout, me };
