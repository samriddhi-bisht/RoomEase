const pool = require('../config/db');

async function create({ name, email, passwordHash, role, phone }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, phone, kyc_status, created_at`,
    [name, email, passwordHash, role, phone || null]
  );
  return rows[0];
}

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, phone, kyc_status, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function updateKycStatus(userId, status) {
  await pool.query('UPDATE users SET kyc_status = $1 WHERE id = $2', [status, userId]);
}

module.exports = { create, findByEmail, findById, updateKycStatus };
