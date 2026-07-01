// Mock API router: answers every REST endpoint the app calls with fake data.
// Used by BOTH http paths (ApiProvider.api() and the axios factory client).

import {
  MOCK_CURRENT_USER,
  MOCK_DEFINITIONS,
  MOCK_USERS,
} from './mock.data';

const delay = (ms = 150) => new Promise(res => setTimeout(res, ms));

// Session-lifetime mutable state so create/update flows feel real.
let currentUser: Record<string, any> = { ...MOCK_CURRENT_USER };
const friendStatuses: Record<string, 'pending' | 'accepted'> = {};

const paginate = (data: any[]) => ({
  data,
  count: data.length,
  total: data.length,
  page: 1,
  pageCount: 1,
});

const allUsers = () => [currentUser, ...MOCK_USERS];

/**
 * Resolve a mock response for `url` (absolute or path-only) + axios-ish config.
 * Returns the response body. Throws for unknown routes so they're visible.
 */
export async function mockApi(
  url: string,
  config: { method?: string; data?: any } = {},
): Promise<any> {
  await delay();

  const method = (config.method || 'GET').toUpperCase();
  const path = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
  const query = url.includes('?') ? url.split('?')[1] : '';

  if (__DEV__) console.log(`🎭 mockApi: ${method} ${path}${query ? `?${query}` : ''}`);

  // --- value definitions -------------------------------------------------
  if (path === '/valueDefinitions/byTypeAndName') {
    const type = /type=([A-Z_]+)/.exec(query)?.[1] || '';
    return MOCK_DEFINITIONS[type] ?? [];
  }

  // --- users --------------------------------------------------------------
  if (path.startsWith('/users/getUserInfoByCognitoId/')) {
    return currentUser;
  }

  if (path === '/users/intercom/user-hash') {
    return null; // Intercom disabled in mock mode; provider catches this.
  }

  const friendReqMatch = /^\/users\/([^/]+)\/friend-requests$/.exec(path);
  if (friendReqMatch) {
    const friendId = friendReqMatch[1];
    if (method === 'GET') {
      const status = friendStatuses[friendId];
      return status ? [{ status }] : [];
    }
    if (method === 'POST') {
      friendStatuses[friendId] = 'pending';
      return {
        id: `mock-fr-${friendId}`,
        active: true,
        status: 'pending',
        sender: { id: currentUser.id },
      };
    }
    if (method === 'PUT') {
      friendStatuses[friendId] = 'accepted';
      return { status: 'accepted' };
    }
    if (method === 'DELETE') {
      delete friendStatuses[friendId];
      return { ok: true };
    }
  }

  if (path === '/users') {
    if (method === 'GET') return paginate(allUsers());
    if (method === 'POST') {
      currentUser = { ...currentUser, ...config.data };
      return currentUser;
    }
    if (method === 'DELETE') return { ok: true };
  }

  const userByIdMatch = /^\/users\/([^/]+)$/.exec(path);
  if (userByIdMatch) {
    const id = userByIdMatch[1];
    if (method === 'GET') {
      return allUsers().find(u => u.id === id || u.cognitoId === id) ?? currentUser;
    }
    if (method === 'PUT' || method === 'PATCH') {
      if (id === currentUser.id || id === currentUser.cognitoId) {
        currentUser = { ...currentUser, ...config.data };
        return currentUser;
      }
      return { ...config.data, id };
    }
  }

  // --- notifications -------------------------------------------------------
  if (path === '/notifications') {
    if (method === 'GET') return paginate([]);
    if (method === 'POST') return { id: 'mock-notification', ok: true };
  }
  if (path === '/notifications/send-push-notification') {
    return { ok: true };
  }
  const notifMatch = /^\/notifications\/([^/]+)$/.exec(path);
  if (notifMatch) {
    return { id: notifMatch[1] };
  }

  // --- payments ------------------------------------------------------------
  if (path === '/payments' && method === 'GET') return paginate([]);
  if (path.startsWith('/payments') || path.startsWith('/payment-profiles')) {
    return { ok: true, data: [] };
  }

  if (__DEV__) console.warn(`🎭 mockApi: UNHANDLED ${method} ${path} — returning null`);
  return null;
}
