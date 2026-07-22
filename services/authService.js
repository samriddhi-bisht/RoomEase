const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

async function signup({ name, email, password, role, phone }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.create({ name, email, passwordHash, role, phone });
  const token = signToken(user);
  return { user, token };
}

async function login(email, password) {
  const user = await userModel.findByEmail(email);
  // Same error message whether the email doesn't exist or the password is
  // wrong — telling them apart would let an attacker enumerate which
  // emails have accounts.
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new AppError('Invalid email or password.', 401);
  }
  const token = signToken(user);
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

module.exports = { signup, login };
