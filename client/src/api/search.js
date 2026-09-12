import api from './client';

export const searchListings = (params) => api.get('/search', { params }).then((r) => r.data.listings);
export const fetchFilterOptions = () => api.get('/search/filters').then((r) => r.data);
