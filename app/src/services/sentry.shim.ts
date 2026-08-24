// Sentry integration seam.
//
// This module is the SINGLE import point for Sentry across the app (every call
// site imports from 'services/sentry.shim'), so the SDK can be swapped without
// touching call sites. It now delegates to the REAL @sentry/react-native, but
// stays inert until a DSN is configured:
//   * init() only calls Sentry.init when EXPO_PUBLIC_SENTRY_DSN is set, so a
//     keyless build never touches the native SDK.
//   * captureException/captureMessage are safe to call before init (they no-op
//     until the SDK is initialized).
//
// ⚠️ NATIVE STEP: after pulling this, run `yarn && npx pod-install` (or
// `pod install`) and rebuild — @sentry/react-native ships a native module.
// Set EXPO_PUBLIC_SENTRY_DSN in app/.env + EAS to turn reporting on.
import * as Sentry from '@sentry/react-native';

export const captureException = (error?: unknown): void => {
  Sentry.captureException(error);
};

export const captureMessage = (msg?: string): void => {
  if (typeof msg === 'string') Sentry.captureMessage(msg);
};

// Only initialize when a DSN is present — an empty/missing DSN leaves the SDK
// uninitialized (no native calls, no reporting) instead of erroring.
export const init = (settings?: { dsn?: string } & Record<string, unknown>): void => {
  if (!settings?.dsn) return;
  Sentry.init(settings as Sentry.ReactNativeOptions);
};

// Error-boundary wrapper for the root component (safe even before init).
export const wrap = <T>(component: T): T =>
  Sentry.wrap(component as never) as unknown as T;

export const mobileReplayIntegration = (
  opts?: Record<string, unknown>,
): unknown => Sentry.mobileReplayIntegration(opts as never);

export default {
  captureException,
  captureMessage,
  init,
  wrap,
  mobileReplayIntegration,
};
