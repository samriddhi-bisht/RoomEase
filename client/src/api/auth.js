import api from './client';

export const signup = (payload) => api.post('/auth/signup', payload).then((r) => r.data.user);
export const login = (payload) => api.post('/auth/login', payload).then((r) => r.data.user);
export const logout = () => api.post('/auth/logout').then((r) => r.data);
export const fetchMe = () => api.get('/auth/me').then((r) => r.data.user);
