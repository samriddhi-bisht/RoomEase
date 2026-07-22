const connectionService = require('../services/connectionService');
const asyncHandler = require('../middleware/asyncHandler');

const send = asyncHandler(async (req, res) => {
  const connection = await connectionService.sendRequest(req.user.id, req.body.receiverId);
  res.status(201).json({ connection });
});

const respond = asyncHandler(async (req, res) => {
  const connection = await connectionService.respondToRequest(req.params.id, req.user.id, req.body.decision);
  res.json({ connection });
});

const list = asyncHandler(async (req, res) => {
  const connections = await connectionService.listConnections(req.user.id);
  res.json({ connections });
});

module.exports = { send, respond, list };
