# Independent Audit Request — Laurie's Love Rebuild (V2)

You are performing an INDEPENDENT, adversarial audit. Do not take any claim
in this prompt or in the repo's docs at face value — verify everything
against the actual code. Your credibility depends on finding what we missed,
not on agreeing with us. If something is bad, say it plainly with file:line
evidence.

## Context

Laurie's Love is a health/patient-support community app (~10k live users):
profiles with cancer diagnosis info, a map of nearby members, friend
requests, a community feed (posts/comments/likes), groups, group + direct
chat, notifications, donations.

You have TWO codebases to compare:

1. **ORIGINAL (agency-built, currently live in the App Store)** — in the
   folder `Lauries Love app rebuild ` (note trailing space):
   - `LauriesLove-ReactJS-app-main/` — React Native 0.79 / Expo 53 app
   - `laurieslove-api-main/` — NestJS 11 + TypeORM/MySQL API
   - Stack: AWS Cognito (auth), MySQL on ECS Fargate (data), S3 (media),
     Sendbird (chat AND the social feed — posts were Sendbird channels),
     CometChat (dead leftover), Intercom, Authorize.Net, Firebase push.

2. **REBUILD (ours)** — repo `Lauries-Love-App-Rebuild/` (monorepo:
   `app/` = the same RN app forked + reworked; `api/` = the old NestJS kept
   only for reference, no longer in the runtime path).
   - New stack: Supabase (Postgres + Auth + Realtime + Storage) behind
     `EXPO_PUBLIC_BACKEND=supabase`. Key files: `app/src/services/supabase/`
     (client, backend.config, supabase.api.ts, supabase.auth.ts,
     supabase.social.ts, supabase.chat.ts, supabase.storage.ts).
   - Architecture pattern: the legacy screen layer (~540 files) was kept;
     new data services return LEGACY-SHAPED objects (Sendbird channel /
     message shapes, old REST response shapes) so screens work unchanged.
     Judge this pattern on its merits — it is a deliberate trade-off.
   - There is also a `mock` backend mode (`app/src/mocks/`) used for
     UI-testing without any backend; it must never leak into supabase mode.
   - Sendbird/Cognito/Amplify packages are still INSTALLED but must be
     unreachable at runtime in supabase mode (removal is a planned follow-up
     pass). Verifying that unreachability is part of your job.
   - The Postgres schema/RLS lives in Supabase (not fully in this repo).
     Schema summary: tables value_definitions, profiles (1:1 auth.users),
     friendships, groups, group_members, posts (visibility all|group,
     audience_tags text[], group_id), comments, reactions (polymorphic
     entity_type/entity_id), conversations (is_group, group_id unique),
     conversation_members, messages, notifications, payments; RLS on all
     tables using (select auth.uid()) init-plan pattern; group-chat
     membership DERIVED from group_members inside is_conversation_member();
     storage buckets avatars/post-images with owner-folder write policies.
     Audit the CLIENT'S assumptions against this design (e.g., does client
     code rely on authorization that only RLS provides? does any client
     write trust spoofable fields?).

## Docs in the rebuild repo (read, then verify against code)

- `LAUNCH-PLAN.md` — claimed remaining work + migration plan
- `HANDOFF_SUMMARY.md`, `FULL_PROJECT_REPORT.md` — project history
- The git log — every change is committed with descriptive messages

## What to audit (all of it)

1. **Correctness of the backend swap.** Every screen-level data call in
   supabase mode: trace representative flows end-to-end (signup ->
   onboarding -> profile write; feed load -> comment -> like; group join ->
   group chat send; DM create -> realtime receive; friend request ->
   accept; avatar upload -> render). Flag any path that still hits
   Sendbird sdk.*, aws-amplify, CometChat, Intercom, or the legacy REST
   API while `SUPABASE_ENABLED` is true. Flag any legacy-shape mismatch
   (field a screen reads that the new mappers don't provide).
2. **Security.** Client-side injection (PostgREST filter string
   interpolation), trust of client-supplied fields, secrets in the repo
   (git-tracked, not just working tree), auth/session handling, deep-link/
   redirect handling, storage-path assumptions. Note: `.env` is gitignored
   BY DESIGN and contains only a publishable key — verify that's true.
3. **Performance & scale** (target: thousands of concurrent users).
   Query fan-out per screen (count round-trips), N+1s, unbounded queries,
   pagination presence/absence, re-render architecture (provider
   memoization, list virtualization, memo'd rows), realtime subscription
   lifecycle (leaks? unbounded refetch on event bursts?), startup work.
4. **Code structure & maintainability.** Layering, dead code (quantify
   what the pending Sendbird/Cognito removal will delete), TypeScript
   discipline (count `any` in the new services layer specifically),
   error-handling consistency, the mock/supabase/legacy triple-branch
   pattern's long-term cost.
5. **Reliability gaps.** Offline behavior, error surfaces users will see,
   race conditions (double-tap sends, concurrent joins), the
   optimistic-update paths.
6. **Honesty check on our known-gaps list.** We claim the only remaining
   build items are: Sendbird/Cognito package removal, Stripe payments edge
   function, push-notification delivery, rate limiting, account-deletion
   edge function, Resend SMTP config. Confirm or extend that list.

## Deliverable format

1. **Findings table**: [severity: CRITICAL/HIGH/MED/LOW] [file:line]
   [issue] [concrete fix]. Evidence required for every finding.
2. **Flow traces**: for each of the 7 flows in item 1, a pass/fail with the
   call chain you traced.
3. **Ratings — score each 1–10, BEFORE (original codebase) and AFTER
   (rebuild), with 2–3 sentences of justification each. Score
   independently from the code BEFORE reading anyone else's ratings; do
   not anchor on the docs:**
   - Code structure / maintainability
   - Performance (as evidenced in code; note you cannot measure runtime)
   - Security
   - Scalability readiness (thousands of concurrent users)
   - Overall product/system quality
4. **Verdict paragraph**: is this rebuild fit to replace the live app after
   the stated remaining items, yes/no/conditional, and the top 3 risks.

Constraints: read-only audit — change nothing. Budget your effort toward
the new supabase layer and its screen integrations; the original codebase
needs only enough reading to ground the BEFORE ratings (a prior audit's
findings for it are in `Lauries Love app rebuild /Lauries-Love-Code-Audit.md`
— you may sample-verify rather than re-derive).
