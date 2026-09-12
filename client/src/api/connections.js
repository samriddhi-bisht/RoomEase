import api from './client';

export const sendConnectionRequest = (receiverId) => api.post('/connections', { receiverId }).then((r) => r.data);
export const respondToConnection = (id, decision) =>
  api.patch(`/connections/${id}/respond`, { decision }).then((r) => r.data);
export const listConnections = () => api.get('/connections').then((r) => r.data);
