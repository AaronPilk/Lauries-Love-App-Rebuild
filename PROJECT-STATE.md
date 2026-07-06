# Laurie's Love Rebuild — Master State & History

Single source of truth for what this project is, everything that was done, the
current state, and what remains. Last updated: **July 5, 2026** (HEAD `dc329a4`
+ later commits). Read this first when picking the project back up.

---

## 1. What this is

- **Laurie's Love** — a health / cancer-support community mobile app, ~10k live
  users, taken over from the original agency (**One Seven Tech**).
- **Goal:** replace the live agency app entirely; scale target **250K concurrent users**.
- **App:** React Native 0.79 / Expo SDK 53, React 19, New Architecture, Hermes.
- **Repo:** `~/Lauries-Love-App-Rebuild` (monorepo: `app/` = the RN app, `api/` =
  the old NestJS API kept for reference only, no longer in the runtime path).
- **Remote:** https://github.com/AaronPilk/Lauries-Love-App-Rebuild.git · branch `main`.
- **Owner/operator:** Aaron "Pilk" Pilkington (aaron@skyway.media), Skyway Media.
  Works with a business partner who fronts the client relationship.

## 2. The core decision — backend re-platform to Supabase

The original stack was **Sendbird (chat + the social feed), AWS Cognito (auth),
NestJS + TypeORM + MySQL on ECS Fargate (data), S3 (media), Authorize.Net
(payments), Intercom (support), CometChat (dead leftover)**. We replaced ALL of
it with **Supabase** (Postgres + Auth + Realtime + Storage), built chat and the
feed natively, and removed every rented vendor.

- **Supabase project:** org "Lauries Love", project id **`iwbfsbriippzmdyrsmsu`**,
  us-east-2, Postgres 17, URL https://iwbfsbriippzmdyrsmsu.supabase.co.
- **Backend switch:** `EXPO_PUBLIC_BACKEND=mock|supabase` in `app/.env` (gitignored).
  `app/src/services/supabase/backend.config.ts` is the SINGLE parser (warns on
  invalid values, can never leave both flags false); `app/src/mocks/mock.config.ts`
  re-exports `MOCK_ENABLED` from it.
- **Adapter strategy:** the ~540 legacy screens are unchanged. The new data layer
  (`app/src/services/supabase/*.ts`) returns LEGACY-SHAPED objects (old Sendbird
  channel/message shapes, old REST response shapes) so screens work as-is.
- **Legacy SDKs fully removed** from package.json, iOS (AppDelegate), and Android
  (MainApplication.kt): `@sendbird/*`, `aws-amplify`, `@aws-amplify/*`,
  `@cometchat-pro/*`, `@intercom/intercom-react-native`, `aws-sdk`. A dead-proxy
  shim (`app/src/services/legacy-chat.shim.ts`) + local types
  (`app/src/providers/SendbirdChatProvider/SendbirdChatProvider.types.ts`) keep
  the remaining unreachable legacy branches compiling.

## 3. What's been built (all live on Supabase, verified on device)

- **Auth:** Supabase Auth, email OTP verification (`sbConfirmSignUp`), atomic
  idempotent profile upsert (no orphan accounts), real account deletion via the
  `delete-account` edge function (JWT-only identity, deployed & wired).
- **Feed:** posts/comments/likes, keyset infinite scroll (`before` cursor +
  `onEndReached`), post images (image_sm/md/lg keys), optimistic likes.
- **Groups:** create (atomic `create_group` RPC), join (lights up in place),
  details, members, leave — all on Supabase.
- **Chat:** 1:1 (atomic `find_or_create_direct_conversation` RPC + unique
  `direct_key`) and group (one thread per group, membership derived from
  group_members). Realtime via postgres_changes, APPENDS incoming messages
  (deduped by messageId, no refetch-per-message). Image + document attachments
  (private `chat-attachments` bucket, member-gated, batch signed URLs), video
  mime types correct, double-tap send lock.
- **Map:** viewport-scoped `users_in_bbox` RPC (narrowed projection — no email/
  phone/push_token leaked), Apple Maps on iOS.
- **Media & Docs, friends, notifications** (sender forced to auth.uid()),
  profiles, avatars (Storage), support chat button (env-overridable
  SUPPORT_PROFILE_ID with graceful failure).

## 4. Database — all committed to `supabase/migrations/` (15 files)

Full schema + RLS is version-controlled. Key security model:
- RLS on every table using `(select auth.uid())` init-plan pattern.
- Visibility gates: `can_see_post()` / `can_notify()` (comments, reactions,
  notifications all gated); self-only conversation membership; addressee-only
  friend accept; narrowed map projection.
- SECURITY DEFINER functions all `search_path`-pinned, EXECUTE granted only to
  authenticated: `is_conversation_member`, `my_tags`, `can_see_post`,
  `can_notify`, `create_group`, `find_or_create_direct_conversation`,
  `users_in_bbox` (invoker), rate_limit_check.
