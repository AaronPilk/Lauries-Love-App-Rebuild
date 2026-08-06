import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from './supabase';

// Runtime branding. Loads the single branding_settings row (public read, so it
// works before sign-in too) and exposes app name / logo / colors. Colors are
// also pushed to CSS custom properties (--brand-primary / --brand-secondary)
// so any surface can theme off them. Falls back to Laurie's Love purple.
type Branding = {
  appName: string;
  tagline: string | null;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  supportEmail: string | null;
};

const DEFAULT_BRANDING: Branding = {
  appName: 'Laurie’s Love',
  tagline: 'Support cancer patients and their families',
  primaryColor: '#6d1b5f', // matches brand-700 (current header)
  secondaryColor: '#a5257e', // matches brand-500
  logoUrl: null,
  supportEmail: null,
};

const BrandingContext = createContext<Branding>(DEFAULT_BRANDING);
export const useBranding = () => useContext(BrandingContext);

function applyCssVars(b: Branding) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', b.primaryColor);
  root.style.setProperty('--brand-secondary', b.secondaryColor);
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);

  useEffect(() => {
    // Seed the CSS vars immediately with the defaults so first paint is themed.
    applyCssVars(DEFAULT_BRANDING);
    let active = true;
    supabase
      .from('branding_settings')
      .select('app_name, tagline, primary_color, secondary_color, logo_url, support_email')
      .maybeSingle()
      .then(({ data }) => {
        if (!active || !data) return;
        const row = data as {
          app_name: string | null;
          tagline: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          logo_url: string | null;
          support_email: string | null;
        };
        setBranding({
          appName: row.app_name?.trim() || DEFAULT_BRANDING.appName,
          tagline: row.tagline?.trim() || DEFAULT_BRANDING.tagline,
          primaryColor: row.primary_color?.trim() || DEFAULT_BRANDING.primaryColor,
          secondaryColor: row.secondary_color?.trim() || DEFAULT_BRANDING.secondaryColor,
          logoUrl: row.logo_url?.trim() || null,
          supportEmail: row.support_email?.trim() || null,
        });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    applyCssVars(branding);
    document.title = branding.appName;
  }, [branding]);

  return (
    <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>
  );
}
