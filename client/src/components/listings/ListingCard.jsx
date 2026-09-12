import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import Badge from '../ui/Badge';
import Rating from '../ui/Rating';
import { resolveImage, formatINR, PROPERTY_TYPE_LABELS, GENDER_LABELS } from '../../utils/format';

export default function ListingCard({ listing, layout = 'grid' }) {
  const isRow = layout === 'row';
  return (
    <Link
      to={`/listings/${listing.id}`}
      className={`group flex overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink-900/5 ${
        isRow ? 'flex-row' : 'flex-col'
      }`}
    >
      <div className={`relative overflow-hidden bg-ink-100 ${isRow ? 'w-48 shrink-0 sm:w-64' : 'aspect-[4/3] w-full'}`}>
        <img
          src={resolveImage(listing.cover_image)}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge tone="brand">{PROPERTY_TYPE_LABELS[listing.property_type] || 'PG'}</Badge>
        </div>
        {listing.gender_preference && listing.gender_preference !== 'any' && (
          <div className="absolute right-3 top-3">
            <Badge tone="accent">{GENDER_LABELS[listing.gender_preference]}</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-ink-900">
            {listing.title}
          </h3>
        </div>

        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-ink-500">
          <MapPin size={13} className="shrink-0" />
          <span className="truncate">{listing.city ? `${listing.city} · ` : ''}{listing.address}</span>
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
          <Rating value={listing.avg_rating} showCount={false} />
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="font-display text-lg font-extrabold text-ink-900">
              {formatINR(listing.rent)}<span className="text-xs font-medium text-ink-400">/mo</span>
            </p>
          </div>
          <span className="rounded-lg bg-ink-50 px-2.5 py-1 text-xs font-semibold text-ink-500 group-hover:bg-brand-50 group-hover:text-brand-700">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}
