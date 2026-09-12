require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const colleges = [
  { name: 'Delhi University - North Campus', city: 'Delhi', lat: 28.6889, lng: 77.209 },
  { name: 'IIT Delhi', city: 'Delhi', lat: 28.5449, lng: 77.1926 },
  { name: 'Jamia Millia Islamia', city: 'Delhi', lat: 28.5623, lng: 77.2822 },
  { name: 'Christ University', city: 'Bangalore', lat: 12.9352, lng: 77.6068 },
  { name: 'Symbiosis International University', city: 'Pune', lat: 18.5642, lng: 73.8103 },
];

const amenities = ['WiFi', 'Food', 'Laundry', 'House Help', 'AC', 'Parking', 'Power Backup', 'Security'];

// Everyone created below shares this password so the seeded accounts are
// easy to demo with. Real signups go through authService, never this file.
const DEMO_PASSWORD = 'Demo@1234';

const DEMO_OWNERS = [
  { name: 'Anita Verma', email: 'anita.verma@owner.demo', phone: '9810000001' },
  { name: 'Suresh Nair', email: 'suresh.nair@owner.demo', phone: '9810000002' },
  { name: 'Fatima Sheikh', email: 'fatima.sheikh@owner.demo', phone: '9810000003' },
  { name: 'Vikram Singh', email: 'vikram.singh@owner.demo', phone: '9810000004' },
  { name: 'Meena Iyer', email: 'meena.iyer@owner.demo', phone: '9810000005' },
  { name: 'Arjun Malhotra', email: 'arjun.malhotra@owner.demo', phone: '9810000006' },
];

