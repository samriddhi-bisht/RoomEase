-- 002_listing_filters.sql
-- Adds the columns needed for e-commerce-style browsing: a plain-text city
-- for location search independent of colleges, plus property type,
-- furnishing and sharing type so students can filter PG vs flat vs hostel.

CREATE TYPE property_type AS ENUM ('pg', 'flat', 'hostel', 'studio', 'room');
CREATE TYPE furnishing_type AS ENUM ('unfurnished', 'semi_furnished', 'furnished');
CREATE TYPE sharing_type AS ENUM ('single', 'double', 'triple', 'any');

ALTER TABLE listings
  ADD COLUMN city VARCHAR(100),
  ADD COLUMN property_type property_type NOT NULL DEFAULT 'pg',
  ADD COLUMN furnishing furnishing_type NOT NULL DEFAULT 'unfurnished',
  ADD COLUMN sharing_type sharing_type NOT NULL DEFAULT 'any';

CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_property_type ON listings(property_type);
CREATE INDEX idx_listings_rent ON listings(rent);
