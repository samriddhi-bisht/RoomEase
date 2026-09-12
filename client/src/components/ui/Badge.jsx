const TONES = {
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200',
  accent: 'bg-accent-400/10 text-accent-600 ring-1 ring-inset ring-accent-400/30',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  red: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  gray: 'bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200',
};

export default function Badge({ tone = 'gray', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
