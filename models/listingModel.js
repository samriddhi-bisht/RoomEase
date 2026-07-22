const pool = require('../config/db');

// A listing is really 4 related inserts (the listing row, its images, its
// amenity links, its college links). If the process crashed after inserting
// the listing but before its amenities, we'd be left with a broken half-row
// forever. Wrapping all four in one transaction means either the whole
// listing exists correctly, or none of it does.
async function createWithRelations({
  ownerId, title, description, rent, deposit, address, lat, lng,
  genderPreference, amenityIds, collegeLinks, imagePaths,
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO listings (owner_id, title, description, rent, deposit, address, lat, lng, gender_preference)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [ownerId, title, description, rent, deposit, address, lat || null, lng || null, genderPreference]
    );
    const listing = rows[0];

    for (const amenityId of amenityIds) {
      await client.query(
        'INSERT INTO listing_amenities (listing_id, amenity_id) VALUES ($1, $2)',
        [listing.id, amenityId]
      );
    }

    for (const { collegeId, distanceKm } of collegeLinks) {
      await client.query(
        'INSERT INTO listing_colleges (listing_id, college_id, distance_km) VALUES ($1, $2, $3)',
        [listing.id, collegeId, distanceKm || null]
      );
    }

    for (const filePath of imagePaths) {
      await client.query(
        'INSERT INTO listing_images (listing_id, file_path) VALUES ($1, $2)',
        [listing.id, filePath]
      );
    }

    await client.query('COMMIT');
    return listing;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// json_agg with a correlated subquery lets us pull a listing plus all its
// images/amenities/colleges in a single round-trip instead of N+1 queries.
async function findById(id) {
  const { rows } = await pool.query(
    `SELECT
       l.*,
       u.name AS owner_name, u.phone AS owner_phone,
       COALESCE(
         (SELECT json_agg(li.file_path) FROM listing_images li WHERE li.listing_id = l.id), '[]'
       ) AS images,
       COALESCE(
         (SELECT json_agg(a.name) FROM listing_amenities la JOIN amenities a ON a.id = la.amenity_id WHERE la.listing_id = l.id), '[]'
       ) AS amenities,
       COALESCE(
         (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'distance_km', lc.distance_km))
          FROM listing_colleges lc JOIN colleges c ON c.id = lc.college_id WHERE lc.listing_id = l.id), '[]'
       ) AS colleges,
       (SELECT round(avg(r.rating)::numeric, 1) FROM reviews r WHERE r.listing_id = l.id) AS avg_rating
     FROM listings l
     JOIN users u ON u.id = l.owner_id
     WHERE l.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function findByOwner(ownerId) {
  const { rows } = await pool.query(
    `SELECT l.*,
       COALESCE((SELECT json_agg(li.file_path) FROM listing_images li WHERE li.listing_id = l.id), '[]') AS images
     FROM listings l
     WHERE l.owner_id = $1
     ORDER BY l.created_at DESC`,
    [ownerId]
  );
  return rows;
}

// Builds the WHERE clause conditionally so an unset filter simply isn't
// added, instead of writing a separate query per filter combination.
async function search({ collegeId, minBudget, maxBudget, genderPreference, amenityIds }) {
  const conditions = [`l.status = 'active'`];
  const params = [];

  if (collegeId) {
    params.push(collegeId);
    conditions.push(
      `EXISTS (SELECT 1 FROM listing_colleges lc WHERE lc.listing_id = l.id AND lc.college_id = $${params.length})`
    );
  }
  if (minBudget) {
    params.push(minBudget);
    conditions.push(`l.rent >= $${params.length}`);
  }
  if (maxBudget) {
    params.push(maxBudget);
    conditions.push(`l.rent <= $${params.length}`);
  }
  if (genderPreference && genderPreference !== 'any') {
    params.push(genderPreference);
    conditions.push(`(l.gender_preference = $${params.length} OR l.gender_preference = 'any')`);
  }
  if (amenityIds && amenityIds.length > 0) {
    params.push(amenityIds);
    conditions.push(
      `(SELECT COUNT(DISTINCT la.amenity_id) FROM listing_amenities la
        WHERE la.listing_id = l.id AND la.amenity_id = ANY($${params.length})) = ${amenityIds.length}`
    );
  }

  const sql = `
    SELECT
      l.id, l.title, l.rent, l.deposit, l.address, l.gender_preference, l.created_at,
      (SELECT li.file_path FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.id ASC LIMIT 1) AS cover_image,
      (SELECT round(avg(r.rating)::numeric, 1) FROM reviews r WHERE r.listing_id = l.id) AS avg_rating
    FROM listings l
    WHERE ${conditions.join(' AND ')}
    ORDER BY l.created_at DESC
  `;
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function setStatus(id, ownerId, status) {
  const { rows } = await pool.query(
    'UPDATE listings SET status = $1 WHERE id = $2 AND owner_id = $3 RETURNING *',
    [status, id, ownerId]
  );
  return rows[0] || null;
}

async function remove(id, ownerId) {
  const { rowCount } = await pool.query(
    'DELETE FROM listings WHERE id = $1 AND owner_id = $2',
    [id, ownerId]
  );
  return rowCount > 0;
}

module.exports = { createWithRelations, findById, findByOwner, search, setStatus, remove };
