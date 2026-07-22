const kycService = require('../services/kycService');
const kycModel = require('../models/kycModel');
const userModel = require('../models/userModel');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const submit = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('A document file is required.', 400);
  }
  const { docType, docNumber } = req.body;
  const relativePath = `/uploads/kyc/${req.file.filename}`;
  const currentUser = await userModel.findById(req.user.id);

  const { doc, flags } = await kycService.submitDocument({
    userId: req.user.id,
    profileName: currentUser.name,
    docType,
    docNumber,
    filePath: relativePath,
    mimetype: req.file.mimetype,
  });

  res.status(201).json({ document: doc, flags });
});

const myDocuments = asyncHandler(async (req, res) => {
  const docs = await kycModel.findByUserId(req.user.id);
  res.json({ documents: docs });
});

const pendingDocuments = asyncHandler(async (req, res) => {
  const docs = await kycModel.findPending();
  res.json({ documents: docs });
});

const review = asyncHandler(async (req, res) => {
  const { decision, rejectionReason } = req.body;
  const updated = await kycService.reviewDocument({
    docId: req.params.id,
    adminId: req.user.id,
    decision,
    rejectionReason,
  });
  res.json({ document: updated });
});

module.exports = { submit, myDocuments, pendingDocuments, review };
