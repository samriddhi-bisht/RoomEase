const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM amenities ORDER BY name ASC');
  return rows;
}

module.exports = { findAll };
