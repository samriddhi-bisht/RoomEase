const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/kyc', require('./kyc'));
router.use('/search', require('./search'));
router.use('/roommates', require('./roommates'));
router.use('/connections', require('./connections'));
router.use('/admin', require('./admin'));
// Mounted before the general /listings router so a path like
// /listings/5/reviews is matched here (more specific) rather than being
// swallowed by /listings/:id there.
router.use('/listings/:listingId/reviews', require('./reviews'));
router.use('/listings', require('./listings'));

module.exports = router;
