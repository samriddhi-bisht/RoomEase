const listingModel = require('../models/listingModel');

function toArray(value) {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

const VALID_SORTS = new Set(['price_asc', 'price_desc', 'newest', 'rating']);

async function searchListings(query) {
  return listingModel.search({
    collegeId: query.collegeId ? Number(query.collegeId) : null,
    minBudget: query.minBudget ? Number(query.minBudget) : null,
    maxBudget: query.maxBudget ? Number(query.maxBudget) : null,
    genderPreference: query.genderPreference || null,
    amenityIds: toArray(query.amenityIds).map(Number),
    city: query.city || null,
    propertyType: toArray(query.propertyType),
    furnishing: query.furnishing || null,
    sharingType: query.sharingType || null,
    q: query.q || null,
    sort: VALID_SORTS.has(query.sort) ? query.sort : 'newest',
  });
}

module.exports = { searchListings };
