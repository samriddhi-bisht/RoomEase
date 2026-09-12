import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UploadCloud, ShieldCheck, Clock, ShieldX } from 'lucide-react';
import { submitKyc, myKycDocuments } from '../api/kyc';
import { useAuth } from '../context/AuthContext';
import { Label, Select, Input, FieldError } from '../components/ui/Field';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { extractErrorMessage } from '../api/client';
import { timeAgo } from '../utils/format';

const DOC_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'college_id', label: 'College ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving_license', label: 'Driving License' },
];

const STATUS_TONE = { verified: 'green', pending: 'amber', rejected: 'red' };
const STATUS_ICON = { verified: ShieldCheck, pending: Clock, rejected: ShieldX };

export default function Kyc() {
  const { user, setUser } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ docType: 'aadhaar', docNumber: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    myKycDocuments().then(setDocs).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please attach a document file.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('docType', form.docType);
      fd.append('docNumber', form.docNumber);
      fd.append('document', file);
      await submitKyc(fd);
      toast.success('Document submitted for review!');
      setFile(null);
      setForm({ docType: 'aadhaar', docNumber: '' });
      setUser((u) => (u ? { ...u, kyc_status: 'pending' } : u));
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const latest = docs[0];

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-extrabold text-ink-900">KYC Verification</h1>
      <p className="mt-1 text-sm text-ink-500">Verified identity keeps every student and owner on RoomEase safe.</p>

      {user?.kyc_status === 'verified' ? (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <ShieldCheck size={24} className="text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-800">You're verified!</p>
            <p className="text-sm text-emerald-700">You have full access to listings, reviews and roommate matching.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-ink-200 bg-white p-5">
          <div>
            <Label htmlFor="docType">Document type</Label>
            <Select id="docType" value={form.docType} onChange={(e) => setForm({ ...form, docType: e.target.value })}>
              {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="docNumber">Document number (optional)</Label>
            <Input id="docNumber" value={form.docNumber} onChange={(e) => setForm({ ...form, docNumber: e.target.value })} />
          </div>
          <div>
            <Label>Upload document</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink-200 py-8 text-sm text-ink-400 hover:border-brand-300 hover:text-brand-600">
              <UploadCloud size={22} />
              {file ? file.name : 'Click to upload an image or PDF'}
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <FieldError>{error}</FieldError>
          <Button type="submit" className="w-full" loading={submitting}>Submit for review</Button>
        </form>
      )}

      <div className="mt-8">
        <h2 className="mb-3 font-display text-base font-bold text-ink-900">Submission history</h2>
        {loading ? (
          <Spinner />
        ) : docs.length === 0 ? (
          <p className="text-sm text-ink-400">No documents submitted yet.</p>
        ) : (
          <div className="space-y-2">
            {docs.map((d) => {
              const Icon = STATUS_ICON[d.status] || Clock;
              return (
                <div key={d.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className="text-ink-400" />
                    <div>
                      <p className="text-sm font-semibold text-ink-700">{DOC_TYPES.find((t) => t.value === d.doc_type)?.label || d.doc_type}</p>
                      <p className="text-xs text-ink-400">{timeAgo(d.created_at)}</p>
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[d.status] || 'gray'}>{d.status.replace('_', ' ')}</Badge>
                </div>
              );
            })}
            {latest?.status === 'rejected' && latest.rejection_reason && (
              <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                Rejection reason: {latest.rejection_reason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
