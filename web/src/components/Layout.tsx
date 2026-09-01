import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useBranding } from '../lib/branding';

export function Layout() {
  const { isStaff, signOut } = useAuth();
  const { appName, logoUrl } = useBranding();
  return (
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-10 flex items-center justify-between bg-brand-700 px-6 py-3 text-white"
        style={{ backgroundColor: 'var(--brand-primary, #6d1b5f)' }}
      >
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          {logoUrl && (
            <img src={logoUrl} alt="" className="h-8 w-8 rounded object-cover" />
          )}
          {appName}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:underline">
            Community
          </Link>
          <Link to="/groups" className="hover:underline">
            Groups
          </Link>
          <Link to="/messages" className="hover:underline">
            Messages
          </Link>
          <Link to="/map" className="hover:underline">
            Map
          </Link>
          <Link to="/donate" className="hover:underline">
            Donate
          </Link>
          <Link to="/notifications" className="hover:underline">
            Notifications
          </Link>
          <Link to="/support" className="hover:underline">
            Support
          </Link>
          <Link to="/profile" className="hover:underline">
            Profile
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
