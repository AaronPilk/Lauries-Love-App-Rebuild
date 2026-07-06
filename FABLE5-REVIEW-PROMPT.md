You are acting as a senior mobile engineering reviewer performing a constructive,
independent code-quality and reliability review of MY OWN application before I
take it to launch. I own this codebase and this infrastructure and I am
authorizing this review. The goal is an honest, evidence-based engineering
assessment — not a rubber stamp. Be direct, be specific, cite file:line
evidence, and tell me what is weak, not just what is good. If something is
solid, say so plainly; if something is broken, incomplete, or risky, say that
just as plainly. Do not inflate scores to be agreeable. I would rather hear a
hard 7 with a clear path to 8 than a soft 8 I did not earn.

=======================================================================
PART 1 — PROJECT CONTEXT
=======================================================================

The app is "Laurie's Love," a health and patient-support community mobile app
(roughly 10,000 live users today) originally built by an outside agency. I took
it over and rebuilt the entire backend onto infrastructure I control. The
end goal is to fully replace the currently-live agency app and to scale the
system toward 250,000 concurrent users.

There are TWO codebases you should be aware of:

1. THE ORIGINAL (agency) app — still live in the app stores. It lives in a
   folder named "Lauries Love app rebuild " (note the trailing space):
   - LauriesLove-ReactJS-app-main/  (React Native 0.79 / Expo SDK 53 app)
   - laurieslove-api-main/           (NestJS 11 + TypeORM + MySQL API)
   Its stack was: AWS Cognito (auth), MySQL on ECS Fargate (data), S3 (media),
   Sendbird (BOTH chat AND the social feed — posts were Sendbird channels),
   CometChat (dead leftover), Intercom (support), Authorize.Net (payments),
   Firebase (push). A prior review of this original codebase found real
   problems: a live Firebase service-account private key committed into source
   control, hardcoded Google Maps API keys in multiple files, client-trusted
   sender/user IDs (identity could be spoofed), a map screen that downloaded
   every user's full record (email, phone, exact location) to the device, a
   non-atomic signup that could orphan accounts, and a chat composer that could
   hang on a failed image send. Treat this original app as the "before" baseline
   for comparison. You only need to read enough of it to ground a "before"
   rating — do not exhaustively re-audit it.

2. THE REBUILD (the thing you are reviewing) — repo "Lauries-Love-App-Rebuild/",
   a monorepo:
   - app/   = the same React Native app, forked and reworked
   - api/   = the old NestJS API, kept only for reference, NOT in the runtime
              path anymore
   - supabase/migrations/ = the full database schema and access-control rules,
              version-controlled as SQL files (this is the real database
              contract — read these; they are the source of truth for the
              data model and access rules)
   - supabase/functions/  = edge functions (currently: delete-account)
   Assorted docs at the repo root: PROJECT-STATE.md (master record — read this
   first), LAUNCH-PLAN.md, INTERNAL-AUDIT-2026-07-05.md,
   AUDIT-2026-07-06-FIVE-PASS.md, PARTNER-HANDOFF.md, and the client-facing PDF.

=======================================================================
PART 2 — ARCHITECTURE OF THE REBUILD
=======================================================================

The core decision was a full backend re-platform from the rented multi-vendor
stack onto Supabase (managed Postgres + Auth + Realtime + Storage). The chat
and social feed were rebuilt natively (no Sendbird, no per-user chat licensing).

Backend mode switch:
- app/src/services/supabase/backend.config.ts is the SINGLE source of truth. It
  reads EXPO_PUBLIC_BACKEND ('mock' | 'supabase') and derives SUPABASE_ENABLED,
  MOCK_ENABLED, and SOCIAL_STUBBED. Invalid env values can never leave both
  flags false (they fall back to 'supabase' with a dev warning). app/src/mocks/
  mock.config.ts re-exports MOCK_ENABLED from backend.config so the two can
  never disagree. There is NO legacy Sendbird runtime mode; the app only ever
  runs 'mock' or 'supabase'.

