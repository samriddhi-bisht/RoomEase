import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck, ShieldX, Home as HomeIcon, FileCheck } from 'lucide-react';
import { allListingsAdmin, moderateListing } from '../api/admin';
import { pendingKycDocuments, reviewKyc } from '../api/kyc';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { formatINR, timeAgo, resolveImage } from '../utils/format';
import { extractErrorMessage } from '../api/client';

function KycTab() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    pendingKycDocuments().then(setDocs).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleReview = async (id, decision) => {
    const rejectionReason = decision === 'rejected' ? prompt('Reason for rejection:') || '' : undefined;
    try {
      await reviewKyc(id, { decision, rejectionReason });
      toast.success(`Document ${decision}`);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (loading) return <Spinner />;
  if (docs.length === 0) return <EmptyState icon={FileCheck} title="No pending KYC documents" description="All caught up!" />;

  return (
    <div className="space-y-3">
      {docs.map((d) => (
        <div key={d.id} className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 sm:flex-row sm:items-center">
          <a href={resolveImage(d.file_path)} target="_blank" rel="noreferrer" className="shrink-0">
            <img src={resolveImage(d.file_path)} alt="document" className="h-20 w-28 rounded-lg border border-ink-100 object-cover" />
          </a>
          <div className="flex-1">
            <p className="font-semibold text-ink-800">{d.doc_type.replace('_', ' ')} · User #{d.user_id}</p>
            <p className="text-xs text-ink-400">Submitted {timeAgo(d.created_at)}</p>
            {d.ocr_extracted_name && <p className="mt-1 text-xs text-ink-500">OCR name: {d.ocr_extracted_name}</p>}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleReview(d.id, 'verified')}><ShieldCheck size={14} /> Verify</Button>
            <Button size="sm" variant="danger" onClick={() => handleReview(d.id, 'rejected')}><ShieldX size={14} /> Reject</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListingsTab() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    allListingsAdmin().then(setListings).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleModerate = async (id, status) => {
    try {
      await moderateListing(id, status);
      toast.success(`Listing ${status}`);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (loading) return <Spinner />;
  if (listings.length === 0) return <EmptyState icon={HomeIcon} title="No listings yet" />;

  return (
    <div className="space-y-3">
      {listings.map((l) => (
        <div key={l.id} className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-ink-800">{l.title}</p>
              <Badge tone={l.status === 'active' ? 'green' : 'gray'}>{l.status}</Badge>
            </div>
            <p className="mt-0.5 text-sm text-ink-500">{formatINR(l.rent)}/mo · {l.owner_name} ({l.owner_email})</p>
          </div>
          <div className="flex gap-2">
            {l.status === 'active' ? (
              <Button size="sm" variant="danger" onClick={() => handleModerate(l.id, 'inactive')}>Deactivate</Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => handleModerate(l.id, 'active')}>Activate</Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('kyc');

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-extrabold text-ink-900">Admin Panel</h1>
      <p className="mt-1 text-sm text-ink-500">Review KYC submissions and moderate listings.</p>

      <div className="mt-5 flex w-fit gap-1 rounded-lg bg-ink-100 p-1">
        {[{ id: 'kyc', label: 'KYC Review' }, { id: 'listings', label: 'Listings' }].map((t) => (
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
        {tab === 'kyc' ? <KycTab /> : <ListingsTab />}
      </div>
    </div>
  );
}
