import { Star } from 'lucide-react';

export default function Rating({ value, count, size = 14, showCount = true }) {
  if (!value) {
    return <span className="text-xs font-medium text-ink-400">No reviews yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700">
      <Star size={size} className="fill-amber-400 text-amber-400" />
      {Number(value).toFixed(1)}
      {showCount && count ? <span className="font-normal text-ink-400">({count})</span> : null}
    </span>
  );
}
