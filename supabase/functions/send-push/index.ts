// send-push
// Body: { userIds?: string[], tokens?: string[], title, body, data? }
// Sends push notifications via Expo (for Expo tokens) and via FCM HTTP v1 (for
// native FCM tokens — the app's actual token type).
//
// Push tokens are read from `profiles_private.push_token` WHERE push_active,
// using the service-role client (that table is owner-only under RLS).
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Optional secrets: FCM_SERVICE_ACCOUNT (the Firebase service-account JSON, as a
//   string) — enables native-FCM-token delivery via the FCM HTTP v1 API. The
//   app registers native FCM tokens (@react-native-firebase/messaging), so this
//   is the active delivery path. (The legacy FCM_SERVER_KEY API was retired by
//   Google in 2024 and is no longer used.)
import { handlePreflight, json, notConfigured } from '../_shared/cors.ts';
import { adminClient, callerClient, env, getUser, missingEnv } from '../_shared/supabaseAdmin.ts';
import { getFcmAccessToken, sendFcmV1, type ServiceAccount } from '../_shared/fcm.ts';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

function isExpoToken(token: string): boolean {
  return token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[');
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const missing = missingEnv(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  if (missing.length) return notConfigured(missing);

  // SECURITY (2026-08-23): require an authenticated caller. Previously anyone
  // could push arbitrary content to any user and cause the service role to read
  // push tokens (PII) for arbitrary profile ids. Only support STAFF may target
  // other users or supply raw tokens; everyone else can only push to
  // themselves. True multi-user fan-out (e.g. new-message alerts) must be
  // driven server-side (DB trigger / internal service-role call), not here.
  const caller = await getUser(req);
  if (!caller) return json({ error: 'unauthorized' }, 401);

  try {
    const body = await req.json().catch(() => ({}));
    const title: string = body.title ?? '';
    const message: string = body.body ?? '';
    const dataPayload = body.data ?? {};
    let explicitTokens: string[] = Array.isArray(body.tokens) ? body.tokens : [];
    let userIds: string[] = Array.isArray(body.userIds) ? body.userIds : [];

    if (!title && !message) {
      return json({ error: 'title or body is required' }, 400);
    }

    const admin = adminClient();

    // Recipient gate. Staff may target anyone. A normal caller may only push to
    // people they have a real relationship with — the SAME rule as in-app
    // notifications (can_notify: friend, shared conversation, shared group, or
    // author of content they can see). This keeps message/like/mention push
    // working while blocking push spam to strangers. Raw client tokens are
    // staff-only (a normal caller can't push to an arbitrary device token).
    const { data: staffRow } = await admin
      .from('support_staff')
      .select('profile_id')
      .eq('profile_id', caller.id)
      .maybeSingle();
    const isStaff = !!staffRow;

    if (!isStaff) {
      explicitTokens = [];
      if (userIds.length) {
        const asCaller = callerClient(req);
        const allowed: string[] = [];
        for (const rid of userIds) {
          if (rid === caller.id) { allowed.push(rid); continue; }
          const { data: ok } = await asCaller.rpc('can_notify', { p_recipient: rid });
          if (ok === true) allowed.push(rid);
        }
        userIds = allowed;
      }
    }

    const tokenSet = new Set<string>(explicitTokens.filter(Boolean));

    // Resolve tokens for the requested users from the owner-only PII table.
    if (userIds.length) {
      const { data, error } = await admin
        .from('profiles_private')
        .select('push_token, push_active')
        .in('profile_id', userIds)
        .eq('push_active', true);
      if (error) throw error;
      for (const row of data ?? []) {
        if (row.push_token) tokenSet.add(row.push_token as string);
      }
    }

    const tokens = [...tokenSet];
    if (!tokens.length) {
      return json({ ok: true, sent: 0, note: 'no active push tokens for recipients' });
    }

    const expoTokens = tokens.filter(isExpoToken);
    const fcmTokens = tokens.filter((t) => !isExpoToken(t));

    const results: { channel: string; ok: boolean; detail?: unknown }[] = [];

    // --- Expo fan-out (batched at 100 messages per request) ---
    for (const batch of chunk(expoTokens, 100)) {
      const messages = batch.map((to) => ({
        to,
        title,
        body: message,
        data: dataPayload,
        sound: 'default',
      }));
      const resp = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(messages),
      });
      results.push({
        channel: 'expo',
        ok: resp.ok,
        detail: await resp.json().catch(() => null),
      });
    }

    // --- FCM fan-out via HTTP v1 (needs the service-account JSON) ---
    const fcmSaRaw = env('FCM_SERVICE_ACCOUNT');
    if (fcmTokens.length) {
      if (!fcmSaRaw) {
        results.push({
          channel: 'fcm',
          ok: false,
          detail: 'FCM_SERVICE_ACCOUNT not configured; skipped FCM tokens',
        });
      } else {
        try {
          const sa = JSON.parse(fcmSaRaw) as ServiceAccount;
          const accessToken = await getFcmAccessToken(sa);
          // v1 sends one message per token — do it per device.
          for (const token of fcmTokens) {
            const r = await sendFcmV1(
              accessToken,
              sa.project_id,
              token,
              title,
              message,
              dataPayload,
            );
            results.push({ channel: 'fcm', ok: r.ok, detail: r.detail });
          }
        } catch (e) {
          results.push({ channel: 'fcm', ok: false, detail: (e as Error).message });
        }
      }
    }

    return json({ ok: true, sent: tokens.length, expo: expoTokens.length, fcm: fcmTokens.length, results });
  } catch (e) {
    return json({ error: (e as Error).message ?? 'push failed' }, 500);
  }
});
