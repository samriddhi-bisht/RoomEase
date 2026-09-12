// A custom doorway/arch mark — deliberately not a generic "house" pictogram.
// Reads as "step through to your own space," which is what RoomEase actually
// does. Kept to two strokes and a dot so it still reads clearly at 16px.
function Mark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" className="fill-brand-600" />
      <path
        d="M10 24V15a6 6 0 0 1 12 0v9"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="20" r="1.15" className="fill-accent-400" />
    </svg>
  );
}

export default function Logo({ size = 36, showWordmark = true, wordmarkClassName = 'text-xl' }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark size={size} />
      {showWordmark && (
        <span className={`font-display font-extrabold tracking-tight text-ink-900 ${wordmarkClassName}`}>
          RoomEase
        </span>
      )}
    </span>
  );
}
