import api from './client';

export const allListingsAdmin = () => api.get('/admin/listings').then((r) => r.data.listings);
export const moderateListing = (id, status) =>
  api.patch(`/admin/listings/${id}/moderate`, { status }).then((r) => r.data.listing);
