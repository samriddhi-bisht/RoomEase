const express = require('express');
// mergeParams: true is required because this router is mounted at
// /api/v1/listings/:listingId/reviews — without it, req.params.listingId
// would be undefined inside this file.
const router = express.Router({ mergeParams: true });
const reviewController = require('../../../controllers/reviewController');
const { requireAuth } = require('../../../middleware/auth');
const requireKycVerified = require('../../../middleware/kycGate');
const validate = require('../../../middleware/validate');
const { addReviewValidator } = require('../../../validators/reviewValidators');

router.post('/', requireAuth, requireKycVerified, addReviewValidator, validate, reviewController.add);

module.exports = router;
