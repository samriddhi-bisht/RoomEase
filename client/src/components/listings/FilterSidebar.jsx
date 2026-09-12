import { MapPin, GraduationCap, X } from 'lucide-react';
import PriceRangeSlider from '../ui/PriceRangeSlider';
import { Select } from '../ui/Field';

function Section({ title, children }) {
  return (
    <div className="border-b border-ink-100 py-5 first:pt-0 last:border-b-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-400">{title}</h3>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
        active
          ? 'border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-600/25'
          : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700'
      }`}
    >
      {children}
    </button>
  );
}

function CheckRow({ checked, onChange, label, count }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-sm text-ink-600 hover:bg-ink-50">
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
        />
        {label}
      </span>
      {count !== undefined && <span className="text-xs text-ink-400">{count}</span>}
    </label>
  );
}

export default function FilterSidebar({ filters, options, onChange, onClear, resultCount }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  const togglePropertyType = (value) => {
    const current = filters.propertyType || [];
    set({
      propertyType: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  const toggleAmenity = (id) => {
    const current = filters.amenityIds || [];
    set({ amenityIds: current.includes(id) ? current.filter((v) => v !== id) : [...current, id] });
  };

  const activeCount =
    (filters.propertyType?.length || 0) +
    (filters.amenityIds?.length || 0) +
    (filters.city ? 1 : 0) +
    (filters.collegeId ? 1 : 0) +
    (filters.genderPreference ? 1 : 0) +
    (filters.furnishing ? 1 : 0) +
    (filters.sharingType ? 1 : 0) +
    (filters.minBudget || filters.maxBudget ? 1 : 0);

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5">
      <div className="flex items-center justify-between pb-1">
        <h2 className="font-display text-base font-bold text-ink-900">Filters</h2>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
          >
            <X size={13} /> Clear all ({activeCount})
          </button>
        )}
      </div>
      {typeof resultCount === 'number' && (
        <p className="pb-2 text-xs text-ink-400">{resultCount} place{resultCount === 1 ? '' : 's'} found</p>
      )}

      <Section title="Location">
        <div className="relative mb-2.5">
          <MapPin size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            list="city-options"
            value={filters.city || ''}
            onChange={(e) => set({ city: e.target.value })}
            placeholder="Search city or area"
            className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          />
          <datalist id="city-options">
            {(options.cities || []).map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>
        <div className="relative">
          <GraduationCap size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Select
            value={filters.collegeId || ''}
            onChange={(e) => set({ collegeId: e.target.value })}
            className="pl-9"
          >
            <option value="">Near any college</option>
            {(options.colleges || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
      </Section>

      <Section title="Property Type">
        <div className="flex flex-wrap gap-2">
          {(options.propertyTypes || []).map((pt) => (
            <Chip key={pt.value} active={filters.propertyType?.includes(pt.value)} onClick={() => togglePropertyType(pt.value)}>
              {pt.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Monthly Budget">
        <PriceRangeSlider
          min={filters.minBudget}
          max={filters.maxBudget}
          onChange={({ min, max }) => set({ minBudget: min, maxBudget: max })}
        />
      </Section>

      <Section title="Sharing Type">
        <Select value={filters.sharingType || ''} onChange={(e) => set({ sharingType: e.target.value })}>
          <option value="">Any sharing type</option>
          {(options.sharingTypes || []).filter((s) => s.value !== 'any').map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
      </Section>

      <Section title="Furnishing">
        <Select value={filters.furnishing || ''} onChange={(e) => set({ furnishing: e.target.value })}>
          <option value="">Any furnishing</option>
          {(options.furnishingTypes || []).map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </Select>
      </Section>

      <Section title="Preferred For">
        <div className="flex flex-wrap gap-2">
          {[
            { value: '', label: 'Anyone' },
            { value: 'male', label: 'Boys' },
            { value: 'female', label: 'Girls' },
          ].map((g) => (
            <Chip key={g.value} active={(filters.genderPreference || '') === g.value} onClick={() => set({ genderPreference: g.value })}>
              {g.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Amenities">
        <div className="grid grid-cols-2 gap-x-2">
          {(options.amenities || []).map((a) => (
            <CheckRow
              key={a.id}
              label={a.name}
              checked={filters.amenityIds?.includes(a.id) || false}
              onChange={() => toggleAmenity(a.id)}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
