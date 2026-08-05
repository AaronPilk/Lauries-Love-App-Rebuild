import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';

const nav = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/features', label: 'Feature Toggles', end: false },
  // Fast-follow: Members, Support Inbox, Moderation Queue, Groups, Settings
];

export function AdminLayout() {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen bg-brand-50">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <aside className="w-56 shrink-0">
          <Link to="/" className="mb-4 block text-lg font-bold text-brand-700">
            Laurie’s Love
          </Link>
          <div className="mb-2 text-xs uppercase tracking-wide text-gray-400">
            Admin Console
          </div>
          <nav className="space-y-1">
            {nav.map((n) => {
              const active = n.end
                ? pathname === n.to
                : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`block rounded-lg px-3 py-2 text-sm ${
                    active
                      ? 'bg-brand-700 text-white'
                      : 'text-gray-700 hover:bg-brand-100'
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => signOut()}
            className="mt-6 text-sm text-gray-500 hover:underline"
          >
            Sign out
          </button>
        </aside>
        <section className="flex-1 rounded-2xl bg-white p-6 shadow-sm">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
