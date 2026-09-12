import api from './client';

export const submitKyc = (formData) =>
  api.post('/kyc', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
export const myKycDocuments = () => api.get('/kyc/me').then((r) => r.data.documents);
export const pendingKycDocuments = () => api.get('/kyc/pending').then((r) => r.data.documents);
export const reviewKyc = (id, payload) => api.patch(`/kyc/${id}/review`, payload).then((r) => r.data.document);
