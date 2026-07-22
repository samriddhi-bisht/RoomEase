const adminService = require('../services/adminService');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const listAllListings = asyncHandler(async (req, res) => {
  const listings = await adminService.allListings();
  res.json({ listings });
});

const moderateListing = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const listing = await adminService.moderateListing(req.params.id, status);
  if (!listing) throw new AppError('Listing not found.', 404);
  res.json({ listing });
});

module.exports = { listAllListings, moderateListing };
