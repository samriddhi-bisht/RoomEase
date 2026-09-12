import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, ShieldCheck, Users, Sparkles, Building2, Home as HomeIcon,
  Hotel, DoorOpen, ArrowRight, BadgeCheck, Wallet, MessageCircle,
} from 'lucide-react';
import ListingCard from '../components/listings/ListingCard';
import ListingCardSkeleton from '../components/listings/ListingCardSkeleton';
import Button from '../components/ui/Button';
import { searchListings, fetchFilterOptions } from '../api/search';

const CATEGORIES = [
  { value: 'pg', label: 'PG', icon: Building2 },
  { value: 'flat', label: 'Flats', icon: HomeIcon },
  { value: 'hostel', label: 'Hostels', icon: Hotel },
  { value: 'studio', label: 'Studios', icon: Sparkles },
  { value: 'room', label: 'Single Rooms', icon: DoorOpen },
];

const STEPS = [
  { icon: Search, title: 'Search & filter', desc: 'Filter by city, college, budget and property type — just like shopping online.' },
  { icon: MessageCircle, title: 'Connect with owners', desc: 'Message verified owners directly and ask every question before you commit.' },
  { icon: BadgeCheck, title: 'Move in with confidence', desc: 'KYC-verified users and real reviews mean fewer surprises on move-in day.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [cities, setCities] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilterOptions().then((d) => setCities(d.cities || [])).catch(() => {});
    searchListings({ sort: 'rating' })
      .then((data) => setFeatured(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (propertyType) params.append('propertyType', propertyType);
    if (maxBudget) params.set('maxBudget', maxBudget);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100">
              <ShieldCheck size={14} /> KYC-verified owners &amp; students
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
              Find Your Space, <span className="text-brand-600">Find Your Roomies</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-ink-500 sm:text-lg">
              Search verified PGs, flats, hostels and studios near your college — filter by location,
              budget and amenities, just like shopping for anything else.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-9 flex max-w-3xl flex-col gap-2 rounded-2xl border border-ink-200 bg-white p-2.5 shadow-xl shadow-ink-900/5 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <MapPin size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                list="home-city-options"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City or area — e.g. Delhi"
                className="w-full rounded-xl bg-transparent py-3 pl-10 pr-3 text-sm outline-none placeholder:text-ink-400"
              />
              <datalist id="home-city-options">
                {cities.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="h-px w-full bg-ink-100 sm:h-8 sm:w-px" />
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="rounded-xl bg-transparent px-3 py-3 text-sm text-ink-700 outline-none sm:w-40"
            >
              <option value="">Any type</option>
              <option value="pg">PG</option>
              <option value="flat">Flat</option>
              <option value="hostel">Hostel</option>
              <option value="studio">Studio</option>
              <option value="room">Single Room</option>
            </select>
            <div className="h-px w-full bg-ink-100 sm:h-8 sm:w-px" />
            <div className="relative sm:w-40">
              <Wallet size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="number"
                min="0"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="Max budget"
                className="w-full rounded-xl bg-transparent py-3 pl-8 pr-3 text-sm outline-none placeholder:text-ink-400"
              />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Search size={17} /> Search
            </Button>
          </form>

          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map(({ value, label, icon: Icon }) => (
              <Link
                key={value}
                to={`/search?propertyType=${value}`}
                className="flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3.5 py-2 text-sm font-semibold text-ink-600 shadow-sm transition hover:border-brand-300 hover:text-brand-700"
              >
                <Icon size={15} /> {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-ink-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { value: '500+', label: 'Verified listings' },
            { value: '3', label: 'Cities covered' },
            { value: '1,200+', label: 'Students matched' },
            { value: '4.6★', label: 'Average rating' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-2xl font-extrabold text-ink-900">{s.value}</p>
              <p className="mt-0.5 text-xs font-medium text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-ink-900">Top-rated places</h2>
            <p className="mt-1 text-sm text-ink-500">Loved by students who found their home through RoomEase.</p>
          </div>
          <Link to="/search" className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800 sm:flex">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)
            : featured.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>

        <div className="mt-8 flex justify-center sm:hidden">
          <Button as={Link} to="/search" variant="secondary">View all listings</Button>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">How RoomEase works</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-ink-300">
              Three steps between you and a place that actually fits your budget and your college commute.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <span className="absolute -top-3 -left-1 font-display text-6xl font-black text-white/5">{i + 1}</span>
                <div className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
                  <Icon size={20} />
                </div>
                <h3 className="relative font-display text-base font-bold">{title}</h3>
                <p className="relative mt-1.5 text-sm text-ink-300">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Owner CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-center text-white sm:flex-row sm:text-left sm:p-12">
          <div>
            <h2 className="font-display text-2xl font-extrabold">Have a property to rent out?</h2>
            <p className="mt-2 max-w-md text-sm text-brand-100">
              List your PG, flat or hostel and reach thousands of verified students actively searching near your area.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button as={Link} to="/signup" variant="accent" size="lg">
              List your property
            </Button>
          </div>
        </div>
      </section>

      {/* Roommate CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-ink-200 bg-white p-8 text-center sm:flex-row sm:text-left sm:p-12">
          <div className="flex items-center gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 sm:flex">
              <Users size={22} />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-ink-900">Looking for a roommate instead?</h2>
              <p className="mt-1 text-sm text-ink-500">Match with students near your college who share your budget and habits.</p>
            </div>
          </div>
          <Button as={Link} to="/roommates" variant="secondary" size="lg" className="shrink-0">
            Find roommates
          </Button>
        </div>
      </section>
    </div>
  );
}
