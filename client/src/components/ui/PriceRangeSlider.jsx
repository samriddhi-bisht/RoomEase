const MIN = 0;
const MAX = 30000;
const STEP = 500;

function formatINR(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export default function PriceRangeSlider({ min, max, onChange }) {
  const minVal = min ?? MIN;
  const maxVal = max ?? MAX;
  const minPct = ((minVal - MIN) / (MAX - MIN)) * 100;
  const maxPct = ((maxVal - MIN) / (MAX - MIN)) * 100;

  const handleMin = (e) => {
    const next = Math.min(Number(e.target.value), maxVal - STEP);
    onChange({ min: next, max: maxVal });
  };
  const handleMax = (e) => {
    const next = Math.max(Number(e.target.value), minVal + STEP);
    onChange({ min: minVal, max: next });
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-ink-800">
        <span>{formatINR(minVal)}</span>
        <span>{formatINR(maxVal)}{maxVal >= MAX ? '+' : ''}</span>
      </div>
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-ink-200" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-600"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={minVal}
          onChange={handleMin}
          className="range-slider"
          aria-label="Minimum rent"
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={maxVal}
          onChange={handleMax}
          className="range-slider"
          aria-label="Maximum rent"
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-400">
        <span>{formatINR(MIN)}</span>
        <span>{formatINR(MAX)}+</span>
      </div>
    </div>
  );
}