- Rate-limit BEFORE INSERT triggers on 7 tables + composite (actor, created_at)
  indexes. Body-length CHECK constraints. Storage buckets: avatars/post-images
  (public read → authenticated), chat-attachments (private, member-gated).
- Edge function: `supabase/functions/delete-account/index.ts` (deployed).

## 5. Audit history & scores (independent + our own)

Three external audit rounds (Codex V1/V2/V3) + our own multi-agent passes.
**Final scorecard (original agency app → current rebuild):**

| Area | Original | Rebuild |
|---|---|---|
| Correctness | 4 | 8.5 |
| Security | 2.5 | 7.5 |
| Performance / scale | 2.5 | 6.5 |
| Structure | 5 | 6.5 |
| **Overall** | **~3.5** | **~7.5** |

The original scored near the floor on security because it had a **committed live
Firebase private key** + hardcoded Google Maps keys in source. Full detail in
`INTERNAL-AUDIT-2026-07-05.md`.

## 6. What was wrong originally (the fix list, for the record)

Security: committed server private key; map downloaded every user's PII; client-
trusted senderId (impersonation/IDOR); comment bodies on private group posts
world-readable; notification spam to any stranger; force-add strangers to
conversations; requester self-accept friendships; account deletion only
deactivated; profile PII over-exposed. Functionality: reject-friend actually
accepted; group create/details/members broken; post detail lost image + likes;
likes never showed as liked; photo double-send + forced square crop; non-atomic
signup (orphans); map wouldn't load / square markers; support chat hijacked the
Messages tab; diagnosed-year forced on supporters; DMs backwards; double-tap
nav; frozen chat composer on failed sends. Speed/cost: refetch-everything on tab
hops (10s staleTime); N+1 comment loading; stale cached bundles (expo-updates);
Sendbird per-user chat licensing; four rented vendors.

## 7. Business / pricing strategy (agreed direction, July 5 2026)

- Client has been quoted **$30k–100k** and told it'd take months (their anchor).
- Work maps to a **$60k–140k / 3–6 month** agency engagement (market estimate).
- We delivered the core in ~36 hours.
- **Recommended pricing:** one-time rebuild + data migration + App Store redeploy
  **~$40–50k** (floor ~$30k); **$2,000/month** retainer for support + feature
  buildouts (partly funded by the ~$550–1,150/mo vendor savings we created).
- **Strategy:** take over their whole stack (we own the infrastructure), migrate
  data, redeploy, then grow the retainer as they scale. This deal = the template.
- Deliverables written: `PARTNER-HANDOFF.md` (owner brief), the client PDF
  (`Lauries-Love-Rebuild-Report.pdf`, plain-English, in outputs), internal
  partner email (in chat, not committed).

## 8. Remaining work (nothing is a rebuild — finish-line items)

Blocked on the owners' accounts: Stripe (payments edge fn), Firebase (push
fan-out; FCM tokens already saved), Resend (SMTP in Supabase dashboard), Maps
production key, enable leaked-password protection (one dashboard toggle).
Engineering, needs staging: **#1 — `profiles_select using(active)` still exposes
email/phone/push_token via direct PostgREST** (split sensitive columns into an
owner-only `profiles_private` table or a `public_profiles` view; must be tested
on a staging copy before touching live data — the *visible* leak via the map is
already closed). Perf polish before growth push: feed image transforms/thumbnails,
like counts instead of full liker arrays, chat history "load older" cursor,
`getMyConversations` last-message denormalization, `getMyGroupChannels` member
cap. Housekeeping: delete ~800 LOC dead legacy branches + the shim, remove ~13
zero-import packages (esp. **react-native-fast-image** — 0 imports, source of the
~700 duplicate-libwebp Xcode warnings), add tests (currently ~0 coverage).

## 9. Key docs in the repo

`PARTNER-HANDOFF.md`, `INTERNAL-AUDIT-2026-07-05.md`, `LAUNCH-PLAN.md`,
`DEV-HANDOFF-REQUEST.md`, `CODEX-AUDIT-PROMPT-V2.md`, `CODEX-AUDIT-PROMPT-V3.md`,
`supabase/migrations/README.md`, and this file.

## 10. Hard rules (still in force)

- **Never touch the live app or the agency's consoles** (AWS, Cognito, Sendbird,
  Firebase, Authorize.Net, Sentry org) until a coordinated cutover the owners
  approve. All data extraction = read-only exports.
- **No secrets committed** (`.env`, GoogleService-Info.plist gitignored).
- Sandbox git ops leave `.git/*.lock` + `tmp_obj_*` — clear after each commit.
  Pushes must come from the Mac (creds in keychain).
- Xcode 26 vs RN 0.79: after native/dep changes run `yarn install && pod install`;
  JS-only changes need only a Metro reload. Judge speed on a Release build.
