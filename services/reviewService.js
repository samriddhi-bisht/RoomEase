const reviewModel = require('../models/reviewModel');
const listingModel = require('../models/listingModel');
const AppError = require('../utils/AppError');

async function addReview({ listingId, userId, rating, comment }) {
  const listing = await listingModel.findById(listingId);
  if (!listing) throw new AppError('Listing not found.', 404);

  try {
    return await reviewModel.create({ listingId, userId, rating, comment });
  } catch (err) {
    // Postgres error code 23505 = unique_violation, thrown by the
    // unique_review_per_user_listing constraint — catching it here turns a
    // raw DB error into a clear, expected message instead of a 500.
    if (err.code === '23505') {
      throw new AppError('You have already reviewed this listing.', 409);
    }
    throw err;
  }
}

module.exports = { addReview };
