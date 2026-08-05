import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function Layout() {
  const { isStaff, signOut } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-brand-700 px-6 py-3 text-white">
        <Link to="/" className="text-lg font-bold">
          Laurie’s Love
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:underline">
            Community
          </Link>
          {isStaff && (
            <Link to="/admin" className="rounded bg-white/15 px-3 py-1">
              Admin
            </Link>
          )}
          <button onClick={() => signOut()} className="hover:underline">
            Sign out
          </button>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
