const roommateModel = require('../models/roommateModel');

async function saveProfile(userId, body) {
  return roommateModel.upsert(userId, {
    collegeId: body.collegeId ? Number(body.collegeId) : null,
    budgetMin: body.budgetMin ? Number(body.budgetMin) : null,
    budgetMax: body.budgetMax ? Number(body.budgetMax) : null,
    habits: body.habits,
    bio: body.bio,
  });
}

async function getProfile(userId) {
  return roommateModel.findByUserId(userId);
}

async function browseProfiles(currentUserId, query) {
  return roommateModel.search({
    excludeUserId: currentUserId,
    collegeId: query.collegeId ? Number(query.collegeId) : null,
    maxBudget: query.maxBudget ? Number(query.maxBudget) : null,
  });
}

module.exports = { saveProfile, getProfile, browseProfiles };
