import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, LayoutGrid, Rows3, SearchIcon } from 'lucide-react';
import FilterSidebar from '../components/listings/FilterSidebar';
import ListingCard from '../components/listings/ListingCard';
import ListingCardSkeleton from '../components/listings/ListingCardSkeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { Select } from '../components/ui/Field';
import { searchListings, fetchFilterOptions } from '../api/search';
import { extractErrorMessage } from '../api/client';

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
];

function filtersFromParams(params) {
  return {
    q: params.get('q') || '',
    city: params.get('city') || '',
    collegeId: params.get('collegeId') || '',
    propertyType: params.getAll('propertyType'),
    amenityIds: params.getAll('amenityIds').map(Number),
    minBudget: params.get('minBudget') ? Number(params.get('minBudget')) : undefined,
    maxBudget: params.get('maxBudget') ? Number(params.get('maxBudget')) : undefined,
    genderPreference: params.get('genderPreference') || '',
    furnishing: params.get('furnishing') || '',
    sharingType: params.get('sharingType') || '',
    sort: params.get('sort') || 'newest',
  };
}

function paramsFromFilters(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }
  });
  return params;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);

  const [options, setOptions] = useState({});
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [layout, setLayout] = useState('grid');
  const [page, setPage] = useState(1);
  const [queryDraft, setQueryDraft] = useState(filters.q);

  useEffect(() => {
    fetchFilterOptions().then(setOptions).catch(() => {});
  }, []);

  useEffect(() => {
    setQueryDraft(filters.q);
  }, [filters.q]);

  useEffect(() => {
    setLoading(true);
    setError('');
    searchListings(filters)
      .then((data) => {
        setListings(data);
        setPage(1);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [filters]);

  const updateFilters = useCallback(
    (next) => setSearchParams(paramsFromFilters(next), { replace: true }),
    [setSearchParams]
  );

  const clearFilters = () => setSearchParams({});

  const submitQuery = (e) => {
    e.preventDefault();
    updateFilters({ ...filters, q: queryDraft });
  };

  const visible = listings.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < listings.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">Browse PGs, Flats &amp; Hostels</h1>
        <p className="mt-1 text-sm text-ink-500">Filter by location, budget and property type to find your perfect place.</p>
      </div>

      <form onSubmit={submitQuery} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={queryDraft}
            onChange={(e) => setQueryDraft(e.target.value)}
            placeholder="Search by area, landmark or listing name…"
            className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-10 pr-3 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          />
        </div>
        <Button type="submit" className="hidden sm:inline-flex">Search</Button>
        <Button
          type="button"
          variant="secondary"
          className="lg:hidden"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal size={16} /> Filters
        </Button>
      </form>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterSidebar
              filters={filters}
              options={options}
              onChange={updateFilters}
              onClear={clearFilters}
              resultCount={listings.length}
            />
          </div>
        </aside>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink-900/40" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-ink-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="rounded-lg p-1.5 hover:bg-ink-200">
                  <X size={20} />
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                options={options}
                onChange={updateFilters}
                onClear={clearFilters}
                resultCount={listings.length}
              />
              <Button className="mt-4 w-full" onClick={() => setMobileFiltersOpen(false)}>
                Show {listings.length} results
              </Button>
            </div>
          </div>
        )}

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink-500">
              {loading ? 'Searching…' : `${listings.length} result${listings.length === 1 ? '' : 's'}`}
            </p>
            <div className="flex items-center gap-2">
              <Select
                value={filters.sort}
                onChange={(e) => updateFilters({ ...filters, sort: e.target.value })}
                className="w-44"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
              <div className="hidden items-center gap-1 rounded-lg border border-ink-200 bg-white p-1 sm:flex">
                <button
                  onClick={() => setLayout('grid')}
                  className={`rounded-md p-1.5 ${layout === 'grid' ? 'bg-brand-600 text-white' : 'text-ink-400 hover:text-ink-700'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setLayout('row')}
                  className={`rounded-md p-1.5 ${layout === 'row' ? 'bg-brand-600 text-white' : 'text-ink-400 hover:text-ink-700'}`}
                  aria-label="List view"
                >
                  <Rows3 size={16} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className={layout === 'grid' ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-4'}>
              {Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)}
            </div>
          ) : listings.length === 0 ? (
            <EmptyState
              icon={SearchIcon}
              title="No places match those filters"
              description="Try widening your budget range or clearing a few filters to see more results."
              action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
            />
          ) : (
            <>
              <div className={layout === 'grid' ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-4'}>
                {visible.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} layout={layout} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
                    Load more listings
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
