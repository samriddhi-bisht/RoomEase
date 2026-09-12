const searchService = require('../services/searchService');
const collegeModel = require('../models/collegeModel');
const amenityModel = require('../models/amenityModel');
const listingModel = require('../models/listingModel');
const asyncHandler = require('../middleware/asyncHandler');

const search = asyncHandler(async (req, res) => {
  const listings = await searchService.searchListings(req.query);
  res.json({ listings });
});

const PROPERTY_TYPES = [
  { value: 'pg', label: 'PG' },
  { value: 'flat', label: 'Flat' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'studio', label: 'Studio' },
  { value: 'room', label: 'Single Room' },
];

const FURNISHING_TYPES = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi_furnished', label: 'Semi-furnished' },
  { value: 'furnished', label: 'Furnished' },
];

const SHARING_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double sharing' },
  { value: 'triple', label: 'Triple sharing' },
  { value: 'any', label: 'Any' },
];

// Powers the filter sidebar on the search page (college, amenity, city and
// property-type options), so the frontend never has to hardcode enum values.
const filterOptions = asyncHandler(async (req, res) => {
  const [colleges, amenities, cities] = await Promise.all([
    collegeModel.findAll(),
    amenityModel.findAll(),
    listingModel.distinctCities(),
  ]);
  res.json({
    colleges,
    amenities,
    cities,
    propertyTypes: PROPERTY_TYPES,
    furnishingTypes: FURNISHING_TYPES,
    sharingTypes: SHARING_TYPES,
  });
});

module.exports = { search, filterOptions };
