import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <Compass size={40} className="text-ink-300" />
      <h1 className="mt-4 font-display text-3xl font-extrabold text-ink-900">Page not found</h1>
      <p className="mt-2 text-sm text-ink-500">The page you're looking for doesn't exist or has moved.</p>
      <Button as={Link} to="/" className="mt-6">Back to home</Button>
    </div>
  );
}
