// One-off local dev script: swaps the cover/gallery photos on already-seeded
// demo listings for the more realistic set now in seed.js's UNSPLASH_IDS
// (modest bunk-bed/simple-room photos instead of staged Western real-estate
// shots). UPDATE-only against existing listing_images rows, matched by
// position — no rows deleted or inserted, so it's safe to run any time.
require('dotenv').config();
const pool = require('../config/db');

const UNSPLASH_IDS = [
  '1768289269971-6171457bed13',
  '1623625434462-e5e42318ae49',
  '1668258849037-4caa7e2c1347',
  '1530334580314-1e7a340426a0',
  '1709805619372-40de3f158e83',
  '1535186696008-7cba739a3103',
  '1631679706909-1844bbd07221',
  '1502672260266-1c1ef2d93688',
  '1522708323590-d24dbb6b0267',
];
const ROOM_IMAGES = UNSPLASH_IDS.map((id) => `https://images.unsplash.com/photo-${id}?w=900&h=600&fit=crop&auto=format&q=70`);
function imagesFor(count, offset) {
  return Array.from({ length: count }, (_, i) => ROOM_IMAGES[(offset + i) % ROOM_IMAGES.length]);
}

// title -> same (count, offset) pairs originally passed to createListing() in seed.js
const PLAN = [
  ['Sunny Single Room – Kamla Nagar', imagesFor(3, 0)],
  ['Shared 2BHK Flat – GTB Nagar', imagesFor(3, 1)],
  ['Girls PG with Home Food – Vijay Nagar', imagesFor(2, 2)],
  ['Studio Apartment – Hauz Khas', imagesFor(4, 3)],
  ['Boys PG – IIT Gate', imagesFor(2, 4)],
  ['Cozy 1RK – Jamia Nagar', imagesFor(2, 5)],
  ['Girls Hostel – Batla House', imagesFor(3, 6)],
  ['Premium PG for Students – Hosur Road', imagesFor(3, 7)],
  ['Budget Sharing Room – Dairy Circle', imagesFor(2, 0)],
  ['Fully Furnished Flat – Koramangala', imagesFor(4, 1)],
  ['Girls PG – Viman Nagar', imagesFor(3, 2)],
  ['Shared Flat for Boys – Viman Nagar', imagesFor(2, 3)],
  ['Studio near Symbiosis Campus', imagesFor(3, 4)],
  ['Old Listing (Inactive) – Model Town', imagesFor(1, 5)],
  ['Renovation Pending – Malviya Nagar', imagesFor(1, 6)],
];

async function run() {
  let updated = 0;
  for (const [title, images] of PLAN) {
    const { rows: listingRows } = await pool.query('SELECT id FROM listings WHERE title = $1', [title]);
    if (listingRows.length === 0) continue;
    const listingId = listingRows[0].id;

    const { rows: imageRows } = await pool.query(
      'SELECT id FROM listing_images WHERE listing_id = $1 ORDER BY id ASC',
      [listingId]
    );
    for (let i = 0; i < imageRows.length && i < images.length; i++) {
      await pool.query('UPDATE listing_images SET file_path = $1 WHERE id = $2', [images[i], imageRows[i].id]);
      updated++;
    }
  }
  console.log(`Backfilled ${updated} listing image(s).`);
  await pool.end();
}

run().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
