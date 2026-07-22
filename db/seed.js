require('dotenv').config();
const pool = require('../config/db');

const colleges = [
  { name: 'Delhi University - North Campus', city: 'Delhi', lat: 28.6889, lng: 77.209 },
  { name: 'IIT Delhi', city: 'Delhi', lat: 28.5449, lng: 77.1926 },
  { name: 'Jamia Millia Islamia', city: 'Delhi', lat: 28.5623, lng: 77.2822 },
  { name: 'Christ University', city: 'Bangalore', lat: 12.9352, lng: 77.6068 },
  { name: 'Symbiosis International University', city: 'Pune', lat: 18.5642, lng: 73.8103 },
];

const amenities = ['WiFi', 'Food', 'Laundry', 'House Help', 'AC', 'Parking', 'Power Backup', 'Security'];

async function seed() {
  for (const c of colleges) {
    await pool.query(
      `INSERT INTO colleges (name, city, lat, lng) VALUES ($1, $2, $3, $4)
       ON CONFLICT (name, city) DO NOTHING`,
      [c.name, c.city, c.lat, c.lng]
    );
  }
  for (const a of amenities) {
    await pool.query('INSERT INTO amenities (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [a]);
  }
  console.log('Seed complete.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
