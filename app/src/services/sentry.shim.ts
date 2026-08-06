// Sentry removed from the app (it was disabled anyway — no DSN wired — and its
// native pod broke the iOS build under Xcode 26: "Unable to resolve module
// dependency '_SentryPrivate'"). This no-op shim keeps every existing
// captureException()/init() call site compiling with zero behavior change.
// To re-add real error monitoring later: reinstall @sentry/react-native (a
// version compatible with the current Xcode), re-add the expo plugin, and point
// these imports back at the real @sentry/react-native. Or use PostHog for monitoring
// per the SOW.

export const captureException = (_error?: unknown): void => {};
export const captureMessage = (_msg?: string): void => {};
export const init = (_settings?: unknown): void => {};
export const wrap = <T>(component: T): T => component;
export const mobileReplayIntegration = (_opts?: unknown): Record<string, never> => ({});

export default {
  captureException,
  captureMessage,
  init,
  wrap,
  mobileReplayIntegration,
};
