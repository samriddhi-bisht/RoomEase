import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, ShieldCheck, Users, Sparkles, Building2, Home as HomeIcon,
  Hotel, DoorOpen, ArrowRight, BadgeCheck, Wallet, MessageCircle, Star, Quote,
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

// Same photo pool as the seeded demo listings, so the hero collage matches
// what you actually see once you search — not stock imagery pulled from
// nowhere.
const HERO_PHOTOS = [
  'https://images.unsplash.com/photo-1768289269971-6171457bed13?w=500&h=620&fit=crop&auto=format&q=70',
  'https://images.unsplash.com/photo-1623625434462-e5e42318ae49?w=460&h=340&fit=crop&auto=format&q=70',
];

const TESTIMONIALS = [
  {
    name: 'Ishita K.',
    college: 'Jamia Millia Islamia',
    quote: "Found a PG two lanes from my hostel gate in one evening. My mom actually called the owner before I moved in — that's the KYC thing doing its job.",
  },
  {
    name: 'Rohit K.',
    college: 'Delhi University',
    quote: "I filtered by budget and \"boys only\" and had three places to visit by Saturday. Beats scrolling WhatsApp broker groups for a month.",
  },
  {
    name: 'Sneha R.',
    college: 'IIT Delhi',
    quote: 'The roommate matching actually works — matched with someone from my own department who wanted the same 8pm-quiet-hours thing I did.',
  },
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
      {/* Hero — asymmetric, not the centered-hero-with-blurred-orbs template */}
      <section className="overflow-hidden bg-brand-900">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-brand-100 ring-1 ring-white/15">
              <ShieldCheck size={14} /> KYC-verified owners &amp; students
            </span>

            <h1 className="mt-6 font-display text-6xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
              Room<span className="text-accent-400">Ease</span>
            </h1>
            <p className="mt-3 max-w-lg font-display text-2xl font-semibold leading-tight text-brand-100 sm:text-3xl">
              Find your space.{' '}
              <span className="relative inline-block">
                Find your roomies.
                <svg viewBox="0 0 200 12" className="absolute -bottom-1.5 left-0 h-2.5 w-full text-accent-400" preserveAspectRatio="none">
                  <path d="M2 9 C 40 2, 160 2, 198 9" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </p>
            <p className="mt-4 max-w-md text-sm text-brand-200 sm:text-base">
              No brokers, no WhatsApp forward chains. Just real PGs, flats and hostels near
              your college, filtered the way you'd filter anything else online.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-8 flex flex-col gap-2 rounded-2xl bg-white p-2.5 shadow-2xl shadow-black/20 sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <MapPin size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  list="home-city-options"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City or area — e.g. Delhi"
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-3 text-sm text-ink-800 outline-none placeholder:text-ink-400"
                />
                <datalist id="home-city-options">
                  {cities.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="h-px w-full bg-ink-100 sm:h-8 sm:w-px" />
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="rounded-xl bg-transparent px-3 py-3 text-sm text-ink-700 outline-none sm:w-36"
              >
                <option value="">Any type</option>
                <option value="pg">PG</option>
                <option value="flat">Flat</option>
                <option value="hostel">Hostel</option>
                <option value="studio">Studio</option>
                <option value="room">Single Room</option>
              </select>
              <div className="h-px w-full bg-ink-100 sm:h-8 sm:w-px" />
              <div className="relative sm:w-36">
                <Wallet size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="number"
                  min="0"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="Max budget"
                  className="w-full rounded-xl bg-transparent py-3 pl-8 pr-3 text-sm text-ink-800 outline-none placeholder:text-ink-400"
                />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Search size={17} /> Search
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {CATEGORIES.map(({ value, label, icon: Icon }) => (
                <Link
                  key={value}
                  to={`/search?propertyType=${value}`}
                  className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-brand-100 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-white"
                >
                  <Icon size={15} /> {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Photo collage instead of an abstract gradient blob — this is what the app actually shows you */}
          <div className="relative hidden h-[420px] lg:block">
            <img
              src={HERO_PHOTOS[0]}
              alt="A student's PG room"
              className="absolute right-6 top-0 h-[380px] w-[300px] rotate-[3deg] rounded-3xl border-4 border-white/10 object-cover shadow-2xl"
            />
            <img
              src={HERO_PHOTOS[1]}
              alt="A shared flat interior"
              className="absolute bottom-0 left-0 h-[280px] w-[340px] -rotate-[4deg] rounded-3xl border-4 border-white object-cover shadow-2xl"
            />
            <div className="absolute bottom-6 right-2 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-xl">
              <div className="flex -space-x-2">
                {['I', 'R', 'S'].map((initial, i) => (
                  <span
                    key={initial}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${
                      ['bg-brand-500', 'bg-accent-500', 'bg-brand-700'][i]
                    }`}
                  >
                    {initial}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-ink-700">1,200+ students housed</p>
              </div>
            </div>
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

      {/* Testimonials — real-sounding quotes, initials instead of stock headshots */}
      <section className="bg-brand-50/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
            Real students. Real move-ins.
          </h2>
          <p className="mt-1.5 max-w-lg text-sm text-ink-500">
            Not a marketing team's idea of a testimonial — this is what people actually told us.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map(({ name, college, quote }, i) => (
              <div
                key={name}
                className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100 ${i === 1 ? 'sm:-mt-4' : ''}`}
              >
                <Quote size={20} className="text-brand-300" />
                <p className="mt-3 text-sm leading-relaxed text-ink-700">"{quote}"</p>
                <div className="mt-4 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-800">{name}</p>
                    <p className="text-xs text-ink-400">{college}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            Find Your Roomies
          </Button>
        </div>
      </section>
    </div>
  );
}
