import { Link } from 'react-router-dom';
import { Home, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold text-ink-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Home size={16} strokeWidth={2.5} />
              </span>
              RoomEase
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-500">
              Verified PGs, flats and hostels for students — searched, filtered and booked in minutes.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-ink-800">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li><Link to="/search" className="hover:text-brand-700">Browse listings</Link></li>
              <li><Link to="/roommates" className="hover:text-brand-700">Find roommates</Link></li>
              <li><Link to="/search?propertyType=pg" className="hover:text-brand-700">PGs near college</Link></li>
              <li><Link to="/search?propertyType=flat" className="hover:text-brand-700">Flats to share</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-ink-800">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li><Link to="/signup" className="hover:text-brand-700">Create account</Link></li>
              <li><Link to="/login" className="hover:text-brand-700">Log in</Link></li>
              <li><Link to="/dashboard/listings/new" className="hover:text-brand-700">List your property</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-ink-800">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li className="flex items-center gap-2"><Mail size={14} /> support@roomease.app</li>
              <li className="flex items-center gap-2"><MapPin size={14} /> Delhi · Bangalore · Pune</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ink-100 pt-6 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} RoomEase. Built for students, by students.</p>
          <p>Made with care for a safer house-hunt.</p>
        </div>
      </div>
    </footer>
  );
}
