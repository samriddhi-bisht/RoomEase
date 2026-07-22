const express = require('express');
const router = express.Router();
const connectionController = require('../../../controllers/connectionController');
const { requireAuth } = require('../../../middleware/auth');
const requireRole = require('../../../middleware/role');
const requireKycVerified = require('../../../middleware/kycGate');
const validate = require('../../../middleware/validate');
const { sendRequestValidator, respondValidator } = require('../../../validators/connectionValidators');

// Sending a request is student-only and KYC-gated (per the spec: connection
// requests are blocked until a student's KYC is verified); responding to
// one is not, since you should always be able to reject an unwanted request.
router.post('/', requireAuth, requireRole('student'), requireKycVerified, sendRequestValidator, validate, connectionController.send);
router.patch('/:id/respond', requireAuth, respondValidator, validate, connectionController.respond);
router.get('/', requireAuth, connectionController.list);

module.exports = router;
