const roommateService = require('../services/roommateService');
const asyncHandler = require('../middleware/asyncHandler');

const saveProfile = asyncHandler(async (req, res) => {
  const profile = await roommateService.saveProfile(req.user.id, req.body);
  res.status(200).json({ profile });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await roommateService.getProfile(req.user.id);
  res.json({ profile });
});

const browse = asyncHandler(async (req, res) => {
  const profiles = await roommateService.browseProfiles(req.user.id, req.query);
  res.json({ profiles });
});

module.exports = { saveProfile, getMyProfile, browse };
