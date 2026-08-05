import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type StaffRole = 'admin' | 'moderator' | 'support';

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

  // Load staff roles once signed in. The staff_roles table ships in the
  // pending admin-foundation migration; until it's applied this returns
  // empty (no admin access) and the app still works as a member.
  useEffect(() => {
    if (!session?.user?.id) {
      setRoles([]);
      return;
    }
    supabase
      .from('staff_roles')
      .select('role')
      .eq('profile_id', session.user.id)
      .then(({ data, error }) => {
        if (error) {
          // table not present yet, or no rows — treat as a regular member
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
    isAdmin: roles.includes('admin'),
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
