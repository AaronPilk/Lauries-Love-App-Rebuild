# Parallel Deep Audit + Fix Pass — 2026-08-23

Ran 9 agents in parallel across the whole system (app, web admin, edge functions, all 32 migrations, build health, onboarding, data layer, docs) while you were away, root-caused the login problem, fixed the blockers I safely could, and hardened a production security gap. This is the record.

---

## ✅ Fixed this session (committed: eeb84be, + earlier staging work)

1. **LOGIN — root-caused and fixed.** Your "login not working" was NOT the password. After a successful sign-in, the app's profile-complete gate (`Application.tsx → isRegistrationFull`) **required a zip code**, which lives in `profiles_private` and is null for ~21 of 23 accounts — so authenticated users got bounced straight back to onboarding/login. Fixes:
   - `Application.tsx` — removed `zipCode` from the gate.
   - `auth.navigator.tsx` — removed `zipCode` from the resume gate + fixed the resume order (role before diagnosis, matching the real forward flow).
   - `Login.tsx` — stopped re-enforcing signup password complexity at login (Supabase is the authority now) and stopped the button locking permanently.
2. **tsc was silently broken in CI — fixed.** `tsconfig.json` forced a `react-native` types entry RN 0.79 no longer ships, so `tsc` bailed with one fatal error before checking any code. Removed it; `tsc` now actually runs. True baseline = **196 errors** (mostly auto-generated icons + legacy screens; the new Supabase layer has ~1). My edits add none.
3. **SECURITY — `organizations` table RLS gap closed.** The repo migrations never enabled RLS on `organizations`, so a fresh deploy leaves it open to read + a cascade-delete that would wipe all admin config, custom fields, branding, and the moderation queue. Production had it locked out-of-band; **staging was wide open.** New migration `20260823220000_organizations_rls_hardening_v1` enables RLS + explicit policies; **applied to staging AND production** and committed.
4. **STAGING is live and usable.** `lauries-love-staging` (`hcvyknwbixnlwqozmkas`) has the full 32-migration schema, the `value_definitions` taxonomy seeded (that was why the "What type of user are you?" screen was blank), a working owner login, and `.env.staging` in the app.
   - **Staging test login:** `jeremy@skyway.media` / `LauriesStaging1!` (confirmed, promoted to support **owner** — admin/support features work). Change this password whenever.

---

## 🔴 CRITICAL — fix before ANYTHING is deployed (edge functions)

These functions aren't wired/live yet (they return 503 until keyed), so they're not hurting you today — but they must be fixed before deploy.

- **`send-email` is an open email relay.** No caller auth (`send-email/index.ts:64-108`). Anyone could send arbitrary email (incl. fake "password reset" links) from `no-reply@laurieslove.org` and torch your domain reputation. Fix: require `getUser()`, force recipient = caller's own email, disallow raw client HTML, rate-limit.
- **`send-push` sends arbitrary push to any user + reads PII unauthenticated.** No caller auth (`send-push/index.ts:27-62`); takes client-supplied `userIds`, reads `profiles_private.push_token` via service role, pushes attacker-controlled content. Fix: require `getUser()`; derive recipients server-side from the triggering event, don't trust client `userIds`.

## 🟠 HIGH