const DEMO_STUDENTS = [
  { name: 'Rohit Kumar', email: 'rohit.kumar@student.demo', phone: '9820000001' },
  { name: 'Ananya Das', email: 'ananya.das@student.demo', phone: '9820000002' },
  { name: 'Karan Mehta', email: 'karan.mehta@student.demo', phone: '9820000003' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@student.demo', phone: '9820000004' },
  { name: 'Aditya Rao', email: 'aditya.rao@student.demo', phone: '9820000005' },
  { name: 'Neha Joshi', email: 'neha.joshi@student.demo', phone: '9820000006' },
  { name: 'Farhan Ali', email: 'farhan.ali@student.demo', phone: '9820000007' },
  { name: 'Ishita Kapoor', email: 'ishita.kapoor@student.demo', phone: '9820000008' },
  { name: 'Devansh Patel', email: 'devansh.patel@student.demo', phone: '9820000009' },
  { name: 'Riya Chatterjee', email: 'riya.chatterjee@student.demo', phone: '9820000010' },
];

// Real interior photos (Unsplash), spot-checked for actual bedroom/kitchen/
// living-room content — no people, no off-theme shots. Deliberately chosen
// to be modest, lived-in rooms (bunk-bed dorms, simple twin beds, plain
// bedrooms) rather than polished Western real-estate staging, since this is
// budget student housing, not a design-magazine spread. Requested at a
// fixed crop so every listing card gets a consistent size regardless of the
// source photo's original aspect ratio.
const UNSPLASH_IDS = [
  '1768289269971-6171457bed13', // steel bunk beds, grille windows — hostel dorm
  '1623625434462-e5e42318ae49', // simple twin beds, plain room
  '1668258849037-4caa7e2c1347', // modest single bed, mosquito net
  '1530334580314-1e7a340426a0', // plain single bedroom, wood floor
  '1709805619372-40de3f158e83', // wooden bunk beds, hostel room
  '1535186696008-7cba739a3103', // modest lived-in kitchen
  '1631679706909-1844bbd07221', // simple sitting area
  '1502672260266-1c1ef2d93688', // small living room
  '1522708323590-d24dbb6b0267', // dining corner
];
const ROOM_IMAGES = UNSPLASH_IDS.map((id) => `https://images.unsplash.com/photo-${id}?w=900&h=600&fit=crop&auto=format&q=70`);
function imagesFor(count, offset) {
  return Array.from({ length: count }, (_, i) => ROOM_IMAGES[(offset + i) % ROOM_IMAGES.length]);
}

async function upsertColleges() {
  const ids = {};
  for (const c of colleges) {
    const { rows } = await pool.query(
      `INSERT INTO colleges (name, city, lat, lng) VALUES ($1, $2, $3, $4)
       ON CONFLICT (name, city) DO UPDATE SET city = EXCLUDED.city
       RETURNING id, name`,
      [c.name, c.city, c.lat, c.lng]
    );
    ids[c.name] = rows[0].id;
  }
  return ids;
}

async function upsertAmenities() {
  const ids = {};
  for (const a of amenities) {
    const { rows } = await pool.query(
      `INSERT INTO amenities (name) VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, name`,
      [a]
    );
    ids[a] = rows[0].id;
  }
  return ids;
}

async function upsertUser({ name, email, phone, role }, passwordHash) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, phone)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, name, email`,
    [name, email, passwordHash, role, phone]
  );
  return rows[0];
}

async function createListing({ ownerId, title, description, rent, deposit, address, city, propertyType, furnishing, sharingType, genderPreference, amenityIds, collegeLinks, images, status }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO listings (owner_id, title, description, rent, deposit, address, gender_preference, status, city, property_type, furnishing, sharing_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [ownerId, title, description, rent, deposit, address, genderPreference, status || 'active', city, propertyType || 'pg', furnishing || 'unfurnished', sharingType || 'any']
    );
    const listing = rows[0];
    for (const amenityId of amenityIds) {
      await client.query('INSERT INTO listing_amenities (listing_id, amenity_id) VALUES ($1, $2)', [listing.id, amenityId]);
    }
    for (const { collegeId, distanceKm } of collegeLinks) {
      await client.query(
        'INSERT INTO listing_colleges (listing_id, college_id, distance_km) VALUES ($1, $2, $3)',
        [listing.id, collegeId, distanceKm]
      );
    }
    for (const filePath of images) {
      await client.query('INSERT INTO listing_images (listing_id, file_path) VALUES ($1, $2)', [listing.id, filePath]);
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

async function addReview(listingId, userId, rating, comment) {
  await pool.query(
    `INSERT INTO reviews (listing_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)
     ON CONFLICT (listing_id, user_id) DO NOTHING`,
    [listingId, userId, rating, comment]
  );
}

async function upsertRoommateProfile(userId, { collegeId, budgetMin, budgetMax, habits, bio }) {
  await pool.query(
    `INSERT INTO roommate_profiles (user_id, college_id, budget_min, budget_max, habits, bio)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id) DO UPDATE SET
       college_id = EXCLUDED.college_id, budget_min = EXCLUDED.budget_min,
       budget_max = EXCLUDED.budget_max, habits = EXCLUDED.habits, bio = EXCLUDED.bio`,
    [userId, collegeId, budgetMin, budgetMax, habits, bio]
  );
}

async function addKycDocument({ userId, docType, filePath, ocrName, ocrDob, status, rejectionReason, verifiedBy }) {
  const verifiedAt = status === 'verified' || status === 'rejected' ? new Date() : null;
  const { rows } = await pool.query(
    `INSERT INTO kyc_documents (user_id, doc_type, file_path, ocr_extracted_name, ocr_extracted_dob, status, rejection_reason, verified_by, verified_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [userId, docType, filePath, ocrName, ocrDob, status, rejectionReason || null, verifiedBy || null, verifiedAt]
  );
  await pool.query('UPDATE users SET kyc_status = $1 WHERE id = $2', [status, userId]);
  return rows[0].id;
}

async function addConnection(requesterId, receiverId, status) {
  const { rows } = await pool.query(
    `INSERT INTO connections (requester_id, receiver_id, status) VALUES ($1, $2, $3)
     ON CONFLICT (requester_id, receiver_id) DO NOTHING
     RETURNING id`,
    [requesterId, receiverId, status]
  );
  return rows[0] && rows[0].id;
}

