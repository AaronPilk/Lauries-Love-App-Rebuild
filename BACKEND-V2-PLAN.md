# Backend V2 — Supabase Rebuild Plan

**Decision (2026-07-02):** Replace the agency stack (Cognito + NestJS/MySQL + S3 + Sendbird + CometChat)
with **Supabase** (Postgres + Auth + Realtime + Storage), plus a slim payments service.
Criteria: high user scale, speed, locked-in security (RLS at the database layer).

## What each agency piece becomes

| Today (agency)                          | V2 (ours)                                    |
| --------------------------------------- | -------------------------------------------- |
| AWS Cognito (auth)                      | Supabase Auth (email/password, same UX)      |
| NestJS + MySQL on ECS Fargate           | Supabase Postgres + auto REST + RLS          |
| S3 presigned URLs (profile pics, media) | Supabase Storage (RLS-scoped buckets)        |
| Sendbird (chat AND social feed)         | Own tables + Supabase Realtime (below)       |
| CometChat (dead code)                   | Deleted                                      |
| Firebase (push)                         | Keep FCM/APNs via Expo Notifications         |
| Authorize.Net (donations/subscriptions) | Slim service: Supabase Edge Functions        |
| Expo Updates (OTA) via agency EAS       | Own EAS project (re-enable when ready)       |

## Core schema (v1)

- `profiles` (mirrors today's `user` table: role, diagnosis type/subtype/year,
  geo lat/lng as REAL COLUMNS with a geospatial index — fixes the map at scale,
  enables a real `nearby` query)
- `friendships` (requester, addressee, status; unique pair index)
- `posts` (author, body, image path, visibility, group_id nullable)
- `comments` (post_id, author, body)
- `reactions` (entity_type, entity_id, user_id, kind; unique per user/entity)
- `groups` (name, cover, taxonomy tags: diagnosis type / role) + `group_members`
- `conversations` (direct or group) + `conversation_members` + `messages`
- `notifications` (recipient, type, payload, read_at)
- `payments` (mirror of today's payment records)

Every table: RLS policies so users can only read/write what they're allowed to.
No service keys in the app. Ever.

## Realtime (Sendbird replacement)

- Chat: Supabase Realtime channel per conversation (postgres_changes on `messages`).
- Feed: standard queries + pull-to-refresh; realtime only for comment/like counts
  on the post you're viewing. (Feeds don't need websockets; chat does.)
- Presence/typing: Realtime presence channels, added later — not v1.

## App-side swap (UI untouched)

The mock layer proved the UI runs on plain data. Same trick, real data:
1. Keep `SendbirdChatProvider` / `SendBirdPostsProvider` interfaces exactly.
2. Reimplement their internals with supabase-js (queries + realtime subscriptions).
3. ApiProvider's `api()` maps to Supabase queries (or keep a thin REST shim during transition).
4. Auth provider swaps Amplify calls for supabase.auth (same signatures we already guard).
5. Delete `@sendbird/*`, CometChat, Amplify, and the mock flag becomes a dev tool.

## Data migration (kill the old app)

1. Export MySQL (users, friend_requests, payments, notifications, value_definitions).
2. Export Cognito users (emails; passwords CANNOT be exported — users get a
   one-time "set your new password" email on first login, standard practice).
3. Export Sendbird data via their export API (channels/messages) -> map to
   posts/comments/conversations/messages.
4. Import scripts (Node) -> Supabase. Dry-run against a staging project first.
5. App Store: submit the rebuilt app as an UPDATE to the existing listing
   (requires transferring the App Store listing to your Apple account — needs
   the agency's cooperation) OR launch as a new listing and sunset the old one.

## Order of execution

1. Provision Supabase project (his org) + schema + RLS  <- next concrete step
2. Auth swap (Supabase Auth) + profiles CRUD
3. Feed/groups on real tables
4. Chat on Realtime
5. Storage (avatars/media)
6. Payments edge function (Authorize.Net)
7. Migration scripts + staging dry run
8. Load test (k6) against 250K-concurrent targets, tune
9. Cutover plan + App Store submission

## Scale notes (250K concurrent)

- Postgres: PgBouncer pooling (built into Supabase), read replicas when needed.
- Realtime at very high concurrency = Supabase enterprise conversation around ~50K;
  architecture above (chat-only websockets) keeps the connection count honest.
- The feed being pull-based (not websocket) is what makes 250K feasible.
