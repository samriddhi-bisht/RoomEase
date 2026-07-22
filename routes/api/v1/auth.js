const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/authController');
const { requireAuth } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { signupValidator, loginValidator } = require('../../../validators/authValidators');

router.post('/signup', signupValidator, validate, authController.signup);
router.post('/login', loginValidator, validate, authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

module.exports = router;
