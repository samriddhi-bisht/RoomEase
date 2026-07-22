const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM colleges ORDER BY name ASC');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM colleges WHERE id = $1', [id]);
  return rows[0] || null;
}

module.exports = { findAll, findById };
