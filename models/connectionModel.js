const pool = require('../config/db');

async function create(requesterId, receiverId) {
  const { rows } = await pool.query(
    `INSERT INTO connections (requester_id, receiver_id)
     VALUES ($1, $2)
     RETURNING *`,
    [requesterId, receiverId]
  );
  return rows[0];
}

// Looks for a request in either direction — A can't send a second request
// to B if B already sent one to A.
async function findBetween(userA, userB) {
  const { rows } = await pool.query(
    `SELECT * FROM connections
     WHERE (requester_id = $1 AND receiver_id = $2) OR (requester_id = $2 AND receiver_id = $1)`,
    [userA, userB]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM connections WHERE id = $1', [id]);
  return rows[0] || null;
}

// Only the receiver is allowed to accept/reject — enforced here at the
// query level (WHERE receiver_id = $3), not just in the controller.
async function updateStatus(id, status, receiverId) {
  const { rows } = await pool.query(
    `UPDATE connections SET status = $1 WHERE id = $2 AND receiver_id = $3 RETURNING *`,
    [status, id, receiverId]
  );
  return rows[0] || null;
}

async function findForUser(userId) {
  const { rows } = await pool.query(
    `SELECT c.*,
       ru.name AS requester_name, ru.email AS requester_email,
       rv.name AS receiver_name, rv.email AS receiver_email
     FROM connections c
     JOIN users ru ON ru.id = c.requester_id
     JOIN users rv ON rv.id = c.receiver_id
     WHERE c.requester_id = $1 OR c.receiver_id = $1
     ORDER BY c.created_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = { create, findBetween, findById, updateStatus, findForUser };
