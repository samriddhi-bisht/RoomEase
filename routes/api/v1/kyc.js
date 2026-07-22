const express = require('express');
const router = express.Router();
const kycController = require('../../../controllers/kycController');
const { requireAuth } = require('../../../middleware/auth');
const requireRole = require('../../../middleware/role');
const validate = require('../../../middleware/validate');
const { uploadKycDoc } = require('../../../middleware/upload');
const { submitKycValidator, reviewKycValidator } = require('../../../validators/kycValidators');

router.post('/', requireAuth, uploadKycDoc.single('document'), submitKycValidator, validate, kycController.submit);
router.get('/me', requireAuth, kycController.myDocuments);
router.get('/pending', requireAuth, requireRole('admin'), kycController.pendingDocuments);
router.patch('/:id/review', requireAuth, requireRole('admin'), reviewKycValidator, validate, kycController.review);

module.exports = router;