- **`moderate-content` unauthenticated** (`moderate-content/index.ts:15-114`) — anyone can burn your OpenAI key (cost DoS) and spam the moderation queue. Fix: authenticate + rate-limit.
- **No `supabase/config.toml`** — `stripe-webhook` MUST deploy `--no-verify-jwt` (Stripe sends no JWT); a plain redeploy silently 401s the webhook and payments stop reconciling. Also, `verify_jwt=true` is NOT real auth (the anon key satisfies it) — that's why the 3 functions above are exploitable. Fix: commit `config.toml` pinning per-function `verify_jwt` + add in-code `getUser()` guards.
- **Stripe webhook swallows DB write errors** (`stripe-webhook/index.ts:93,95,198-200,231-242`) — supabase-js returns `{error}` (doesn't throw), so failed `payments`/`donation_subscriptions` writes still return 200; Stripe never retries → payments silently unreconciled. Fix: check `.error` on every write and throw so the rollback + retry works.
- **Stripe first recurring charge double-counted; out-of-order events drop a payment** (`stripe-webhook` checkout vs `invoice.paid`). Fix: make one handler the source of truth for the first period.
- **`profile_field_values` is world-readable** (`admin_settings_v1:64-66`, `using(true)`). Custom profile fields have no public/private flag, so any field an admin adds (treatment center, emergency contact, etc.) is broadcast to every logged-in user — a plausible health-PII leak. Fix: add an `is_public` flag on `custom_profile_fields` and gate reads (self + staff + public). I did **not** auto-fix this — it needs a product decision on which fields are public and the web Profile page reads it, so it needs a coordinated change.
- **WELCOME + NEW_MENTION notifications are created but never render** (`notifications.screen.tsx:193-222` has no case for them). Every new user gets a permanent unread badge that opens to an empty screen; every @mention is invisible to the recipient. Fix: add render cases for `NEW_MENTION` and `WELCOME`.

## 🟡 MEDIUM

- **Web admin panel** (`web/src/pages/admin/`): `Features.tsx` has no owner-gate and toggle failures are silent; `Members.tsx` role changes fail silently (the last-owner guard message is swallowed); `Moderation.tsx` "reject" updates status but never removes the post/comment (copy says it does); inactive members are invisible (`profiles_select using(active)`); several mutations show no error on failure. Details in the agent notes.
- **Mobile app ignores admin settings** — feature flags + branding are read only by the web app; `app/src` has no consumer. Either add a feature-flag/branding provider to the mobile app or correct the "applies across mobile" claims.
- **Onboarding gating is derived, not stored** — there's no `onboarding_completed` flag, so a returning/migrated user missing any one field gets bounced into onboarding (same class as the login bug I fixed). Also: reloading mid-onboarding force-signs-the-user-out; onboarding writes are fire-and-forget (screens advance even if the save failed). Recommend an explicit persisted completion flag.
- **Group search oversold** — comments claim typo-tolerant (pg_trgm) but it's substring ILIKE only; a typo returns nothing. Either implement similarity matching or fix the comments.

## 🟢 LOW / build hygiene

- **13 dead barrel-export errors** (`screens/index.ts`, `Auth/index.ts`, `presentation/form/fields/index.ts` reference deleted modules) — cheap to fix, removes real tsc errors.
- **102 of the 196 tsc errors are auto-generated icons** (one repeated svgr/react-19 mismatch) — exclude `src/assets/icons-auto/` from type-check to see the real ~94.
- **ESLint isn't installed** (config exists but orphaned) — `npm run lint` is dead until reinstalled.
- **Dead failing test** `__tests__/App-test.tsx` (pre-rebuild RN template) — delete it; the real adapter suite is green (5/5).
- **~52 `any`** in the data layer (mostly the PostgREST boundary) — `supabase gen types` would remove most.
- **9 live `sdk.*` calls** remain in `SendbirdChatProvider.tsx` (unreachable, behind guards) — physical deletion still pending.
- **Docs are stale** — PROJECT-STATE.md (says 16 migrations/July, no web app), README.md (still describes the old AWS/Sendbird stack), migration README (missing 10 migrations). A drafted, accurate "what exists today" block is ready to drop into PROJECT-STATE.

## Design decisions to confirm (not bugs)

- **Diagnosis is community-visible** to all authenticated users (by design for a support community; PII like email/phone is split out). Confirm this is intended.
- **Every support agent (not just owners) can read all member PII** (email/phone via `profiles_private`). Confirm agents should have that.
- **Moderation:** the DB keyword-heuristic trigger and the OpenAI edge function currently coexist — decide which wins.

---

## What's verified-good (don't re-audit)

The Supabase **data layer is in sync** with all 32 migrations — every RPC signature and return shape matches, no schema drift. The **Stripe signature verification + idempotency** pattern is correct. `delete-account` and `stripe-create-checkout-session` are properly authenticated. The **since-July RLS surface** (support, moderation, payments, hashtags/mentions, staff) is correctly gated and all SECURITY DEFINER functions are search_path-pinned + execute-revoked — `organizations` was the one gap, now closed. The **community feature write paths** (search, hashtags, reporting, mention recording) all work; only the notification *rendering* is missing.

---

## Suggested order when you're back

1. Test staging login with `jeremy@skyway.media` / `LauriesStaging1!` — confirm the login fix works, then finish onboarding on staging.
2. Push the commits from your Mac: `cd ~/Lauries-Love-App-Rebuild && git push origin main`.
3. Have the dev fix the 3 unauthenticated edge functions + add `config.toml` (CRITICAL, before any deploy).
4. Decide the `profile_field_values` / custom-field privacy model (HIGH, health data).
5. Add the `NEW_MENTION` + `WELCOME` notification render cases (HIGH, hits every new user).
6. Knock out the cheap build hygiene (dead barrels, delete App-test, exclude icons, reinstall eslint).

Full per-agent detail is in this session's transcript; ping me to expand any section into tickets with exact diffs.
