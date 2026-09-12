import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Mail, Lock, User, Phone, GraduationCap, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Label, Input, FieldError } from '../components/ui/Field';
import Button from '../components/ui/Button';
import { extractErrorMessage } from '../api/client';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created!');
      navigate('/dashboard');
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
        <h1 className="text-center font-display text-xl font-bold text-ink-900">Create your account</h1>
        <p className="mt-1 text-center text-sm text-ink-500">Join as a student looking for a room, or an owner listing one.</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {[
            { value: 'student', label: 'I’m a Student', icon: GraduationCap },
            { value: 'owner', label: 'I’m an Owner', icon: Building2 },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm({ ...form, role: value })}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                form.role === value
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-ink-200 text-ink-500 hover:border-brand-200'
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input id="name" required className="pl-10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Priya Sharma" />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input id="email" type="email" required className="pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <div className="relative">
              <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input id="phone" className="pl-10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98XXXXXXXX" />
            </div>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input id="password" type="password" required minLength={8} className="pl-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
            </div>
          </div>
          <FieldError>{error}</FieldError>
          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-800">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
