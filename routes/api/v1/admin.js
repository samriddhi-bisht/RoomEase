const express = require('express');
const router = express.Router();
const adminController = require('../../../controllers/adminController');
const { requireAuth } = require('../../../middleware/auth');
const requireRole = require('../../../middleware/role');
const validate = require('../../../middleware/validate');
const { moderateListingValidator } = require('../../../validators/adminValidators');

// Every route below requires an authenticated admin — applied once here
// with router.use() instead of repeating requireAuth/requireRole on each line.
router.use(requireAuth, requireRole('admin'));

router.get('/listings', adminController.listAllListings);
router.patch('/listings/:id/moderate', moderateListingValidator, validate, adminController.moderateListing);

module.exports = router;
