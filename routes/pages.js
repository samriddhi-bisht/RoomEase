const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { requireAuth } = require('../middleware/auth');
const requireRole = require('../middleware/role');

router.get('/', pageController.home);
router.get('/search', pageController.searchPage);
// Static path registered before the /:id dynamic route for the same
// reason as the API listings router — otherwise "new" would be parsed as an id.
router.get('/listings/new', requireAuth, requireRole('owner'), pageController.newListingPage);
router.get('/listings/:id', pageController.listingDetailPage);
router.get('/login', pageController.loginPage);
router.get('/signup', pageController.signupPage);
router.get('/dashboard', requireAuth, pageController.dashboardPage);
router.get('/kyc', requireAuth, pageController.kycPage);
router.get('/roommates', requireAuth, pageController.roommatesPage);
router.get('/admin', requireAuth, requireRole('admin'), pageController.adminPage);

module.exports = router;
