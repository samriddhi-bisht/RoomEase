const pool = require('../config/db');

// A listing is really 4 related inserts (the listing row, its images, its
// amenity links, its college links). If the process crashed after inserting
// the listing but before its amenities, we'd be left with a broken half-row
// forever. Wrapping all four in one transaction means either the whole
// listing exists correctly, or none of it does.
async function createWithRelations({
  ownerId, title, description, rent, deposit, address, lat, lng,
  genderPreference, amenityIds, collegeLinks, imagePaths,
  city, propertyType, furnishing, sharingType,
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO listings (owner_id, title, description, rent, deposit, address, lat, lng, gender_preference, city, property_type, furnishing, sharing_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        ownerId, title, description, rent, deposit, address, lat || null, lng || null, genderPreference,
        city || null, propertyType || 'pg', furnishing || 'unfurnished', sharingType || 'any',
      ]
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

const SORT_COLUMNS = {
  price_asc: 'l.rent ASC',
  price_desc: 'l.rent DESC',
  newest: 'l.created_at DESC',
  rating: 'avg_rating DESC NULLS LAST',
};

// Builds the WHERE clause conditionally so an unset filter simply isn't
// added, instead of writing a separate query per filter combination.
async function search({
  collegeId, minBudget, maxBudget, genderPreference, amenityIds,
  city, propertyType, furnishing, sharingType, q, sort,
}) {
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
  if (city) {
    params.push(`%${city}%`);
    conditions.push(`(l.city ILIKE $${params.length} OR l.address ILIKE $${params.length})`);
  }
  if (propertyType && propertyType.length > 0) {
    params.push(propertyType);
    conditions.push(`l.property_type = ANY($${params.length})`);
  }
  if (furnishing) {
    params.push(furnishing);
    conditions.push(`l.furnishing = $${params.length}`);
  }
  if (sharingType && sharingType !== 'any') {
    params.push(sharingType);
    conditions.push(`(l.sharing_type = $${params.length} OR l.sharing_type = 'any')`);
  }
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(l.title ILIKE $${params.length} OR l.address ILIKE $${params.length} OR l.city ILIKE $${params.length})`);
  }

  const orderBy = SORT_COLUMNS[sort] || SORT_COLUMNS.newest;

  const sql = `
    SELECT
      l.id, l.title, l.rent, l.deposit, l.address, l.city, l.property_type,
      l.furnishing, l.sharing_type, l.gender_preference, l.created_at,
      (SELECT li.file_path FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.id ASC LIMIT 1) AS cover_image,
      (SELECT round(avg(r.rating)::numeric, 1) FROM reviews r WHERE r.listing_id = l.id) AS avg_rating
    FROM listings l
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${orderBy}
  `;
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function distinctCities() {
  const { rows } = await pool.query(
    `SELECT DISTINCT city FROM listings WHERE city IS NOT NULL AND status = 'active' ORDER BY city ASC`
  );
  return rows.map((r) => r.city);
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

module.exports = { createWithRelations, findById, findByOwner, search, distinctCities, setStatus, remove };
