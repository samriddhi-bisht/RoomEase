const collegeModel = require('../models/collegeModel');
const amenityModel = require('../models/amenityModel');
const asyncHandler = require('../middleware/asyncHandler');

// Pages here only render the shell + any data needed to draw filter forms
// (colleges, amenities). Everything else — listings, profiles, KYC status —
// loads client-side via jQuery AJAX against the JSON API. One data-fetching
// pattern everywhere, instead of mixing server-rendered data with AJAX data.
const home = asyncHandler(async (req, res) => {
  const colleges = await collegeModel.findAll();
  res.render('pages/home', { user: req.user, colleges: colleges.slice(0, 8) });
});

const searchPage = asyncHandler(async (req, res) => {
  const [colleges, amenities] = await Promise.all([collegeModel.findAll(), amenityModel.findAll()]);
  res.render('pages/search', { user: req.user, colleges, amenities });
});

const listingDetailPage = (req, res) => {
  res.render('pages/listing-detail', { user: req.user, listingId: req.params.id });
};

const newListingPage = asyncHandler(async (req, res) => {
  const [colleges, amenities] = await Promise.all([collegeModel.findAll(), amenityModel.findAll()]);
  res.render('pages/listing-new', { user: req.user, colleges, amenities });
});

const loginPage = (req, res) => {
  res.render('pages/login', { user: req.user });
};

const signupPage = (req, res) => {
  res.render('pages/signup', { user: req.user });
};

const dashboardPage = (req, res) => {
  res.render('pages/dashboard', { user: req.user });
};

const kycPage = (req, res) => {
  res.render('pages/kyc', { user: req.user });
};

const roommatesPage = asyncHandler(async (req, res) => {
  const colleges = await collegeModel.findAll();
  res.render('pages/roommates', { user: req.user, colleges });
});

const adminPage = (req, res) => {
  res.render('pages/admin', { user: req.user });
};

module.exports = {
  home, searchPage, listingDetailPage, newListingPage, loginPage,
  signupPage, dashboardPage, kycPage, roommatesPage, adminPage,
};
