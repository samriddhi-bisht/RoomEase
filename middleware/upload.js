const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

function makeStorage(subfolder) {
  return multer.diskStorage({
    destination: path.join(__dirname, '..', 'public', 'uploads', subfolder),
    filename: (req, file, cb) => {
      // Never trust the original filename — collisions, path traversal, and
      // duplicate names are all possible. Generate our own.
      const unique = crypto.randomBytes(8).toString('hex');
      cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
    },
  });
}

const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
};

const kycDocFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
    return cb(new Error('KYC document must be an image or PDF'));
  }
  cb(null, true);
};

const uploadKycDoc = multer({
  storage: makeStorage('kyc'),
  fileFilter: kycDocFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadListingImages = multer({
  storage: makeStorage('listings'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { uploadKycDoc, uploadListingImages };
