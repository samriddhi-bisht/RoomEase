const pool = require('../config/db');

async function moderateListing(listingId, status) {
  const { rows } = await pool.query(
    'UPDATE listings SET status = $1 WHERE id = $2 RETURNING *',
    [status, listingId]
  );
  return rows[0] || null;
}

async function allListings() {
  const { rows } = await pool.query(
    `SELECT l.*, u.name AS owner_name, u.email AS owner_email
     FROM listings l
     JOIN users u ON u.id = l.owner_id
     ORDER BY l.created_at DESC`
  );
  return rows;
}

module.exports = { moderateListing, allListings };
