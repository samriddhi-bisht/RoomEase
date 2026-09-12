import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, Menu, X, LogOut, LayoutDashboard, Users, ShieldCheck, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const navLinkClass = ({ isActive }) =>
  `text-sm font-semibold transition-colors ${isActive ? 'text-brand-700' : 'text-ink-600 hover:text-brand-700'}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-ink-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Home size={18} strokeWidth={2.5} />
          </span>
          RoomEase
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/search" className={navLinkClass}>Browse Rooms</NavLink>
          <NavLink to="/roommates" className={navLinkClass}>Find Roommates</NavLink>
          {user?.role === 'owner' && <NavLink to="/dashboard/listings/new" className={navLinkClass}>List a Property</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-brand-700"
              >
                <LayoutDashboard size={16} /> {user.name?.split(' ')[0]}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-ink-600 hover:text-brand-700">
                Log in
              </Link>
              <Button as={Link} to="/signup" size="sm">
                Sign up
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-200 bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            <Link onClick={() => setOpen(false)} to="/search" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
              <Search size={16} /> Browse Rooms
            </Link>
            <Link onClick={() => setOpen(false)} to="/roommates" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
              <Users size={16} /> Find Roommates
            </Link>
            {user?.role === 'admin' && (
              <Link onClick={() => setOpen(false)} to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                <ShieldCheck size={16} /> Admin
              </Link>
            )}
            {user ? (
              <>
                <Link onClick={() => setOpen(false)} to="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Button as={Link} to="/login" variant="secondary" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                  Log in
                </Button>
                <Button as={Link} to="/signup" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
