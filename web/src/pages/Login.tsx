import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function Login() {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (session) navigate('/', { replace: true });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError((err as Error).message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-brand-50 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-1 text-2xl font-bold text-brand-700">Laurie’s Love</h1>
        <p className="mb-6 text-sm text-gray-500">
          Sign in to your community account.
        </p>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
        />
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
        />
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-brand-700 py-2 font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
