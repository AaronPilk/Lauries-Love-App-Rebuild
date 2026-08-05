import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Feed } from './pages/Feed';
import { Groups } from './pages/Groups';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminFeatures } from './pages/admin/Features';
import { AdminMembers } from './pages/admin/Members';
import { AdminModeration } from './pages/admin/Moderation';
import { AdminSupportInbox } from './pages/admin/SupportInbox';

export default function App() {
  const { loading } = useAuth();
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center text-brand-700">
        Loading…
      </div>
    );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Member web app */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Feed />} />
        <Route path="groups" element={<Groups />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
        {/* Fast-follow: /map, /donate */}
      </Route>

      {/* Admin console (staff only) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireStaff>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="support" element={<AdminSupportInbox />} />
        <Route path="moderation" element={<AdminModeration />} />
        <Route path="features" element={<AdminFeatures />} />
        {/* Fast-follow: groups mgmt, branding/settings, custom profile fields */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
