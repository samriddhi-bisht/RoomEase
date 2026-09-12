import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus, Home as HomeIcon, Eye, EyeOff, Trash2, ShieldCheck, ShieldAlert, ShieldX, Clock,
  Users, UserCircle2, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { myListings, deactivateListing, activateListing, deleteListing } from '../api/listings';
import { listConnections, respondToConnection } from '../api/connections';
import { getMyRoommateProfile } from '../api/roommates';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { resolveImage, formatINR } from '../utils/format';
import { extractErrorMessage } from '../api/client';

const KYC_TONE = { verified: 'green', pending: 'amber', rejected: 'red', not_submitted: 'gray' };
const KYC_ICON = { verified: ShieldCheck, pending: Clock, rejected: ShieldX, not_submitted: ShieldAlert };
const KYC_LABEL = {
  verified: 'Verified', pending: 'Pending review', rejected: 'Rejected', not_submitted: 'Not submitted',
};
// Explicit literal class names (not template-interpolated) so Tailwind's
// build-time class scanner can actually find and generate them.
const KYC_ICON_WRAP_CLASS = {
  verified: 'bg-emerald-50', pending: 'bg-amber-50', rejected: 'bg-red-50', not_submitted: 'bg-ink-100',
};
const KYC_ICON_COLOR_CLASS = {
  verified: 'text-emerald-600', pending: 'text-amber-600', rejected: 'text-red-600', not_submitted: 'text-ink-500',
};

function OwnerDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    myListings().then(setListings).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleToggle = async (listing) => {
    try {
      if (listing.status === 'active') {
        await deactivateListing(listing.id);
        toast.success('Listing deactivated');
      } else {
        await activateListing(listing.id);
        toast.success('Listing activated');
      }
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDelete = async (listing) => {
    if (!confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;
    try {
      await deleteListing(listing.id);
      toast.success('Listing deleted');
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink-900">My Listings</h2>
        <Button as={Link} to="/dashboard/listings/new" size="sm">
          <Plus size={16} /> New listing
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={HomeIcon}
          title="You haven't listed anything yet"
          description="Create your first listing to start reaching verified students."
          action={<Button as={Link} to="/dashboard/listings/new"><Plus size={16} /> Create listing</Button>}
        />
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 sm:flex-row sm:items-center">
              <img src={resolveImage(l.images?.[0])} alt={l.title} className="h-24 w-full rounded-lg object-cover sm:h-16 sm:w-24" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link to={`/listings/${l.id}`} className="font-semibold text-ink-800 hover:text-brand-700">{l.title}</Link>
                  <Badge tone={l.status === 'active' ? 'green' : 'gray'}>{l.status}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-ink-500">{formatINR(l.rent)}/mo · {l.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleToggle(l)}>
                  {l.status === 'active' ? <><EyeOff size={14} /> Deactivate</> : <><Eye size={14} /> Activate</>}
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(l)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentDashboard() {
  const [connections, setConnections] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const load = () => {
    setLoading(true);
    Promise.all([listConnections(), getMyRoommateProfile().catch(() => null)])
      .then(([conns, prof]) => {
        setConnections(conns.connections || []);
        setProfile(prof);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRespond = async (id, decision) => {
    try {
      await respondToConnection(id, decision);
      toast.success(`Request ${decision}`);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (loading) return <Spinner />;

  const kycStatus = user?.kyc_status || 'not_submitted';
  const KycIcon = KYC_ICON[kycStatus];
  const pendingIncoming = connections.filter((c) => c.status === 'pending' && c.receiver_id === user.id);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-ink-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${KYC_ICON_WRAP_CLASS[kycStatus]}`}>
              <KycIcon size={20} className={KYC_ICON_COLOR_CLASS[kycStatus]} />
            </div>
            <div>
              <p className="font-semibold text-ink-800">KYC Status</p>
              <Badge tone={KYC_TONE[kycStatus]}>{KYC_LABEL[kycStatus]}</Badge>
            </div>
          </div>
          {kycStatus !== 'verified' && (
            <Button as={Link} to="/kyc" size="sm" variant="secondary">
              {kycStatus === 'not_submitted' ? 'Submit KYC' : 'View status'}
            </Button>
          )}
        </div>
        {kycStatus !== 'verified' && (
          <p className="mt-3 text-xs text-ink-500">Verified KYC is required to message roommates, leave reviews and send connection requests.</p>
        )}
      </div>

      <div className="rounded-xl border border-ink-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <UserCircle2 size={20} />
            </div>
            <div>
              <p className="font-semibold text-ink-800">Roommate Profile</p>
              <p className="text-xs text-ink-500">{profile ? 'Your profile is live' : 'Not created yet'}</p>
            </div>
          </div>
          <Button as={Link} to="/roommates" size="sm" variant="secondary">
            {profile ? 'Edit profile' : 'Create profile'} <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-ink-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Users size={18} className="text-ink-500" />
          <p className="font-semibold text-ink-800">Connection Requests</p>
        </div>
        {pendingIncoming.length === 0 ? (
          <p className="text-sm text-ink-400">No pending requests right now.</p>
        ) : (
          <div className="space-y-2">
            {pendingIncoming.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-ink-50 px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-ink-700">{c.requester_name}</p>
                  <p className="text-xs text-ink-400">{c.requester_email}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleRespond(c.id, 'accepted')}>Accept</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleRespond(c.id, 'rejected')}>Decline</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {connections.filter((c) => c.status === 'accepted').length > 0 && (
          <div className="mt-4 border-t border-ink-100 pt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Connected</p>
            <div className="space-y-1.5">
              {connections.filter((c) => c.status === 'accepted').map((c) => {
                const other = c.requester_id === user.id
                  ? { name: c.receiver_name, email: c.receiver_email }
                  : { name: c.requester_name, email: c.requester_email };
                return (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-700">{other.name}</span>
                    <span className="text-xs text-ink-400">{other.email}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-extrabold text-ink-900">
        {user?.role === 'owner' ? 'Owner Dashboard' : 'My Dashboard'}
      </h1>
      <p className="mt-1 text-sm text-ink-500">Welcome back, {user?.name}.</p>

      <div className="mt-6">
        {user?.role === 'owner' ? <OwnerDashboard /> : <StudentDashboard />}
      </div>
    </div>
  );
}
