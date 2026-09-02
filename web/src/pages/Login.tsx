import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="grid min-h-screen place-items-center bg-seamist px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg ring-1 ring-deepwater/5"
      >
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 grid h-16 w-16 place-items-center rounded-full bg-deepwater">
            <img src="/logo.png" alt="Laurie’s Love" className="h-12 w-12 object-contain" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-deepwater">Laurie’s Love</h1>
          <hr className="gilt-rule my-3 w-24" />
          <p className="text-sm text-deepwater/60">So no warrior ever walks alone.</p>
        </div>
        <label className="mb-1 block text-sm font-medium text-deepwater">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 w-full rounded-lg border border-deepwater/15 px-3 py-2 outline-none focus:border-lagoon focus:ring-1 focus:ring-lagoon"
        />
        <label className="mb-1 block text-sm font-medium text-deepwater">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-4 w-full rounded-lg border border-deepwater/15 px-3 py-2 outline-none focus:border-lagoon focus:ring-1 focus:ring-lagoon"
        />
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-deepwater py-2.5 font-semibold text-seamist transition-colors hover:bg-lagoon disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="mt-4 text-center text-sm text-deepwater/50">
          New here?{' '}
          <Link to="/signup" className="font-medium text-lagoon hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
