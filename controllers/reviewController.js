const reviewService = require('../services/reviewService');
const asyncHandler = require('../middleware/asyncHandler');

const add = asyncHandler(async (req, res) => {
  const review = await reviewService.addReview({
    listingId: req.params.listingId,
    userId: req.user.id,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  res.status(201).json({ review });
});

module.exports = { add };
