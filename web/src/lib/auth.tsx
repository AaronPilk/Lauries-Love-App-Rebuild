import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Staff source of truth is Jeremy's support_staff table: role = owner | agent.
// 'owner' is admin-level; any row = staff.
type StaffRole = 'owner' | 'agent';

type AuthState = {
  session: Session | null;
  loading: boolean;
  roles: StaffRole[];
  isStaff: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({} as AuthState);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load staff roles once signed in, from support_staff (the shared staff
  // table). No rows = regular member.
  useEffect(() => {
    if (!session?.user?.id) {
      setRoles([]);
      return;
    }
    supabase
      .from('support_staff')
      .select('role')
      .eq('profile_id', session.user.id)
      .then(({ data, error }) => {
        if (error) {
          setRoles([]);
          return;
        }
        setRoles((data ?? []).map((r: { role: StaffRole }) => r.role));
      });
  }, [session?.user?.id]);

  const value: AuthState = {
    session,
    loading,
    roles,
    isStaff: roles.length > 0,
    isAdmin: roles.includes('owner'),
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    async signOut() {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
