# Laurie's Love V2 — Test Checklist, Env Wiring, and Live-App Replacement Plan

Updated: 2026-07-02 (post full-audit pass)

## PRIME DIRECTIVE

**Nothing in this plan touches the live app until the explicit cutover step.**
Hard rules until then:
- NEVER log into, rotate, or edit anything in the agency's consoles
  (their AWS, Cognito, Sendbird, Firebase, Authorize.Net, Expo/EAS, Sentry).
- All data extraction is READ-ONLY exports, performed against backups/replicas
  where possible.
- All new services live in YOUR accounts (Supabase "Lauries Love" org, your
  Firebase project, your Google Cloud, your EAS).
- The rebuild keeps its own bundle id until App Store transfer day.

---

## 1) AUDIT RESULTS (2026-07-02, 3-agent pass)

### Fixed immediately
- RLS bug blocking conversation creation (chat now verified end-to-end in DB)
- PostgREST filter injection guard: UUIDs validated before interpolation
- Payments stub now FAILS HONESTLY instead of faking success
- Payload size limits in Postgres (posts/comments/messages/notifications/bio)
- Map marker square; groups Join lights up in place

### Remaining build items (in order)
1. **Media pipeline (Supabase Storage)** — avatars + post images.
   Buckets: `avatars`, `post-images` with owner-write/public-read policies.
   Replace `uploadFileStorageAmplify` + `/users/signed-url` path.
2. **Group chat threads** — conversations keyed by group_id (find-or-create on
   first open; members = group members). Currently groups open to an empty
   thread (no crash).
3. **Notifications accept-friend** — strip last Sendbird calls from
   useNotificationsScreen.handleConfirm (REST parts already work).
4. **Payments edge function** — Authorize.Net (or Stripe) charge + insert into
   payments table with service role. Donations disabled (honest error) until then.
5. **Push notification fan-out** — edge function on notifications insert ->
   FCM/APNs via your own Firebase project.
6. **Rate limiting** — edge-function proxy or pg policies for posts/comments/
   reactions/notifications (spam protection before public launch).
7. Cleanup: remove @sendbird/*, CometChat, aws-amplify packages once the
   above land (kills the UIKit warnings and shrinks the bundle).

### On-device test checklist (run in supabase mode after each build)
- [ ] Sign up new account (unique email) -> lands on Community Wall
- [ ] Profile row appears in Supabase Table Editor with all onboarding fields
- [ ] Sign out -> sign back in -> session persists after force-quit
- [ ] Supporter/caregiver signup: "Have you been diagnosed?" Yes/No works
- [ ] Connect list shows 21 users; map shows pins on Apple Maps tiles
- [ ] Friend request: send from card -> row in friendships (pending)
- [ ] Feed: posts load; pull-to-refresh; open post -> post + comments
- [ ] Write comment -> appears + row in comments table
- [ ] Like post -> heart fills -> row in reactions; unlike removes it
- [ ] Create post -> appears on wall + row in posts
- [ ] Groups: Join lights up "Joined" in place; group appears in Messages
- [ ] Send message from a user card -> chat opens -> message sends
- [ ] Second device/simulator as testuser1 -> reply -> arrives LIVE on phone
- [ ] Notifications screen shows like/comment notifications
- [ ] Donate: shows honest "not enabled" error (until edge function)
- [ ] Release build: tab switches feel instant (the real perf verdict)

---

## 2) ENV WIRING — SAFE KEYS (all NEW accounts, zero agency overlap)

| Service | Action | Env / location |
| --- | --- | --- |
| Supabase | DONE | EXPO_PUBLIC_SUPABASE_URL / _KEY in app/.env |
| Firebase (push) | Create YOUR project `laurieslove-v2`; add iOS app with
  com.aaronpilk.laurieslove; download GoogleService-Info.plist +
  google-services.json into the repo (replaces agency files, kills the
  bundle-id mismatch log) | native files |
| Google Maps (Android + optional iOS) | New key in YOUR Google Cloud,
  restricted by bundle id/SHA1 | EXPO_PUBLIC_MAP_KEY_VALUE + native manifests |
| Expo/EAS | `eas init` under YOUR expo account -> new project id; re-enable
  expo-updates with the new URL when OTA is wanted | app.json + Expo.plist |
| Authorize.Net | Your own (or the org's own) account; SANDBOX first; keys live
  ONLY in the edge function secrets (never in the app) | supabase secrets |
| Sentry (optional) | Your org + DSN; re-enable upload with your auth token | .env + .xcode.env |
| PostHog (optional) | Your project key | .env |
| Facebook/Intercom | Decide keep-or-kill. If kill: remove SDKs (perf win).
  If keep: your own app ids | app.json/native |
| Apple Developer | Your team already signs the build ✓ | — |

Order: Firebase -> Maps -> EAS (these unlock full native function), then
payments sandbox, then optional analytics.

---

## 3) DATA TRANSFER + LIVE-APP REPLACEMENT CHECKLIST

### Phase A — Access + read-only exports (needs agency cooperation, zero risk)
- [ ] Request from agency (read-only): MySQL dump (or replica access),
      Cognito user pool CSV export, Sendbird data export (their export API),
      S3 bucket listing + copy access for media.
- [ ] Store exports encrypted; never in the repo.

### Phase B — Staging migration (dry run, your infra only)
- [ ] Create a SECOND Supabase project `lauries-love-staging`.
- [ ] Write import scripts (Node): users -> auth.users + profiles (legacy ids
      preserved in legacy_id/legacy_cognito_id), friendships, value
      definitions reconciliation, Sendbird channels/messages -> posts/comments/
      conversations/messages, S3 media -> Supabase Storage.
- [ ] Cognito passwords CANNOT be exported: plan = migrated users get a
      "set your new password" email/flow on first login (standard practice).
- [ ] Run import -> row-count + spot-check validation report.
- [ ] Point a dev build at staging; click through the test checklist with
      REAL (copied) data.

### Phase C — Hardening + scale proof
- [ ] Edge functions live: payments, push fan-out, rate limits.
- [ ] Load test (k6): login storm, feed reads, chat inserts at target
      concurrency; tune indexes/pooling; decide Supabase plan tier.
- [ ] Security re-audit + advisor clean.

### Phase D — Cutover (the ONLY step that touches the live product)
- [ ] App Store path decision:
      (1) Agency transfers the existing App Store listing to your Apple
          account -> ship V2 as an UPDATE (users just update; best UX), or
      (2) New listing under your account + sunset the old app (fallback).
- [ ] Freeze window agreed with the org (announce read-only day in-app/socials).
- [ ] Final delta export -> final import -> validation.
- [ ] Submit V2 build (bundle id matches chosen path) -> phased release.
- [ ] Old infra stays UNTOUCHED and running for 30 days as rollback, then the
      org (not us) decommissions agency services.

### Rollback plan
Old stack is never modified, so rollback = stop the phased release / re-point
users to the old app version. No destructive step exists anywhere above.
