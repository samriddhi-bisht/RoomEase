const listingModel = require('../models/listingModel');
const AppError = require('../utils/AppError');

// Multer/Express turn repeated form fields (e.g. multiple amenityIds
// checkboxes with the same name) into an array automatically, but a single
// checked box comes through as a plain string — normalize both cases here.
function toArray(value) {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

async function createListing({ ownerId, body, files }) {
  const amenityIds = toArray(body.amenityIds).map(Number);
  const collegeIds = toArray(body.collegeIds).map(Number);
  const collegeLinks = collegeIds.map((collegeId) => ({ collegeId, distanceKm: null }));
  const imagePaths = (files || []).map((f) => `/uploads/listings/${f.filename}`);

  if (imagePaths.length === 0) {
    throw new AppError('At least one listing photo is required.', 400);
  }

  return listingModel.createWithRelations({
    ownerId,
    title: body.title,
    description: body.description,
    rent: Number(body.rent),
    deposit: Number(body.deposit || 0),
    address: body.address,
    lat: body.lat ? Number(body.lat) : null,
    lng: body.lng ? Number(body.lng) : null,
    genderPreference: body.genderPreference || 'any',
    amenityIds,
    collegeLinks,
    imagePaths,
    city: body.city,
    propertyType: body.propertyType || 'pg',
    furnishing: body.furnishing || 'unfurnished',
    sharingType: body.sharingType || 'any',
  });
}

async function getListing(id) {
  const listing = await listingModel.findById(id);
  if (!listing) throw new AppError('Listing not found.', 404);
  return listing;
}

async function getOwnerListings(ownerId) {
  return listingModel.findByOwner(ownerId);
}

async function deactivateListing(id, ownerId) {
  const updated = await listingModel.setStatus(id, ownerId, 'inactive');
  if (!updated) throw new AppError('Listing not found or you do not own it.', 404);
  return updated;
}

async function activateListing(id, ownerId) {
  const updated = await listingModel.setStatus(id, ownerId, 'active');
  if (!updated) throw new AppError('Listing not found or you do not own it.', 404);
  return updated;
}

async function deleteListing(id, ownerId) {
  const deleted = await listingModel.remove(id, ownerId);
  if (!deleted) throw new AppError('Listing not found or you do not own it.', 404);
}

module.exports = {
  createListing, getListing, getOwnerListings, deactivateListing, activateListing, deleteListing,
};
