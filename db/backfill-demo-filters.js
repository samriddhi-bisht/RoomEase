// One-off local dev script: backfills city/property_type/furnishing/sharing_type
// on demo listings that were seeded before migration 002 added those columns.
// Non-destructive UPDATE only — safe to delete after running once.
require('dotenv').config();
const pool = require('../config/db');

const UPDATES = [
  ['Sunny Single Room – Kamla Nagar', 'Delhi', 'room', 'unfurnished', 'single'],
  ['Shared 2BHK Flat – GTB Nagar', 'Delhi', 'flat', 'semi_furnished', 'triple'],
  ['Girls PG with Home Food – Vijay Nagar', 'Delhi', 'pg', 'furnished', 'double'],
  ['Studio Apartment – Hauz Khas', 'Delhi', 'studio', 'furnished', 'single'],
  ['Boys PG – IIT Gate', 'Delhi', 'pg', 'semi_furnished', 'double'],
  ['Cozy 1RK – Jamia Nagar', 'Delhi', 'room', 'semi_furnished', 'single'],
  ['Girls Hostel – Batla House', 'Delhi', 'hostel', 'unfurnished', 'triple'],
  ['Premium PG for Students – Hosur Road', 'Bangalore', 'pg', 'furnished', 'double'],
  ['Budget Sharing Room – Dairy Circle', 'Bangalore', 'room', 'unfurnished', 'triple'],
  ['Fully Furnished Flat – Koramangala', 'Bangalore', 'flat', 'furnished', 'triple'],
  ['Girls PG – Viman Nagar', 'Pune', 'pg', 'semi_furnished', 'double'],
  ['Shared Flat for Boys – Viman Nagar', 'Pune', 'flat', 'unfurnished', 'triple'],
  ['Studio near Symbiosis Campus', 'Pune', 'studio', 'furnished', 'single'],
  ['Old Listing (Inactive) – Model Town', 'Delhi', 'room', 'unfurnished', 'single'],
  ['Renovation Pending – Malviya Nagar', 'Delhi', 'flat', 'unfurnished', 'double'],
];

async function run() {
  let updated = 0;
  for (const [title, city, propertyType, furnishing, sharingType] of UPDATES) {
    const { rowCount } = await pool.query(
      `UPDATE listings SET city = $2, property_type = $3, furnishing = $4, sharing_type = $5
       WHERE title = $1 AND city IS NULL`,
      [title, city, propertyType, furnishing, sharingType]
    );
    updated += rowCount;
  }
  console.log(`Backfilled ${updated} listing(s).`);
  await pool.end();
}

run().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
