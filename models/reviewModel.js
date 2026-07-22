const pool = require('../config/db');

async function create({ listingId, userId, rating, comment }) {
  const { rows } = await pool.query(
    `INSERT INTO reviews (listing_id, user_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [listingId, userId, rating, comment || null]
  );
  return rows[0];
}

async function findByListing(listingId) {
  const { rows } = await pool.query(
    `SELECT r.*, u.name AS user_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.listing_id = $1
     ORDER BY r.created_at DESC`,
    [listingId]
  );
  return rows;
}

module.exports = { create, findByListing };
