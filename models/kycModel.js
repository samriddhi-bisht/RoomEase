const pool = require('../config/db');

async function createDocument({ userId, docType, docNumber, filePath, ocrName, ocrDob, ocrRawText, status }) {
  const { rows } = await pool.query(
    `INSERT INTO kyc_documents
       (user_id, doc_type, doc_number, file_path, ocr_extracted_name, ocr_extracted_dob, ocr_raw_text, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [userId, docType, docNumber || null, filePath, ocrName || null, ocrDob || null, ocrRawText || null, status]
  );
  return rows[0];
}

async function findByUserId(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM kyc_documents WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

// Joins in the submitter's name/email so the admin panel can show who's
// waiting without a second round-trip per row.
async function findPending() {
  const { rows } = await pool.query(
    `SELECT kd.*, u.name AS user_name, u.email AS user_email, u.role AS user_role
     FROM kyc_documents kd
     JOIN users u ON u.id = kd.user_id
     WHERE kd.status = 'pending'
     ORDER BY kd.created_at ASC`
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM kyc_documents WHERE id = $1', [id]);
  return rows[0] || null;
}

async function updateStatus(id, { status, verifiedBy, rejectionReason }) {
  const { rows } = await pool.query(
    `UPDATE kyc_documents
     SET status = $1, verified_by = $2, verified_at = now(), rejection_reason = $3
     WHERE id = $4
     RETURNING *`,
    [status, verifiedBy, rejectionReason || null, id]
  );
  return rows[0];
}

module.exports = { createDocument, findByUserId, findPending, findById, updateStatus };
