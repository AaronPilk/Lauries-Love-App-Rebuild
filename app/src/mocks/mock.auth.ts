// Fake Cognito session objects for mock mode.
// Any email/password signs in as the mock current user.

import { MOCK_CURRENT_USER } from './mock.data';

export const MOCK_AUTH_USER = {
  userId: MOCK_CURRENT_USER.cognitoId,
  username: MOCK_CURRENT_USER.email,
} as any;

// Shape-compatible with aws-amplify JWT: has payload + toString().
export const MOCK_JWT = {
  payload: {
    sub: MOCK_CURRENT_USER.cognitoId,
    email: MOCK_CURRENT_USER.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    iat: Math.floor(Date.now() / 1000),
  },
  toString: () => 'mock-jwt-token',
} as any;

export const MOCK_AUTH_SESSION = {
  tokens: {
    accessToken: MOCK_JWT,
    idToken: MOCK_JWT,
  },
} as any;

export const MOCK_SIGN_IN_OUTPUT = {
  isSignedIn: true,
  nextStep: { signInStep: 'DONE' },
} as any;

// Session-lifetime flag: start signed OUT so the login screen is testable;
// flips true after a mock sign-in, so checkCurrentUserAWS restores the session.
export let mockSignedIn = false;
export const setMockSignedIn = (v: boolean) => {
  mockSignedIn = v;
};
