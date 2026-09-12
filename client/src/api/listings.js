import api from './client';

export const getListing = (id) => api.get(`/listings/${id}`).then((r) => r.data);
export const myListings = () => api.get('/listings/mine').then((r) => r.data.listings);
export const createListing = (formData) =>
  api.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.listing);
export const deactivateListing = (id) => api.patch(`/listings/${id}/deactivate`).then((r) => r.data.listing);
export const activateListing = (id) => api.patch(`/listings/${id}/activate`).then((r) => r.data.listing);
export const deleteListing = (id) => api.delete(`/listings/${id}`);
export const addReview = (listingId, payload) =>
  api.post(`/listings/${listingId}/reviews`, payload).then((r) => r.data);
