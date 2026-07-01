# Rebuild Plan — Fix Checklist

Every item traces to the audit. Checked = done in this repo.

## P0 — Security / clean-slate keys
- [x] Gitignore committed secrets (Firebase key, GoogleService-Info, .env, .p8) so they don't enter this repo's history
- [x] **Strip ALL agency keys/credentials for a clean rebuild** — deleted Firebase admin key + GoogleService/google-services configs; replaced Google Maps key, Facebook app ID/token, Intercom SDK keys, CometChat key, EAS project binding, Sentry org, and DB/Cognito example values with `YOUR_*` placeholders; removed agency Swimm docs. You plug in your own service keys later.
- [ ] Move Sendbird from a shipped master token to per-user backend session tokens (`api` issues token, `app` consumes)
- [ ] Remove hardcoded CometChat key + dead CometChat client
- [ ] Lower Sentry/PostHog sampling from 1.0

## P1 — Signup 500 (backend)
- [ ] Make `POST /users` idempotent (get-or-return by cognitoId); map `ER_DUP_ENTRY` → 409
- [ ] Stop double-wrapping errors in service + controller; let global filter classify
- [ ] Add `@IsOptional()` to `geoLocation`; fix `@ValidateNested({ each: true })` misuse
- [ ] Orphaned-Cognito repair path on login

## P1 — Map (app)
- [x] `initialRegion` seeded from user location, tight delta (not whole-US)
- [x] Delete Android focus US-reset effect (now returns to user location)
- [ ] `tracksViewChanges={false}` after first paint; remove per-marker onLayout timers; memoize markers
- [ ] Marker clustering
- [ ] Backend `/users/nearby` endpoint + client uses it

## P1 — Performance quick wins (app)
- [x] React Query global `defaultOptions` (staleTime, gcTime, refetchOnWindowFocus:false)
- [ ] Memoize context values across providers; split UserDBProvider hot state
- [ ] Stop fetching whole users table on 4 screens

## P2 — Backend scale
- [ ] `maxLimit` on unbounded CRUD; paginate events
- [ ] Drop eager relations on User CRUD
- [ ] Add indexes: user.email, friend-request sender/receiver, payment/notification FKs
- [ ] Move Firebase/S3 off the request path (queue/fire-and-forget)
- [ ] Batch subscription cron with bounded concurrency

## P2/P3 — App polish
- [ ] FastImage for remote images; real server-side thumbnails
- [ ] Virtualize friends/suggested-channels lists (FlatList)
- [ ] Batch Sendbird friend-status calls
- [ ] Fix payment hooks to React Query v5 syntax
- [ ] Remove CometChat + consolidate to one UI kit

## Mock mode (to build/test in Xcode now)
- [ ] Mock API client (intercept axios / React Query) returning fake data
- [ ] Bypass/stub Cognito auth in mock mode
- [ ] Stub Sendbird/Intercom/PostHog init so the app boots without live keys
