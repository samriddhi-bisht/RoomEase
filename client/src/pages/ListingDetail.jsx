import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MapPin, Phone, GraduationCap, CheckCircle2, Star, ArrowLeft, ShieldAlert,
} from 'lucide-react';
import { getListing, addReview } from '../api/listings';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { Textarea } from '../components/ui/Field';
import { extractErrorMessage } from '../api/client';
import {
  resolveImage, formatINR, timeAgo,
  PROPERTY_TYPE_LABELS, FURNISHING_LABELS, SHARING_LABELS, GENDER_LABELS,
} from '../utils/format';

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={22} className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-ink-300'} />
        </button>
      ))}
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [error, setError] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getListing(id)
      .then((d) => {
        setData(d);
        setActiveImg(0);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addReview(id, reviewForm);
      toast.success('Review posted!');
      setReviewForm({ rating: 5, comment: '' });
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner className="py-32" />;

  if (error || !data?.listing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShieldAlert size={36} className="mx-auto text-ink-300" />
        <p className="mt-3 font-semibold text-ink-700">{error || 'Listing not found.'}</p>
        <Button as={Link} to="/search" variant="secondary" className="mt-5">Back to search</Button>
      </div>
    );
  }

  const { listing, reviews } = data;
  const images = listing.images?.length ? listing.images : [null];
  const canReview = user && user.role === 'student';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/search" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-700">
        <ArrowLeft size={15} /> Back to search
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Gallery */}
          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-100">
            <img src={resolveImage(images[activeImg])} alt={listing.title} className="aspect-[16/10] w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-thin">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${i === activeImg ? 'border-brand-600' : 'border-transparent'}`}
                >
                  <img src={resolveImage(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone="brand">{PROPERTY_TYPE_LABELS[listing.property_type] || 'PG'}</Badge>
            <Badge tone="gray">{FURNISHING_LABELS[listing.furnishing] || 'Unfurnished'}</Badge>
            <Badge tone="gray">{SHARING_LABELS[listing.sharing_type] || 'Flexible sharing'}</Badge>
            {listing.gender_preference !== 'any' && <Badge tone="accent">{GENDER_LABELS[listing.gender_preference]}</Badge>}
          </div>

          <h1 className="mt-3 font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">{listing.title}</h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
            <MapPin size={15} /> {listing.address}{listing.city ? `, ${listing.city}` : ''}
          </p>

          {listing.avg_rating && (
            <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ink-700">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              {Number(listing.avg_rating).toFixed(1)} <span className="font-normal text-ink-400">({reviews.length} review{reviews.length === 1 ? '' : 's'})</span>
            </div>
          )}

          {listing.description && (
            <div className="mt-6 border-t border-ink-100 pt-6">
              <h2 className="font-display text-lg font-bold text-ink-900">About this place</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">{listing.description}</p>
            </div>
          )}

          {listing.amenities?.length > 0 && (
            <div className="mt-6 border-t border-ink-100 pt-6">
              <h2 className="font-display text-lg font-bold text-ink-900">Amenities</h2>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {listing.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-ink-600">
                    <CheckCircle2 size={15} className="text-emerald-500" /> {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {listing.colleges?.length > 0 && (
            <div className="mt-6 border-t border-ink-100 pt-6">
              <h2 className="font-display text-lg font-bold text-ink-900">Nearby colleges</h2>
              <div className="mt-3 space-y-2">
                {listing.colleges.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg bg-ink-50 px-3.5 py-2.5 text-sm">
                    <span className="flex items-center gap-2 font-medium text-ink-700"><GraduationCap size={15} /> {c.name}</span>
                    {c.distance_km && <span className="text-ink-400">{c.distance_km} km</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-6 border-t border-ink-100 pt-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Reviews</h2>

            {canReview && (
              <form onSubmit={handleReviewSubmit} className="mt-4 rounded-xl border border-ink-200 bg-white p-4">
                <p className="mb-2 text-sm font-semibold text-ink-700">Leave a review</p>
                <StarPicker value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
                <Textarea
                  className="mt-3"
                  rows={3}
                  placeholder="Share your experience with this place…"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
                <Button type="submit" size="sm" className="mt-3" loading={submitting}>Post review</Button>
              </form>
            )}

            <div className="mt-4 space-y-4">
              {reviews.length === 0 && <p className="text-sm text-ink-400">No reviews yet — be the first to share your experience.</p>}
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-ink-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink-800">{r.user_name}</p>
                    <span className="text-xs text-ink-400">{timeAgo(r.created_at)}</span>
                  </div>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'} />
                    ))}
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-ink-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
            <p className="font-display text-3xl font-extrabold text-ink-900">
              {formatINR(listing.rent)}<span className="text-sm font-medium text-ink-400">/month</span>
            </p>
            <p className="mt-1 text-sm text-ink-500">Security deposit: {formatINR(listing.deposit)}</p>

            <div className="mt-5 border-t border-ink-100 pt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Listed by</p>
              <p className="mt-1.5 font-semibold text-ink-800">{listing.owner_name}</p>
              {listing.owner_phone && (
                <a
                  href={`tel:${listing.owner_phone}`}
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  <Phone size={15} /> {listing.owner_phone}
                </a>
              )}
              {!user && (
                <p className="mt-3 text-xs text-ink-400">
                  <Link to="/login" className="font-semibold text-brand-600">Log in</Link> to contact the owner and leave a review.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
