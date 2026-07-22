const connectionModel = require('../models/connectionModel');
const AppError = require('../utils/AppError');

async function sendRequest(requesterId, receiverId) {
  if (requesterId === receiverId) {
    throw new AppError('You cannot connect with yourself.', 400);
  }
  const existing = await connectionModel.findBetween(requesterId, receiverId);
  if (existing) {
    throw new AppError('A connection already exists between you and this user.', 409);
  }
  return connectionModel.create(requesterId, receiverId);
}

async function respondToRequest(connectionId, receiverId, decision) {
  const updated = await connectionModel.updateStatus(connectionId, decision, receiverId);
  if (!updated) {
    throw new AppError('Connection request not found or you are not the recipient.', 404);
  }
  return updated;
}

async function listConnections(userId) {
  return connectionModel.findForUser(userId);
}

module.exports = { sendRequest, respondToRequest, listConnections };
