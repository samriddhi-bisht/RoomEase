const { body } = require('express-validator');

const submitKycValidator = [
  body('docType').isIn(['aadhaar', 'college_id', 'passport', 'driving_license']).withMessage('Invalid document type'),
  body('docNumber').optional({ checkFalsy: true }).trim(),
];

const reviewKycValidator = [
  body('decision').isIn(['verified', 'rejected']).withMessage('Decision must be verified or rejected'),
  body('rejectionReason').optional({ checkFalsy: true }).trim(),
];

module.exports = { submitKycValidator, reviewKycValidator };
