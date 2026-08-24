# Third-Party Integrations — Wiring Runbook

What each service is, its current state in the code, and the **exact** step to
finish it. Almost everything is code-ready — the remaining work is you creating
a project and pasting a key in one specific place.

Legend: 🟢 code-ready (just needs a key) · 🟡 needs a decision · 🔴 don't wire

---

## 🔴 Sendbird — DO NOT WIRE (retire it)

Sendbird was the paid chat vendor. **We removed it** — chat + the feed run
natively on Supabase now. `package.json` has zero Sendbird packages; only
locally-named provider files remain (`SendbirdChatProvider` is our native
provider, just not renamed yet). Re-connecting Sendbird means paying per-user
for something you already replaced.

**Action:** cancel/close the Sendbird account and un-star it. Nothing to wire.
(Optional cleanup: rename `SendbirdChatProvider`/`SendBirdPostsProvider` to drop
the dead vendor name — housekeeping, not urgent.)

---

## 🟢 PostHog (product analytics) — needs 1 key

**State:** fully wired. `PosthogProvider` reads `EXPO_PUBLIC_POSTHOG_API_KEY`,
initializes PostHog when present, disables cleanly when absent, and fires
`identify` + `capture` events. Zero code changes needed.

**Your steps:**
1. Create a PostHog project (posthog.com) → Project Settings → copy the
   **Project API Key** (starts `phc_...`) and note the **host** (US or EU cloud).
2. Put the key in **two** places:
   - `app/.env`: `EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxx`
   - EAS (for builds): set the same var on each environment (see Expo section).
3. If your project is EU cloud, tell me — the provider currently uses the
   default US host; I'll add the `host` option.
4. **Verify:** run the app, sign in, watch PostHog → Activity for `identify` +
   events within ~30s.

---

## 🟡 Sentry (crash / error monitoring) — a decision first

**State:** Sentry is currently a **no-op shim** (`src/services/sentry.shim.ts`).
It was removed because its native pod broke the iOS build under Xcode 26. So
errors are **not** being reported anywhere today. `@sentry/react-native` is NOT
installed.

**Decision — pick one:**
- **A) Real Sentry** (best error/crash detail). Reinstall a
  Xcode-26-compatible `@sentry/react-native`, re-add the Expo config plugin,
  repoint the shim's imports at the real SDK, then `yarn && pod install` and
  rebuild. Then set `EXPO_PUBLIC_SENTRY_DSN` (+ `SENTRY_AUTH_TOKEN` for source
  maps) in `app/.env` and EAS. **Risk:** native dep + build; must be tested on
  device. I can do the code wiring behind a DSN check; you run the rebuild.
- **B) Use PostHog for error capture** (cheapest, no native dep). PostHog is
  already wired; I add a global error handler that sends exceptions to PostHog.
  Less crash detail than Sentry, but zero build risk and one fewer vendor.

**Recommendation:** ship with **B** now (no build risk, one less bill), add real
Sentry (A) later if you want deep native crash traces. Tell me A or B and I'll
implement it.

---

## 🟢 Firebase (push notifications) — config files + 1 secret

**State:** client is wired — `@react-native-firebase/app` + `/messaging` are
installed, `PushNotificationProvider` requests permission, and device tokens are
saved to `profiles_private.push_token`. The **delivery** side is the `send-push`
edge function (now auth-gated + `can_notify`-gated, so it's secure and the
message/like/mention push works). What's missing is the Firebase project config
and the FCM key.

**Your steps:**
1. Create a Firebase project (or use the existing one from the old app).
2. Add an **iOS app** (bundle id must match the app) → download
   **`GoogleService-Info.plist`** → place in `app/` (it's gitignored — correct;
   never commit it).
3. Add an **Android app** (package name must match) → download
   **`google-services.json`** → place in `app/`.
4. Firebase → Project Settings → Cloud Messaging → copy the **server key** →
   add it as a Supabase **edge-function secret** named `FCM_SERVER_KEY`
   (Dashboard → Edge Functions → Secrets, or `supabase secrets set FCM_SERVER_KEY=...`).
   (Expo push tokens work without this; raw FCM tokens need it.)
5. Deploy the function: `supabase functions deploy send-push --project-ref <ref>`.
6. **Verify:** sign in on a real device (push needs a device, not a simulator),
   confirm a `push_token` row appears in `profiles_private`, then have a second
   user send you a message → you get a push.

**Architecture note (already handled):** push is triggered client-side today.
The edge function now enforces `can_notify`, so it's safe. If you later want
message push to fire even when the sender's app is backgrounded, move the
trigger server-side (a DB trigger on `messages` calling `send-push` with the
service role). Not required to launch — flag for later.

---

## 🟢 Expo / EAS (build + deploy) — link + env vars

**State:** `eas.json` has `production` and `staging` build profiles. What's left
is linking the project and setting the `EXPO_PUBLIC_*` vars per environment so
cloud builds get them (local runs read `app/.env`).

**Your steps:**
1. `cd app && eas init` (links the repo to your Expo project) if not already.
2. Set env vars for each environment (staging = `development`, prod =
   `production`). Either in the Expo dashboard (Project → Environment Variables)
   or CLI, e.g.:
   ```
   eas env:create --environment development --name EXPO_PUBLIC_SUPABASE_URL --value https://hcvyknwbixnlwqozmkas.supabase.co
   eas env:create --environment development --name EXPO_PUBLIC_SUPABASE_KEY --value sb_publishable_nVwkBcbJ148W1GgakOQH6g_4kViA3lF
   eas env:create --environment development --name EXPO_PUBLIC_BACKEND --value supabase
   # + POSTHOG / SENTRY / MAP keys, and the production equivalents (prod Supabase)
   ```
3. Build: `eas build --profile staging` (or `production`).
4. Edge functions deploy separately (see the Secrets map). `config.toml` is now
   committed so `verify_jwt` is pinned per function (stripe-webhook = false).

---

## Consolidated secrets map — where every key goes

| Key | Belongs in | Used by |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` / `_KEY` | app/.env + EAS env | app → Supabase (✅ set for staging) |
| `EXPO_PUBLIC_BACKEND=supabase` | app/.env + EAS env | backend mode |
| `EXPO_PUBLIC_POSTHOG_API_KEY` | app/.env + EAS env | PostHog analytics |
| `EXPO_PUBLIC_SENTRY_DSN` | app/.env + EAS env | Sentry (if option A) |
| `EXPO_PUBLIC_MAP_KEY_ID` / `_VALUE` | app/.env + EAS env | Android Google Maps |
| `GoogleService-Info.plist` / `google-services.json` | `app/` (gitignored files) | Firebase push |
| `FCM_SERVER_KEY` | Supabase edge secret | send-push |
| `SENDGRID_API_KEY` | Supabase edge secret | send-email |
| `OPENAI_API_KEY` | Supabase edge secret | moderate-content |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Supabase edge secret | stripe-webhook, checkout |

Supabase edge secrets: Dashboard → Edge Functions → Secrets, or
`supabase secrets set NAME=value --project-ref <ref>`. `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.

---

## What I can do next (just say which)

- Implement **Sentry option B** (PostHog error capture) now — zero build risk.
- Or wire **Sentry option A** (real SDK) in code behind a DSN check for you to rebuild.
- Add the **PostHog EU host** option if your project is EU.
- Move **message push server-side** (DB trigger) so it's delivery-robust.
- Rename the dead **Sendbird-named** providers.

The keys/config files themselves are yours to create — I can't create accounts or
handle credentials, but I've made every landing spot ready and exact.
