// Firebase Cloud Messaging HTTP v1 helper.
//
// The legacy FCM "server key" API (Authorization: key=...) was decommissioned
// by Google in 2024. v1 authenticates with a SERVICE ACCOUNT: we mint a short
// OAuth2 access token from the service-account private key (RS256-signed JWT),
// then POST one message per device token to the v1 endpoint.
//
// Secret: FCM_SERVICE_ACCOUNT = the full service-account JSON (as a string),
// downloaded from Firebase → Project settings → Service accounts →
// "Generate new private key".

export interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

function b64url(input: ArrayBuffer | string): string {
  const bytes =
    typeof input === 'string'
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const raw = atob(body);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

// Mint an OAuth2 access token for the FCM scope from the service account.
export async function getFcmAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = `${unsigned}.${b64url(sig)}`;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const jsonResp = await resp.json();
  if (!resp.ok || !jsonResp.access_token) {
    throw new Error('fcm_oauth_failed: ' + JSON.stringify(jsonResp));
  }
  return jsonResp.access_token as string;
}

// Send one notification to one device token via FCM v1. Returns ok + detail.
export async function sendFcmV1(
  accessToken: string,
  projectId: string,
  token: string,
  title: string,
  body: string,
  data: Record<string, unknown>,
): Promise<{ ok: boolean; detail: unknown }> {
  // FCM data values must be strings.
  const stringData: Record<string, string> = {};
  for (const [k, v] of Object.entries(data ?? {})) stringData[k] = String(v);

  const resp = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          data: stringData,
        },
      }),
    },
  );
  return { ok: resp.ok, detail: await resp.json().catch(() => null) };
}
