import api from './client';

export const saveRoommateProfile = (payload) => api.put('/roommates/profile', payload).then((r) => r.data.profile);
export const getMyRoommateProfile = () => api.get('/roommates/profile/me').then((r) => r.data.profile);
export const browseRoommates = (params) => api.get('/roommates/browse', { params }).then((r) => r.data.profiles);
