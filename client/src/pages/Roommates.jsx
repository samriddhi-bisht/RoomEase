import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Users, Wallet, UserPlus, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { browseRoommates, saveRoommateProfile, getMyRoommateProfile } from '../api/roommates';
import { sendConnectionRequest } from '../api/connections';
import { fetchFilterOptions } from '../api/search';
import { Label, Input, Select, Textarea, FieldError } from '../components/ui/Field';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { formatINR } from '../utils/format';
import { extractErrorMessage } from '../api/client';
import { Link } from 'react-router-dom';

function BrowseTab() {
  const [colleges, setColleges] = useState([]);
  const [collegeId, setCollegeId] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilterOptions().then((d) => setColleges(d.colleges || []));
  }, []);

  const load = () => {
    setLoading(true);
    browseRoommates({ collegeId, maxBudget })
      .then(setProfiles)
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [collegeId, maxBudget]);

  const handleConnect = async (userId) => {
    try {
      await sendConnectionRequest(userId);
      toast.success('Connection request sent!');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3">
        <Select value={collegeId} onChange={(e) => setCollegeId(e.target.value)} className="w-56">
          <option value="">Any college</option>
          {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Input type="number" placeholder="Max budget" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} className="w-40" />
      </div>

      {loading ? (
        <Spinner />
      ) : profiles.length === 0 ? (
        <EmptyState icon={Users} title="No roommate profiles found" description="Try widening your filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {profiles.map((p) => (
            <div key={p.id} className="rounded-xl border border-ink-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-display font-bold text-ink-900">{p.user_name}</p>
                {p.college_name && <Badge tone="brand">{p.college_name}</Badge>}
              </div>
              {(p.budget_min || p.budget_max) && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
                  <Wallet size={14} /> {formatINR(p.budget_min)} – {formatINR(p.budget_max)}
                </p>
              )}
              {p.habits && <p className="mt-1 text-sm text-ink-500">{p.habits}</p>}
              {p.bio && <p className="mt-2 text-sm text-ink-600">{p.bio}</p>}
              <Button size="sm" className="mt-3 w-full" onClick={() => handleConnect(p.user_id)}>
                <UserPlus size={14} /> Connect
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileTab() {
  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState({ collegeId: '', budgetMin: '', budgetMax: '', habits: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFilterOptions().then((d) => setColleges(d.colleges || []));
    getMyRoommateProfile()
      .then((p) => {
        if (p) {
          setForm({
            collegeId: p.college_id || '', budgetMin: p.budget_min || '',
            budgetMax: p.budget_max || '', habits: p.habits || '', bio: p.bio || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await saveRoommateProfile(form);
      toast.success('Profile saved!');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-xl border border-ink-200 bg-white p-5">
      <div>
        <Label htmlFor="collegeId">College</Label>
        <Select id="collegeId" value={form.collegeId} onChange={(e) => setForm({ ...form, collegeId: e.target.value })}>
          <option value="">Select your college</option>
          {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budgetMin">Min budget (₹)</Label>
          <Input id="budgetMin" type="number" min="0" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="budgetMax">Max budget (₹)</Label>
          <Input id="budgetMax" type="number" min="0" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} />
        </div>
      </div>
      <div>
        <Label htmlFor="habits">Habits</Label>
        <Input id="habits" value={form.habits} onChange={(e) => setForm({ ...form, habits: e.target.value })} placeholder="Early riser, non-smoker…" />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell potential roommates about yourself…" />
      </div>
      <FieldError>{error}</FieldError>
      <Button type="submit" loading={saving}>Save profile</Button>
    </form>
  );
}

export default function Roommates() {
  const { user } = useAuth();
  const [tab, setTab] = useState('browse');

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Users size={36} className="mx-auto text-ink-300" />
        <h1 className="mt-3 font-display text-xl font-bold text-ink-900">Log in to find your roomies</h1>
        <Button as={Link} to="/login" className="mt-5">Log in</Button>
      </div>
    );
  }

  if (user.role !== 'student') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShieldAlert size={36} className="mx-auto text-ink-300" />
        <p className="mt-3 font-semibold text-ink-700">Roommate matching is available for student accounts only.</p>
      </div>
    );
  }

  if (user.kyc_status !== 'verified') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShieldAlert size={36} className="mx-auto text-amber-500" />
        <h1 className="mt-3 font-display text-xl font-bold text-ink-900">Verify your KYC first</h1>
        <p className="mt-2 text-sm text-ink-500">Roommate matching requires a verified account for everyone's safety.</p>
        <Button as={Link} to="/kyc" className="mt-5">Complete KYC</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-extrabold text-ink-900">Find Your Roomies</h1>
      <p className="mt-1 text-sm text-ink-500">Match with students near your college who share your budget.</p>

      <div className="mt-5 flex gap-1 rounded-lg bg-ink-100 p-1 w-fit">
        {[{ id: 'browse', label: 'Browse' }, { id: 'profile', label: 'My Profile' }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${tab === t.id ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'browse' ? <BrowseTab /> : <ProfileTab />}
      </div>
    </div>
  );
}
