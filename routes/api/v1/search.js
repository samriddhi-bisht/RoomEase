const express = require('express');
const router = express.Router();
const searchController = require('../../../controllers/searchController');

router.get('/', searchController.search);
router.get('/filters', searchController.filterOptions);

module.exports = router;
