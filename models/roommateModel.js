const pool = require('../config/db');

async function upsert(userId, { collegeId, budgetMin, budgetMax, habits, bio }) {
  const { rows } = await pool.query(
    `INSERT INTO roommate_profiles (user_id, college_id, budget_min, budget_max, habits, bio)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id) DO UPDATE SET
       college_id = EXCLUDED.college_id,
       budget_min = EXCLUDED.budget_min,
       budget_max = EXCLUDED.budget_max,
       habits = EXCLUDED.habits,
       bio = EXCLUDED.bio
     RETURNING *`,
    [userId, collegeId || null, budgetMin || null, budgetMax || null, habits || null, bio || null]
  );
  return rows[0];
}

async function findByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT rp.*, u.name AS user_name, c.name AS college_name
     FROM roommate_profiles rp
     JOIN users u ON u.id = rp.user_id
     LEFT JOIN colleges c ON c.id = rp.college_id
     WHERE rp.user_id = $1`,
    [userId]
  );
  return rows[0] || null;
}

// Excludes the requesting user's own profile and anyone they already have
// a connection (pending or accepted) with, so the browse list only shows
// people worth reaching out to.
async function search({ excludeUserId, collegeId, maxBudget }) {
  const conditions = ['rp.user_id != $1'];
  const params = [excludeUserId];

  if (collegeId) {
    params.push(collegeId);
    conditions.push(`rp.college_id = $${params.length}`);
  }
  if (maxBudget) {
    params.push(maxBudget);
    conditions.push(`(rp.budget_min IS NULL OR rp.budget_min <= $${params.length})`);
  }

  const sql = `
    SELECT rp.*, u.name AS user_name, c.name AS college_name
    FROM roommate_profiles rp
    JOIN users u ON u.id = rp.user_id
    LEFT JOIN colleges c ON c.id = rp.college_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY rp.created_at DESC
  `;
  const { rows } = await pool.query(sql, params);
  return rows;
}

module.exports = { upsert, findByUserId, search };
