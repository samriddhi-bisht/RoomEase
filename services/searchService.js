const listingModel = require('../models/listingModel');

function toArray(value) {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

async function searchListings(query) {
  return listingModel.search({
    collegeId: query.collegeId ? Number(query.collegeId) : null,
    minBudget: query.minBudget ? Number(query.minBudget) : null,
    maxBudget: query.maxBudget ? Number(query.maxBudget) : null,
    genderPreference: query.genderPreference || null,
    amenityIds: toArray(query.amenityIds).map(Number),
  });
}

module.exports = { searchListings };
