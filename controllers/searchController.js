const searchService = require('../services/searchService');
const collegeModel = require('../models/collegeModel');
const amenityModel = require('../models/amenityModel');
const asyncHandler = require('../middleware/asyncHandler');

const search = asyncHandler(async (req, res) => {
  const listings = await searchService.searchListings(req.query);
  res.json({ listings });
});

// Powers the filter dropdowns on the search page (college + amenity lists).
const filterOptions = asyncHandler(async (req, res) => {
  const [colleges, amenities] = await Promise.all([collegeModel.findAll(), amenityModel.findAll()]);
  res.json({ colleges, amenities });
});

module.exports = { search, filterOptions };
