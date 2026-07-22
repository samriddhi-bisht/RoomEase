-- 001_init.sql
-- Core schema for RoomEase. Written by hand (no ORM) so joins, constraints,
-- and indexes are all explicit and visible.

CREATE TYPE user_role AS ENUM ('student', 'owner', 'admin');
CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'verified', 'rejected');
CREATE TYPE doc_type AS ENUM ('aadhaar', 'college_id', 'passport', 'driving_license');
CREATE TYPE listing_status AS ENUM ('active', 'inactive');
CREATE TYPE gender_pref AS ENUM ('male', 'female', 'any');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  phone VARCHAR(20),
  kyc_status kyc_status NOT NULL DEFAULT 'not_submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE colleges (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  CONSTRAINT unique_college_name_city UNIQUE (name, city)
);

CREATE TABLE kyc_documents (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type doc_type NOT NULL,
  doc_number VARCHAR(50),
  file_path TEXT NOT NULL,
  ocr_extracted_name VARCHAR(200),
  ocr_extracted_dob VARCHAR(20),
  ocr_raw_text TEXT,
  status kyc_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  verified_by BIGINT REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_status ON kyc_documents(status);

CREATE TABLE listings (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  rent NUMERIC(10,2) NOT NULL,
  deposit NUMERIC(10,2) NOT NULL DEFAULT 0,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  gender_preference gender_pref NOT NULL DEFAULT 'any',
  status listing_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_listings_owner_id ON listings(owner_id);
CREATE INDEX idx_listings_status ON listings(status);

CREATE TABLE listing_images (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL
);
CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);

CREATE TABLE amenities (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE listing_amenities (
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amenity_id BIGINT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, amenity_id)
);

CREATE TABLE listing_colleges (
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  college_id BIGINT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  distance_km NUMERIC(5,2),
  PRIMARY KEY (listing_id, college_id)
);
CREATE INDEX idx_listing_colleges_college_id ON listing_colleges(college_id);

CREATE TABLE roommate_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  college_id BIGINT REFERENCES colleges(id),
  budget_min NUMERIC(10,2),
  budget_max NUMERIC(10,2),
  habits TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE connections (
  id BIGSERIAL PRIMARY KEY,
  requester_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_connection CHECK (requester_id <> receiver_id),
  CONSTRAINT unique_pair UNIQUE (requester_id, receiver_id)
);
CREATE INDEX idx_connections_receiver_id ON connections(receiver_id);

CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_review_per_user_listing UNIQUE (listing_id, user_id)
);
CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);
