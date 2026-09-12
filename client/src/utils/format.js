const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1').replace(/\/api\/v1\/?$/, '');

// Uploaded listing/KYC images are stored as relative paths like
// "/uploads/listings/x.jpg" and served as static files by the Express app
// (not under /api/v1), while seeded demo listings use full Unsplash URLs —
// this makes both resolve correctly regardless of which API port they load from.
export function resolveImage(path) {
  if (!path) return '/placeholder-room.svg';
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}

export function formatINR(value) {
  if (value === null || value === undefined) return '—';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export const PROPERTY_TYPE_LABELS = {
  pg: 'PG',
  flat: 'Flat',
  hostel: 'Hostel',
  studio: 'Studio',
  room: 'Single Room',
};

export const FURNISHING_LABELS = {
  unfurnished: 'Unfurnished',
  semi_furnished: 'Semi-furnished',
  furnished: 'Furnished',
};

export const SHARING_LABELS = {
  single: 'Single',
  double: 'Double sharing',
  triple: 'Triple sharing',
  any: 'Flexible sharing',
};

export const GENDER_LABELS = {
  male: 'Boys only',
  female: 'Girls only',
  any: 'Any gender',
};

export function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${Math.floor(months / 12)} year(s) ago`;
}
