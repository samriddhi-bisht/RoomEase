const express = require('express');
const router = express.Router();
const listingController = require('../../../controllers/listingController');
const { requireAuth } = require('../../../middleware/auth');
const requireRole = require('../../../middleware/role');
const requireKycVerified = require('../../../middleware/kycGate');
const validate = require('../../../middleware/validate');
const { uploadListingImages } = require('../../../middleware/upload');
const { createListingValidator } = require('../../../validators/listingValidators');

// Middleware chain reads left to right as the actual authorization story:
// must be logged in -> must be an owner -> must be KYC-verified -> input
// must be well-formed -> only then does the controller run.
router.post(
  '/',
  requireAuth,
  requireRole('owner'),
  requireKycVerified,
  uploadListingImages.array('images', 8),
  createListingValidator,
  validate,
  listingController.create
);

// Static path registered before the /:id dynamic route, otherwise Express
// would try to treat "mine" as an :id value.
router.get('/mine', requireAuth, requireRole('owner'), listingController.myListings);
router.get('/:id', listingController.getOne);
router.patch('/:id/deactivate', requireAuth, requireRole('owner'), listingController.deactivate);
router.patch('/:id/activate', requireAuth, requireRole('owner'), listingController.activate);
router.delete('/:id', requireAuth, requireRole('owner'), listingController.remove);

module.exports = router;