async function seed() {
  const collegeIds = await upsertColleges();
  const amenityIds = await upsertAmenities();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const owners = {};
  for (const o of DEMO_OWNERS) owners[o.email] = await upsertUser({ ...o, role: 'owner' }, passwordHash);

  const students = {};
  for (const s of DEMO_STUDENTS) students[s.email] = await upsertUser({ ...s, role: 'student' }, passwordHash);

  const DU = collegeIds['Delhi University - North Campus'];
  const IITD = collegeIds['IIT Delhi'];
  const JMI = collegeIds['Jamia Millia Islamia'];
  const CHRIST = collegeIds['Christ University'];
  const SYM = collegeIds['Symbiosis International University'];
  const A = amenityIds;

  const anita = owners['anita.verma@owner.demo'].id;
  const suresh = owners['suresh.nair@owner.demo'].id;
  const fatima = owners['fatima.sheikh@owner.demo'].id;
  const vikram = owners['vikram.singh@owner.demo'].id;
  const meena = owners['meena.iyer@owner.demo'].id;
  const arjun = owners['arjun.malhotra@owner.demo'].id;

  const rohit = students['rohit.kumar@student.demo'].id;
  const ananya = students['ananya.das@student.demo'].id;
  const karan = students['karan.mehta@student.demo'].id;
  const sneha = students['sneha.reddy@student.demo'].id;
  const aditya = students['aditya.rao@student.demo'].id;
  const neha = students['neha.joshi@student.demo'].id;
  const farhan = students['farhan.ali@student.demo'].id;
  const ishita = students['ishita.kapoor@student.demo'].id;
  const devansh = students['devansh.patel@student.demo'].id;
  const riya = students['riya.chatterjee@student.demo'].id;

  // Only create demo listings once — reruns of `npm run seed` shouldn't pile
  // up duplicate listings every time. Everything after this (reviews,
  // profiles, kyc, connections) is written with ON CONFLICT DO NOTHING /
  // UPDATE, so it's safe to always run and just fills in whatever the
  // previous run didn't finish.
  const { rows: existingListings } = await pool.query('SELECT id FROM listings WHERE owner_id = $1 LIMIT 1', [anita]);
  const skipListingCreation = existingListings.length > 0;
  if (skipListingCreation) console.log('Demo listings already present — skipping listing creation.');

  const listings = [];
  if (!skipListingCreation) {
  listings.push(await createListing({
    ownerId: anita, title: 'Sunny Single Room – Kamla Nagar',
    description: 'Bright single-occupancy room in a family home, 5 minutes from North Campus gate. Home-cooked meals included.',
    rent: 7500, deposit: 10000, address: 'Kamla Nagar, Delhi', city: 'Delhi', propertyType: 'room', furnishing: 'unfurnished', sharingType: 'single', genderPreference: 'any',
    amenityIds: [A.WiFi, A.Food, A.Laundry], collegeLinks: [{ collegeId: DU, distanceKm: 0.3 }],
    images: imagesFor(3, 0),
  }));
  listings.push(await createListing({
    ownerId: arjun, title: 'Shared 2BHK Flat – GTB Nagar',
    description: 'Two-bedroom flat shared between 3 students, walking distance from the metro and North Campus.',
    rent: 6000, deposit: 8000, address: 'GTB Nagar, Delhi', city: 'Delhi', propertyType: 'flat', furnishing: 'semi_furnished', sharingType: 'triple', genderPreference: 'male',
    amenityIds: [A.WiFi, A['Power Backup'], A.Security], collegeLinks: [{ collegeId: DU, distanceKm: 0.6 }],
    images: imagesFor(3, 1),
  }));
  listings.push(await createListing({
    ownerId: fatima, title: 'Girls PG with Home Food – Vijay Nagar',
    description: 'All-girls PG with three home-cooked meals a day, laundry service and a live-in caretaker.',
    rent: 9000, deposit: 9000, address: 'Vijay Nagar, Delhi', city: 'Delhi', propertyType: 'pg', furnishing: 'furnished', sharingType: 'double', genderPreference: 'female',
    amenityIds: [A.Food, A.WiFi, A['House Help'], A.Security], collegeLinks: [{ collegeId: DU, distanceKm: 0.5 }],
    images: imagesFor(2, 2),
  }));
  listings.push(await createListing({
    ownerId: arjun, title: 'Studio Apartment – Hauz Khas',
    description: 'Independent studio with AC and a dedicated work desk, ideal for a single research student.',
    rent: 15000, deposit: 30000, address: 'Hauz Khas, Delhi', city: 'Delhi', propertyType: 'studio', furnishing: 'furnished', sharingType: 'single', genderPreference: 'any',
    amenityIds: [A.WiFi, A.AC, A.Parking, A['Power Backup']], collegeLinks: [{ collegeId: IITD, distanceKm: 0.4 }],
    images: imagesFor(4, 3),
  }));
  listings.push(await createListing({
    ownerId: fatima, title: 'Boys PG – IIT Gate',
    description: 'Twin-sharing rooms right outside the IIT Delhi main gate. Mess food and daily laundry pickup.',
    rent: 8500, deposit: 8500, address: 'IIT Gate, Delhi', city: 'Delhi', propertyType: 'pg', furnishing: 'semi_furnished', sharingType: 'double', genderPreference: 'male',
    amenityIds: [A.Food, A.WiFi, A.Laundry], collegeLinks: [{ collegeId: IITD, distanceKm: 0.2 }],
    images: imagesFor(2, 4),
  }));
  listings.push(await createListing({
    ownerId: anita, title: 'Cozy 1RK – Jamia Nagar',
    description: 'Compact 1-room-kitchen set up for a single student, quiet lane close to Jamia.',
    rent: 7000, deposit: 7000, address: 'Jamia Nagar, Delhi', city: 'Delhi', propertyType: 'room', furnishing: 'semi_furnished', sharingType: 'single', genderPreference: 'any',
    amenityIds: [A.WiFi, A.Food], collegeLinks: [{ collegeId: JMI, distanceKm: 0.3 }],
    images: imagesFor(2, 5),
  }));
  listings.push(await createListing({
    ownerId: arjun, title: 'Girls Hostel – Batla House',
    description: 'Supervised girls hostel with CCTV, in-house cook and a 10pm gate — popular with first-years.',
    rent: 6500, deposit: 5000, address: 'Batla House, Delhi', city: 'Delhi', propertyType: 'hostel', furnishing: 'unfurnished', sharingType: 'triple', genderPreference: 'female',
    amenityIds: [A.Food, A.Security, A['House Help']], collegeLinks: [{ collegeId: JMI, distanceKm: 0.5 }],
    images: imagesFor(3, 6),
  }));
  listings.push(await createListing({
    ownerId: suresh, title: 'Premium PG for Students – Hosur Road',
    description: 'AC rooms with attached washrooms, daily housekeeping and a common study lounge.',
    rent: 12000, deposit: 12000, address: 'Hosur Road, Bangalore', city: 'Bangalore', propertyType: 'pg', furnishing: 'furnished', sharingType: 'double', genderPreference: 'any',
    amenityIds: [A.WiFi, A.AC, A.Food, A.Security], collegeLinks: [{ collegeId: CHRIST, distanceKm: 0.3 }],
    images: imagesFor(3, 7),
  }));
  listings.push(await createListing({
    ownerId: meena, title: 'Budget Sharing Room – Dairy Circle',
    description: 'No-frills triple-sharing room for students on a tight budget, 10 minute walk to campus.',
    rent: 6000, deposit: 6000, address: 'Dairy Circle, Bangalore', city: 'Bangalore', propertyType: 'room', furnishing: 'unfurnished', sharingType: 'triple', genderPreference: 'male',
    amenityIds: [A.WiFi, A.Laundry], collegeLinks: [{ collegeId: CHRIST, distanceKm: 0.8 }],
    images: imagesFor(2, 0),
  }));
  listings.push(await createListing({
    ownerId: suresh, title: 'Fully Furnished Flat – Koramangala',
    description: 'Modern 2BHK flat, fully furnished, ideal for 2-3 students sharing. Covered parking included.',
    rent: 16000, deposit: 20000, address: 'Koramangala, Bangalore', city: 'Bangalore', propertyType: 'flat', furnishing: 'furnished', sharingType: 'triple', genderPreference: 'any',
    amenityIds: [A.WiFi, A.AC, A.Parking, A['Power Backup'], A.Security], collegeLinks: [{ collegeId: CHRIST, distanceKm: 1.2 }],
    images: imagesFor(4, 1),
  }));
  listings.push(await createListing({
    ownerId: vikram, title: 'Girls PG – Viman Nagar',
    description: 'Homely girls PG close to Symbiosis, with a shared kitchen and weekly housekeeping.',
    rent: 9500, deposit: 9500, address: 'Viman Nagar, Pune', city: 'Pune', propertyType: 'pg', furnishing: 'semi_furnished', sharingType: 'double', genderPreference: 'female',
    amenityIds: [A.Food, A.WiFi, A['House Help']], collegeLinks: [{ collegeId: SYM, distanceKm: 0.4 }],
    images: imagesFor(3, 2),
  }));
  listings.push(await createListing({
    ownerId: vikram, title: 'Shared Flat for Boys – Viman Nagar',
    description: 'Simple, affordable shared flat a short auto ride from the Symbiosis campus.',
    rent: 7000, deposit: 7000, address: 'Viman Nagar, Pune', city: 'Pune', propertyType: 'flat', furnishing: 'unfurnished', sharingType: 'triple', genderPreference: 'male',
    amenityIds: [A.WiFi, A['Power Backup']], collegeLinks: [{ collegeId: SYM, distanceKm: 0.6 }],
    images: imagesFor(2, 3),
  }));
  listings.push(await createListing({
    ownerId: meena, title: 'Studio near Symbiosis Campus',
    description: 'Self-contained studio with a small kitchenette, AC and reserved parking for a two-wheeler.',
    rent: 13000, deposit: 15000, address: 'Viman Nagar, Pune', city: 'Pune', propertyType: 'studio', furnishing: 'furnished', sharingType: 'single', genderPreference: 'any',
    amenityIds: [A.WiFi, A.AC, A.Food, A.Parking], collegeLinks: [{ collegeId: SYM, distanceKm: 0.2 }],
    images: imagesFor(3, 4),
  }));

  const { rows: rameshRow } = await pool.query("SELECT id FROM users WHERE email = 'ramesh@owner.test'");
  if (rameshRow.length) {
    const ramesh = rameshRow[0].id;
    listings.push(await createListing({
      ownerId: ramesh, title: 'Old Listing (Inactive) – Model Town',
      description: 'No longer taking new tenants — kept here for reference.',
      rent: 5000, deposit: 5000, address: 'Model Town, Delhi', city: 'Delhi', propertyType: 'room', furnishing: 'unfurnished', sharingType: 'single', genderPreference: 'any',
      amenityIds: [A.WiFi], collegeLinks: [{ collegeId: DU, distanceKm: 1.0 }],
      images: imagesFor(1, 5), status: 'inactive',
    }));
    listings.push(await createListing({
      ownerId: anita, title: 'Renovation Pending – Malviya Nagar',
      description: 'Temporarily off the market while the building is renovated.',
      rent: 8000, deposit: 8000, address: 'Malviya Nagar, Delhi', city: 'Delhi', propertyType: 'flat', furnishing: 'unfurnished', sharingType: 'double', genderPreference: 'any',
      amenityIds: [A.WiFi], collegeLinks: [{ collegeId: IITD, distanceKm: 1.5 }],
      images: imagesFor(1, 6), status: 'inactive',
    }));
  }
  } // end if (!skipListingCreation)

  const titleToListing = {};
  if (skipListingCreation) {
    const wantedTitles = [
      'Sunny Single Room – Kamla Nagar', 'Shared 2BHK Flat – GTB Nagar', 'Girls PG with Home Food – Vijay Nagar',
      'Studio Apartment – Hauz Khas', 'Girls Hostel – Batla House', 'Premium PG for Students – Hosur Road',
      'Budget Sharing Room – Dairy Circle', 'Girls PG – Viman Nagar', 'Studio near Symbiosis Campus',
    ];
    const { rows } = await pool.query('SELECT id, title FROM listings WHERE title = ANY($1)', [wantedTitles]);
    for (const row of rows) titleToListing[row.title] = row;
  } else {
    for (const l of listings) titleToListing[l.title] = l;
  }

  const l1 = titleToListing['Sunny Single Room – Kamla Nagar'];
  const l2 = titleToListing['Shared 2BHK Flat – GTB Nagar'];
  const l3 = titleToListing['Girls PG with Home Food – Vijay Nagar'];
  const l4 = titleToListing['Studio Apartment – Hauz Khas'];
  const l7 = titleToListing['Girls Hostel – Batla House'];
  const l8 = titleToListing['Premium PG for Students – Hosur Road'];
  const l9 = titleToListing['Budget Sharing Room – Dairy Circle'];
  const l11 = titleToListing['Girls PG – Viman Nagar'];
  const l13 = titleToListing['Studio near Symbiosis Campus'];
  await addReview(l1.id, rohit, 5, 'Great place, home-cooked food included. Aunty is super friendly.');
  await addReview(l1.id, ananya, 4, 'Good location, a bit far from the metro but manageable.');
  await addReview(l2.id, karan, 4, 'Nice roommates, WiFi could be faster during peak hours.');
  await addReview(l3.id, ishita, 5, 'Best home food near DU! Feels safe and well looked after.');
  await addReview(l4.id, sneha, 5, 'Spacious and clean, AC works great even in peak summer.');
  await addReview(l7.id, devansh, 3, 'Basic but affordable, does the job for the price.');
  await addReview(l8.id, aditya, 4, 'Close to campus, food is decent, rooms could use better lighting.');
  await addReview(l9.id, farhan, 4, 'Good value for a budget room, staff is responsive.');
  await addReview(l11.id, neha, 5, 'Safe and homely PG for girls, exactly what I was looking for.');
  await addReview(l13.id, riya, 4, 'Great studio, a bit pricey but worth it for the privacy.');

  await upsertRoommateProfile(rohit, { collegeId: DU, budgetMin: 5000, budgetMax: 8000, habits: 'Early riser, non-smoker', bio: 'CS student, looking for a quiet 2BHK near North Campus.' });
  await upsertRoommateProfile(ananya, { collegeId: DU, budgetMin: 6000, budgetMax: 9000, habits: 'Vegetarian, night owl', bio: 'Second year, love reading, want a chill flatmate.' });
  await upsertRoommateProfile(karan, { collegeId: IITD, budgetMin: 8000, budgetMax: 15000, habits: 'Fitness enthusiast', bio: 'Engineering student, usually at the gym before classes.' });
  await upsertRoommateProfile(sneha, { collegeId: IITD, budgetMin: 10000, budgetMax: 16000, habits: 'Clean freak, vegetarian', bio: 'M.Tech student, prefer AC rooms and a tidy flat.' });
  await upsertRoommateProfile(aditya, { collegeId: CHRIST, budgetMin: 8000, budgetMax: 13000, habits: 'Non-smoker, weekend traveler', bio: 'MBA student, need a place close to campus for early classes.' });
  await upsertRoommateProfile(neha, { collegeId: CHRIST, budgetMin: 6000, budgetMax: 10000, habits: 'Vegetarian, early sleeper', bio: 'Looking for an all-girls PG with good food nearby.' });
  await upsertRoommateProfile(farhan, { collegeId: SYM, budgetMin: 9000, budgetMax: 14000, habits: 'Night owl, works part-time', bio: 'Design student, need reliable WiFi for coursework.' });
  await upsertRoommateProfile(ishita, { collegeId: JMI, budgetMin: 5000, budgetMax: 8000, habits: 'Quiet, studious', bio: 'Prefer a peaceful place close to the library.' });
  await upsertRoommateProfile(devansh, { collegeId: JMI, budgetMin: 6000, budgetMax: 9000, habits: 'Social, plays guitar', bio: 'Looking for a fun and friendly flat to share.' });
  await upsertRoommateProfile(riya, { collegeId: DU, budgetMin: 7000, budgetMax: 10000, habits: 'Early riser, tidy', bio: 'Journalism student with a small cat — pet-friendly flatmates only.' });

  const doc = '/img/demo/id-doc.svg';
  await addKycDocument({ userId: rohit, docType: 'aadhaar', filePath: doc, ocrName: 'Rohit Kumar', ocrDob: '2003-04-12', status: 'pending' });
  await addKycDocument({ userId: ananya, docType: 'college_id', filePath: doc, ocrName: 'Ananya Das', ocrDob: '2002-11-03', status: 'verified', verifiedBy: 1 });
  await addKycDocument({ userId: karan, docType: 'aadhaar', filePath: doc, ocrName: 'Karan Mehta', ocrDob: '2001-07-22', status: 'rejected', rejectionReason: 'Document photo unclear, please reupload.', verifiedBy: 1 });
  await addKycDocument({ userId: sneha, docType: 'passport', filePath: doc, ocrName: 'Sneha Reddy', ocrDob: '2000-09-15', status: 'pending' });
  await addKycDocument({ userId: suresh, docType: 'aadhaar', filePath: doc, ocrName: 'Suresh Nair', ocrDob: '1985-02-18', status: 'verified', verifiedBy: 1 });
  await addKycDocument({ userId: vikram, docType: 'driving_license', filePath: doc, ocrName: 'Vikram Singh', ocrDob: '1979-06-30', status: 'pending' });
  await addKycDocument({ userId: meena, docType: 'aadhaar', filePath: doc, ocrName: 'Meena Iyer', ocrDob: '1988-12-05', status: 'verified', verifiedBy: 1 });
  await addKycDocument({ userId: fatima, docType: 'aadhaar', filePath: doc, ocrName: 'Fatima Sheikh', ocrDob: '1990-03-27', status: 'pending' });

  await addConnection(rohit, ananya, 'pending');
  await addConnection(karan, sneha, 'accepted');
  await addConnection(aditya, neha, 'rejected');
  await addConnection(farhan, ishita, 'pending');
  await addConnection(devansh, riya, 'accepted');

  console.log(`Seed complete. Demo users share the password: ${DEMO_PASSWORD}`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
