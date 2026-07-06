// Supabase Auth — drop-in replacements for the Cognito/Amplify call shapes
// the app already uses, so UserAWSProvider + signup screens swap cleanly.

import { supabase, currentUserId } from './client';

export type LegacyAuthUser = { userId: string; username: string };

const toLegacyJwt = (accessToken: string, user: { id: string; email?: string | null }) =>
  ({
    payload: { sub: user.id, email: user.email ?? '' },
    toString: () => accessToken,
  }) as any;

export async function sbSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return {
    user: { userId: data.user.id, username: data.user.email ?? email },
    jwt: toLegacyJwt(data.session.access_token, data.user),
    signInOutput: { isSignedIn: true, nextStep: { signInStep: 'DONE' } } as any,
  };
}

export async function sbSignUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // With email confirmation disabled a session comes back immediately.
  return {
    isComplete: !!data.session,
    needsConfirmation: !data.session,
  };
}

// Verify the signup email-confirmation code (6-digit OTP). On success
// Supabase returns a live session — no separate sign-in needed.
export async function sbConfirmSignUp(email: string, code: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'signup',
  });
  if (error) throw error;
  return { isSignUpComplete: true, session: data.session };
}

export async function sbResendSignUpCode(email: string) {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
  return true;
}

export async function sbCurrentSession() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  const u = data.session.user;
  return {
    user: { userId: u.id, username: u.email ?? '' } as LegacyAuthUser,
    jwt: toLegacyJwt(data.session.access_token, u),
    authSession: {
      tokens: {
        accessToken: toLegacyJwt(data.session.access_token, u),
        idToken: toLegacyJwt(data.session.access_token, u),
      },
    } as any,
  };
}

export async function sbSignOut() {
  await supabase.auth.signOut();
}

export async function sbForgotPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return { isPasswordReset: true } as any;
}

// Verify the emailed 6-digit recovery code, then set the new password.
export async function sbConfirmPasswordReset(
  email: string,
  code: string,
  newPassword: string,
) {
  const { error: otpError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'recovery',
  });
  if (otpError) throw otpError;
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return true;
}

export async function sbUpdatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return true;
}

export async function sbUpdateEmail(newEmail: string) {
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw error;
  return true;
}

// REAL account deletion via the delete-account edge function (service role;
// identity from the caller's JWT — nobody can delete anyone else). Falls back
// to deactivate+signout if the function is unreachable so the user is never
// stuck with a live account they asked to remove.
//
// MUST be called while the session is still alive — do NOT sign out first:
// currentUserId() reads the cached session and functions.invoke needs the JWT.
// (Review 2026-07-06: the old flow signed out in deleteUserDB() before this
// ran, so the edge function was silently skipped and the auth user survived.)
//
// Returns true only when the auth user was REALLY deleted; false when we could
// only deactivate the profile — callers must surface that, not stay silent.
export async function sbDeactivateAndSignOut(): Promise<boolean> {
  const me = await currentUserId();
  let deleted = false;
  if (me) {
    try {
      const { error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
      });
      if (error) throw error;
      deleted = true;
    } catch (e) {
      if (__DEV__) console.warn('delete-account failed, deactivating', e);
      await supabase.from('profiles').update({ active: false }).eq('id', me);
    }
  }
  // Auth user gone (or profile deactivated) — clear the local session either way.
  await supabase.auth.signOut();
  return deleted;
}
