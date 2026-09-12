import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Label, Input, FieldError } from '../components/ui/Field';
import Button from '../components/ui/Button';
import { extractErrorMessage } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(location.state?.from || '/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-ink-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-ink-200 bg-white p-8 shadow-sm">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-display text-xl font-extrabold text-ink-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Home size={18} strokeWidth={2.5} />
          </span>
          RoomEase
        </Link>
        <h1 className="text-center font-display text-xl font-bold text-ink-900">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-ink-500">Log in to manage listings, roommates and connections.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input
                id="email"
                type="email"
                required
                className="pl-10"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input
                id="password"
                type="password"
                required
                className="pl-10"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <FieldError>{error}</FieldError>
          <Button type="submit" className="w-full" loading={loading}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          New to RoomEase?{' '}
          <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-800">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
