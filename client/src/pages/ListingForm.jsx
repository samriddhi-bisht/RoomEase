import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ImagePlus, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchFilterOptions } from '../api/search';
import { createListing } from '../api/listings';
import { Label, Input, Select, Textarea, FieldError } from '../components/ui/Field';
import Button from '../components/ui/Button';
import { extractErrorMessage } from '../api/client';
import { Link } from 'react-router-dom';

const EMPTY_FORM = {
  title: '', description: '', rent: '', deposit: '', address: '', city: '',
  propertyType: 'pg', furnishing: 'unfurnished', sharingType: 'any', genderPreference: 'any',
  amenityIds: [], collegeIds: [],
};

export default function ListingForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [options, setOptions] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFilterOptions().then(setOptions).catch(() => {});
  }, []);

  if (user && user.kyc_status !== 'verified') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShieldAlert size={36} className="mx-auto text-amber-500" />
        <h1 className="mt-3 font-display text-xl font-bold text-ink-900">Verify your KYC first</h1>
        <p className="mt-2 text-sm text-ink-500">
          To keep students safe, only KYC-verified owners can publish listings.
        </p>
        <Button as={Link} to="/kyc" className="mt-5">Complete KYC</Button>
      </div>
    );
  }

  const toggleId = (key, id) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(id) ? f[key].filter((v) => v !== id) : [...f[key], id],
    }));
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 8);
    setFiles(selected);
  };

  const removeFile = (idx) => setFiles((f) => f.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (files.length === 0) {
      setError('Please add at least one photo of the property.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => fd.append(`${key}`, v));
        } else {
          fd.append(key, value);
        }
      });
      files.forEach((f) => fd.append('images', f));

      const listing = await createListing(fd);
      toast.success('Listing published!');
      navigate(`/listings/${listing.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-extrabold text-ink-900">List a new property</h1>
      <p className="mt-1 text-sm text-ink-500">Fill in the details students care about most: location, price and what's included.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-ink-200 bg-white p-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sunny Single Room near North Campus" />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the space, house rules, meals, etc." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rent">Monthly rent (₹)</Label>
            <Input id="rent" type="number" min="1" required value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="deposit">Security deposit (₹)</Label>
            <Input id="deposit" type="number" min="0" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Delhi" />
          </div>
          <div>
            <Label htmlFor="address">Full address / area</Label>
            <Input id="address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Kamla Nagar" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="propertyType">Property type</Label>
            <Select id="propertyType" value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })}>
              {(options.propertyTypes || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="furnishing">Furnishing</Label>
            <Select id="furnishing" value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })}>
              {(options.furnishingTypes || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="sharingType">Sharing type</Label>
            <Select id="sharingType" value={form.sharingType} onChange={(e) => setForm({ ...form, sharingType: e.target.value })}>
              {(options.sharingTypes || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="genderPreference">Preferred for</Label>
          <Select id="genderPreference" value={form.genderPreference} onChange={(e) => setForm({ ...form, genderPreference: e.target.value })}>
            <option value="any">Any gender</option>
            <option value="male">Boys only</option>
            <option value="female">Girls only</option>
          </Select>
        </div>

        {options.amenities?.length > 0 && (
          <div>
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {options.amenities.map((a) => (
                <label key={a.id} className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm">
                  <input type="checkbox" checked={form.amenityIds.includes(a.id)} onChange={() => toggleId('amenityIds', a.id)} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
                  {a.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {options.colleges?.length > 0 && (
          <div>
            <Label>Nearby colleges</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {options.colleges.map((c) => (
                <label key={c.id} className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm">
                  <input type="checkbox" checked={form.collegeIds.includes(c.id)} onChange={() => toggleId('collegeIds', c.id)} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label>Photos</Label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink-200 py-8 text-sm text-ink-400 hover:border-brand-300 hover:text-brand-600">
            <ImagePlus size={22} />
            Click to upload up to 8 photos
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          </label>
          {files.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(f)} alt="" className="aspect-square w-full rounded-lg object-cover" />
                  <button type="button" onClick={() => removeFile(i)} className="absolute -right-1.5 -top-1.5 rounded-full bg-ink-900 p-0.5 text-white">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <FieldError>{error}</FieldError>

        <Button type="submit" className="w-full" loading={submitting}>Publish listing</Button>
      </form>
    </div>
  );
}