Adapter strategy (important — judge it on its merits, it is a deliberate
trade-off): the roughly 540 legacy screen files were kept largely unchanged. A
new data layer under app/src/services/supabase/*.ts returns LEGACY-SHAPED
objects — old Sendbird channel/message shapes and old REST response shapes — so
the screens compile and render without being rewritten. Key files:
- client.ts            (Supabase client + currentUserId cached-session helper +
                        assertUuid injection guard)
- supabase.api.ts      (a router that emulates the old REST API surface — a
                        single supabaseApi(url, config) function dispatching on
                        path; ~500+ lines)
- supabase.auth.ts     (Cognito-shaped auth wrappers over Supabase Auth)
- supabase.social.ts   (feed posts, comments, likes, groups)
- supabase.chat.ts     (1:1 + group chat, realtime, attachments)
- supabase.storage.ts  (media upload + public/signed URLs)
- supabase.adapter.ts  (axios adapter routing to supabaseApi)

Legacy SDK removal: the @sendbird/*, aws-amplify, @aws-amplify/*, CometChat,
Intercom, and aws-sdk packages were removed from package.json AND from the iOS
(AppDelegate) and Android (MainApplication.kt) native code. A compile-time shim
at app/src/services/legacy-chat.shim.ts provides a no-op Proxy for the remaining
unreachable "sdk.*" references so those dead branches still type-check without
the packages installed. Local structural types live in
app/src/providers/SendbirdChatProvider/SendbirdChatProvider.types.ts.

Note on the shim: a large "dead-code sweep" deleted roughly 1,220 lines of
unreachable legacy sdk branches across 17 files, but the sweep was intentionally
NOT finished in the most delicate chat files (MessagesTabChat, ChatGroup,
MessagesTabMain, SendbirdChatProvider) to avoid destabilizing recently-added
pagination/context code. So a residue of guarded, unreachable "sdk.*" call sites
remains (all behind SUPABASE_ENABLED / MOCK_ENABLED guards). Please verify these
are genuinely unreachable and cannot affect runtime behavior, and count how many
remain and in which files.

Providers: 14 React context providers, all with memoized values. Recently,
chat message state was split into its own context (chatMessagesContext /
useChatMessages) so an incoming chat message does not re-render every consumer
of the main chat provider app-wide. Verify this isolation actually holds (the
main provider's value must not include `messages` in its object or deps).

=======================================================================
PART 3 — THE DATABASE AND ACCESS-CONTROL MODEL (read supabase/migrations/*.sql)
=======================================================================

There are roughly 18 committed migration files. The model:

Tables: value_definitions (taxonomy), profiles (1:1 with auth.users, community-
safe columns only), profiles_private (owner-only PII: email, phone, push_token,
zip, device — split out of profiles so it cannot be read for other users),
friendships, groups, group_members, posts (with a denormalized like_count
column), comments, reactions (polymorphic: post/comment/message), conversations
(with denormalized last_message_body/sender), conversation_members, messages,
notifications, payments.

Row-level access rules (RLS) are enabled on every table and use the
`(select auth.uid())` init-plan pattern. Highlights to verify:
- profiles_private: owner-only (profile_id = auth.uid()) for select/insert/
  update. Confirm the base profiles table truly has NO email/phone/push_token
  columns anymore, and that a client cannot read another user's PII by any path
  (direct table select, embedded join, or the map function).
- group_members roster: readable only by co-members (via a security-definer
  helper is_group_member); member COUNTS are exposed separately via a
  group_member_counts() function (counts are not sensitive; the roster is,
  because groups are condition-specific and the roster would imply diagnoses).
- comments and reactions: readable/writable only if the caller can see the
  parent post (a security-definer can_see_post() function that mirrors the
  posts visibility rules: public / author / group-member / audience-tag).
- notifications: sender is forced to the authenticated user; the recipient must
  have a real relationship with the sender (friendship, shared conversation,
  shared group, or authored content the sender can see) via a can_notify()
  function.
- conversations/messages: members-only via is_conversation_member (group chat
  membership is derived from group_members).
- friendships: only the addressee can accept a pending request (with a WITH
  CHECK), so a requester cannot self-accept.
- Direct conversations: created via an atomic find_or_create_direct_conversation
  RPC with a canonical pair key + unique index (no check-then-insert race).
- Groups: created via an atomic create_group RPC (name/length/member-count
  limits + a per-hour rate limit); direct inserts into groups are blocked.
- The map function users_in_bbox returns a NARROWED projection (no email/phone/
  push_token), coarsens coordinates to ~2 decimal places (~1km), and hides
  last_name. It is SECURITY INVOKER (RLS still applies). Note: a PostGIS/GiST
  spatial index was trialed and reverted because installing PostGIS into the
  public schema tripped a database security ERROR; the map currently uses a
  btree(lat,lng) range filter, and a proper spatial index is a documented
  scale-phase task.
- Rate-limiting: BEFORE INSERT triggers on posts/comments/messages/reactions/
  friendships/notifications/conversations, backed by composite (actor,
  created_at) indexes.
- Storage buckets: avatars (public read for CDN delivery, but the broad
  listing/enumeration policy was removed), post-images (PRIVATE — rendered via
  short-lived signed URLs, may contain treatment/diagnosis photos),
  chat-attachments (PRIVATE, gated by conversation membership on the path
  prefix).
- All SECURITY DEFINER functions pin search_path and grant EXECUTE only to the
  authenticated role (revoked from anon/public). Verify this holds for every
  one: is_conversation_member, is_group_member, my_tags, can_see_post,
  can_notify, create_group, find_or_create_direct_conversation,
  group_member_counts, and the trigger functions.
- Edge function delete-account: identity comes only from the caller's verified
  JWT (no user-id parameter), so a user can only delete their own account; a
  service-role client performs the deletion; FKs cascade.

Client-side injection guard: interpolated PostgREST/realtime filter strings are
wrapped with an assertUuid() UUID-format check. Secrets: .env and
GoogleService-Info.plist are gitignored; only a publishable key and placeholders
are in tracked files.

Where you can, verify these claims against the ACTUAL committed SQL rather than
trusting this description. If any migration file disagrees with a claim above,
that repo-vs-reality gap is itself a finding worth reporting.

=======================================================================
PART 4 — WHAT WAS BUILT AND FIXED (so you can distinguish known work from
                                   new findings)
=======================================================================

Built on Supabase and verified working on device (though a FORMAL device QA
pass has not been recorded — see Part 6):
- Email/password signup with a 6-digit email verification code (OTP), atomic
  idempotent profile creation (no orphan accounts), and real account deletion.
- Community feed: posts, comments, likes; keyset infinite scroll (a created_at
  "before" cursor + onEndReached); post images served as signed, resized
  thumbnails; likes shown as a denormalized count plus a per-user "did I like
  it" flag (the feed no longer ships full liker-id arrays).
- Groups: create (atomic RPC), join (button lights up in place), details,
  members, leave — all on Supabase, off the old SDK.
- Chat: 1:1 (atomic find-or-create) and group (one thread per group, membership
  derived from group_members); realtime delivery that APPENDS incoming messages
  (deduped by message id, correct inverted-list ordering) instead of refetching
  the page; "load older messages" keyset pagination on both chat screens;
  image and document attachments via the private chat-attachments bucket with
  batch-signed URLs; correct video mime types.
- Map: viewport-scoped user loading via users_in_bbox (only people on screen),
  Apple Maps on iOS.
- Friends (send / accept / reject — reject genuinely deletes the pending row),
  notifications (sender forced to the authenticated user), profiles, avatars,
  and a support-chat entry point.

Fixed across several review cycles (do not re-report these as new unless they
have regressed — verify a sample and move on): friend-reject used to secretly
accept; group create/details/members used to run on dead code; post detail lost
its image and like count; likes never showed as "liked"; photos sent twice and
were force-cropped; the map wouldn't load and showed square markers; support
chat hijacked the Messages tab; onboarding forced a diagnosis year on
supporters; direct messages were ordered backwards; navigation needed
double-taps; a committed server key and hardcoded map keys (in the ORIGINAL);
member PII was over-exposed; a group roster leaked who was in each condition
group; the type-checker could not run at all; there were zero automated tests;
about 12 unused packages were installed.

Structure/tooling recently addressed: the TypeScript config was fixed so
`npx tsc --noEmit` actually runs (it now surfaces ~197 pre-existing legacy type
errors — a watchable baseline where before there was no checker at all); ~12
zero-import packages were removed from package.json (including
react-native-fast-image, which was the source of roughly 700 duplicate-symbol
Xcode build warnings); a small unit-test suite for the data-adapter mapping
functions now runs with plain `npx jest`; and the single-source backend config
was hardened.

=======================================================================
PART 5 — KNOWN-OPEN ITEMS (do NOT count these as new findings; DO confirm the
                           list is honest and complete)
=======================================================================

Engineering / performance polish still open:
- supabase.api.ts is a large single-function "god-router" (~500+ lines
  dispatching on URL path) — the biggest remaining maintainability smell.
- The map has no true spatial index (btree can only seek the leading column);
  proper spatial indexing (PostGIS in a dedicated schema + GiST) is deferred to
  the 250k scale phase.
- The feed still runs a per-post correlated comments(count) subquery, and the
  /users search uses count:exact + limit 500 rather than keyset pagination.
- Some services-layer files carry `any` types (~29 across the adapter layer),
  and ~197 TypeScript errors remain in the legacy screens (a watchable baseline,
  not yet a zero-error gate).
- The dead-code sweep and shim retirement are intentionally unfinished in the
  delicate chat files; the vendor-named providers (SendbirdChatProvider,
  SendBirdPostsProvider) still carry the old name though Sendbird is gone.
- Signed display URLs expire in ~1 hour; very long sessions could show a stale
  image until refresh.

Blocked on my external accounts (not engineering work):
- Payments (Stripe), push-notification delivery (Firebase; device tokens are
  already saved), transactional email (Resend SMTP), a production Google Maps
  key, and enabling leaked-password protection (a dashboard toggle).

Operational / launch:
- No formal recorded device QA pass yet (there is a 31-item checklist in
  LAUNCH-PLAN.md that is currently 0 checked).
- The data migration from the live agency system has never been rehearsed. A
  real constraint: the old auth system's passwords cannot be exported, so every
  one of the ~10,000 users would need a password reset at cutover — this needs a
  plan and an email-deliverability load test before go-live.

=======================================================================
PART 6 — WHAT I WANT YOU TO EVALUATE
=======================================================================

Work from the actual code and the committed SQL. Prioritize the new Supabase
data layer (app/src/services/supabase/*), the providers, the group and chat
screens, and supabase/migrations/*. Assess these dimensions:

A. CORRECTNESS. Do the features work as shipped? Trace these end-to-end (screen
   -> provider -> supabase service -> the shapes consumed back in the screen)
   and give each a pass / partial / fail with the call chain:
   1. Signup -> email code verification -> profile creation -> onboarding
   2. Feed load + infinite scroll -> open a post (image + like count render?) ->
      comment -> like (does the heart show liked on load, and does the count
      update correctly without shipping a full liker list?)
   3. Group join -> group chat -> send text -> send an image attachment
   4. Group create -> group details -> group members -> leave
   5. Direct message create -> send -> realtime receive (dedupe + ordering) ->
      load older history
   6. Media & Docs screen (both a DM and a group), including video attachments
   7. Friend request: accept AND reject (reject must delete, not accept)
   8. Map viewport load (only on-screen users; no PII in the payload)
   9. Account deletion (through to the edge function)
   10. Support chat entry point
   Also: count any remaining reachable "sdk.*" (shim) calls that could affect
   render, navigation, or logic in supabase mode, and flag any field a screen
   reads that its data-layer mapper does not actually provide.

B. DATA ACCESS & PRIVACY CORRECTNESS. This is a health/diagnosis community, so
   access control matters. From the committed migrations, reason about whether a
   hostile-but-authenticated user could read or write anything they shouldn't:
   other users' PII (email/phone/push token), private group posts/comments,
   group rosters (who is in which condition group), other users' conversations
   or messages, spoofed notifications, self-accepted friendships, or forced
   conversation membership. Verify the security-definer functions are correctly
   scoped (search_path pinned, EXECUTE limited to authenticated) and that the
   client-side UUID guards actually cover every interpolated filter. Confirm no
   secrets are committed. Note the two intentional design choices (avatars are a
   public CDN bucket without listing; exact coordinates are coarsened rather
   than removed) and say whether you consider them acceptable for this domain.

C. PERFORMANCE & SCALE (target 10k now, 250k later). Count query round-trips per
   screen; find any unbounded queries, N+1 patterns, or missing pagination; and
   evaluate the realtime subscription lifecycle and the per-row cost of the
   security-definer functions used inside RLS. Confirm the recent fixes actually
   landed: denormalized like counts (no liker arrays on the feed), signed +
   resized thumbnails, the chat "load older" cursor, the group-member fan-out
   cap, the conversation last-message denormalization, and the chat-context
   re-render isolation. Then name what breaks first as the user base grows, in
   order.

D. CODE STRUCTURE & MAINTAINABILITY. Assess layering, the god-router, the `any`
   count, error-handling consistency, the dead-code/shim residue, naming debt,
   the test coverage that now exists, and whether `tsc` running (with a 197-error
   baseline) is a usable safety net. Be concrete about what a future developer
   (including one who inherits this) would trip over.

E. RELIABILITY & OPERATIONAL READINESS. Separate "the build is good" from "this
   is ready to swap under 10,000 live users today." Give an honest read on the
   testing reality (no recorded QA pass, no automated coverage beyond the small
   adapter suite, ~197 type errors), the un-rehearsed data migration, and the
   forced-password-reset problem.

=======================================================================
PART 7 — SCORING (this is the main thing I want)
=======================================================================

Score each of the following from 1 to 10, giving BOTH a "before" number for the
original agency app and an "after" number for this rebuild, with 2-3 sentences
of justification per line. Score independently from the code — do not simply
adopt the numbers I have used internally, and do not round up to be nice:

  - Correctness (features work as shipped)
  - Data access & privacy correctness
  - Performance & scale readiness
  - Code structure & maintainability
  - Overall build quality

Then give TWO additional single numbers, each 1 to 10, for the rebuild only:
  - "Would you be comfortable handing this codebase to another developer to
     maintain?" (a maintainability confidence score)
  - "Is this operationally ready to replace the live 10,000-user app TODAY?"
     (an operational-readiness score — this is a different question from build
     quality, and I expect it to be lower)

For calibration and honesty: internal reviews currently put this rebuild at
roughly correctness 8-8.5, privacy/access-control 8-8.5, performance ~7.5,
structure ~7.5, overall ~7.7, and operational-readiness ~4. Tell me where you
AGREE and where you think those numbers are too generous or too harsh, with
evidence. If you land lower, I want to know why. If you land higher, justify it.

=======================================================================
PART 8 — OUTPUT FORMAT
=======================================================================

1. A findings table: for each finding give a severity (critical / high / medium
   / low), a file:line or migration:line reference, a one-line description, and a
   concrete fix. Separate NEW findings from confirmations of the known-open list
   in Part 5.
2. The ten flow traces from Part 6A with a pass / partial / fail verdict and the
   call chain you followed.
3. The full scoring block from Part 7 (before/after per category + the two
   extra single scores), each with justification.
4. A short "fix-first" list: the five things you would do next, in order, to
   raise the two lowest category scores.
5. A closing verdict paragraph: is this rebuild fit to replace the live app
   after the known-open items are addressed — yes, no, or conditional — and the
   top three risks.

Constraints: this is a READ-ONLY review; do not modify anything. Ground every
claim in the actual code or SQL, cite file:line, and be honest rather than
agreeable. Effort should go mainly into the Supabase data layer, the providers,
the group/chat screens, and the migrations; read only enough of the original
agency app to justify the "before" ratings. Thank you — I am looking for the
truth here, including the parts that are not flattering.
