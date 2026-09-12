import axios from 'axios';

// Express 5's default ("simple") query parser turns repeated plain keys
// (?propertyType=pg&propertyType=flat) into an array, but does NOT unwrap
// bracket notation (?propertyType[]=pg) the way qs would — so array params
// must be serialized as repeated plain keys, not axios's default `key[]=`.
function serializeParams(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((v) => v !== undefined && v !== null && v !== '' && search.append(key, v));
    } else {
      search.append(key, value);
    }
  });
  return search.toString();
}

// The auth token lives in an httpOnly cookie set by the Express API, so every
// request needs withCredentials for the browser to send/accept it even
// though the frontend and API run on two different localhost ports.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
  paramsSerializer: serializeParams,
});

export function extractErrorMessage(err) {
  return err?.response?.data?.error || err?.message || 'Something went wrong. Please try again.';
}

export default api;
