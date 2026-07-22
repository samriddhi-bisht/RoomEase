const listingService = require('../services/listingService');
const reviewModel = require('../models/reviewModel');
const asyncHandler = require('../middleware/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const listing = await listingService.createListing({ ownerId: req.user.id, body: req.body, files: req.files });
  res.status(201).json({ listing });
});

const getOne = asyncHandler(async (req, res) => {
  const listing = await listingService.getListing(req.params.id);
  const reviews = await reviewModel.findByListing(req.params.id);
  res.json({ listing, reviews });
});

const myListings = asyncHandler(async (req, res) => {
  const listings = await listingService.getOwnerListings(req.user.id);
  res.json({ listings });
});

const deactivate = asyncHandler(async (req, res) => {
  const listing = await listingService.deactivateListing(req.params.id, req.user.id);
  res.json({ listing });
});

const activate = asyncHandler(async (req, res) => {
  const listing = await listingService.activateListing(req.params.id, req.user.id);
  res.json({ listing });
});

const remove = asyncHandler(async (req, res) => {
  await listingService.deleteListing(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = { create, getOne, myListings, deactivate, activate, remove };
