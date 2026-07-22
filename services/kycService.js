const kycModel = require('../models/kycModel');
const userModel = require('../models/userModel');
const ocrService = require('./ocrService');
const { similarityRatio } = require('../utils/stringSimilarity');
const AppError = require('../utils/AppError');

const DOC_NUMBER_PATTERNS = {
  aadhaar: /^\d{12}$/,
  passport: /^[A-Z][0-9]{7}$/i,
  driving_license: /^[A-Z]{2}[0-9]{13}$/i,
  college_id: /^.{3,30}$/, // no standard format nationally — just sanity-check length
};

const TOKEN_MATCH_THRESHOLD = 0.8; // how close two individual words must be to count as "the same word"
const NAME_MATCH_THRESHOLD = 0.6; // fraction of the profile name's words that must be found

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// OCR output is noisy (misread characters, extra whitespace, line breaks),
// so we can't just check text.includes(name). Instead: split the profile
// name into words, and for each word check whether *any* word in the OCR
// text is a close fuzzy match. If most of the name's words show up
// somewhere, we count it as a match.
function nameAppearsInText(profileName, text) {
  const nameTokens = normalize(profileName).split(' ').filter(Boolean);
  const textTokens = normalize(text).split(' ').filter(Boolean);
  if (nameTokens.length === 0 || textTokens.length === 0) return false;

  const matchedCount = nameTokens.filter((nameToken) =>
    textTokens.some((textToken) => similarityRatio(nameToken, textToken) >= TOKEN_MATCH_THRESHOLD)
  ).length;

  return matchedCount / nameTokens.length >= NAME_MATCH_THRESHOLD;
}

async function submitDocument({ userId, profileName, docType, docNumber, filePath, mimetype }) {
  const flags = [];
  let ocrRawText = null;
  let ocrName = null;
  let ocrDob = null;

  if (mimetype.startsWith('image/')) {
    try {
      ocrRawText = await ocrService.extractText(filePath);
      ocrDob = ocrService.extractDob(ocrRawText);

      const nameMatches = nameAppearsInText(profileName, ocrRawText);
      ocrName = nameMatches ? profileName : null;
      if (!nameMatches) flags.push('Name on document does not clearly match the account name');
      if (!ocrDob) flags.push('Could not detect a date of birth on the document');
    } catch (err) {
      flags.push('OCR could not read the document image — needs manual review');
    }
  } else {
    // Tesseract.js only reads images; a PDF upload skips straight to
    // manual review rather than silently pretending to have checked it.
    flags.push('PDF upload — OCR skipped, needs manual review');
  }

  const pattern = DOC_NUMBER_PATTERNS[docType];
  const numberIsMalformed = Boolean(docNumber) && Boolean(pattern) && !pattern.test(docNumber.replace(/\s/g, ''));
  if (numberIsMalformed) flags.push(`Document number format looks invalid for ${docType}`);

  // Automation only ever narrows this down to "needs a human" (pending) or
  // an outright reject on a clearly malformed number. It never
  // auto-verifies — a human admin always makes the final "verified" call.
  const status = numberIsMalformed ? 'rejected' : 'pending';

  const doc = await kycModel.createDocument({
    userId, docType, docNumber, filePath, ocrName, ocrDob, ocrRawText, status,
  });

  return { doc, flags };
}

async function reviewDocument({ docId, adminId, decision, rejectionReason }) {
  const doc = await kycModel.findById(docId);
  if (!doc) {
    throw new AppError('KYC document not found.', 404);
  }

  const updated = await kycModel.updateStatus(docId, {
    status: decision,
    verifiedBy: adminId,
    rejectionReason,
  });

  // Denormalized on purpose: users.kyc_status mirrors the latest decision
  // so every other query (the KYC gate, listing/connection checks) can read
  // one column instead of joining kyc_documents and picking the latest row.
  await userModel.updateKycStatus(doc.user_id, decision);

  return updated;
}

module.exports = { submitDocument, reviewDocument, nameAppearsInText };
