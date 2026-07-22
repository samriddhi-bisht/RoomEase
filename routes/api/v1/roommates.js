const express = require('express');
const router = express.Router();
const roommateController = require('../../../controllers/roommateController');
const { requireAuth } = require('../../../middleware/auth');
const requireRole = require('../../../middleware/role');
const requireKycVerified = require('../../../middleware/kycGate');
const validate = require('../../../middleware/validate');
const { saveProfileValidator } = require('../../../validators/roommateValidators');

// Roommate matching is a student-only capability per the role table — an
// owner has no reason to have a roommate profile.
router.put('/profile', requireAuth, requireRole('student'), requireKycVerified, saveProfileValidator, validate, roommateController.saveProfile);
router.get('/profile/me', requireAuth, requireRole('student'), roommateController.getMyProfile);
router.get('/browse', requireAuth, requireRole('student'), requireKycVerified, roommateController.browse);

module.exports = router;
