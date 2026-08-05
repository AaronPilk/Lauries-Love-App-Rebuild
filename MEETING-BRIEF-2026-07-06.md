# Laurie's Love — Dev Meeting Brief

**Date:** 2026-07-06 · **Prepared for:** Pilk (owner) → walkthrough with the developer
**Repo:** `Lauries-Love-App-Rebuild` (branch `main`) · **Supabase project:** `iwbfsbriippzmdyrsmsu`

This is the single doc to talk through in the meeting. Part 1 = the 60-second story. Part 2 = what's built. Part 3 = how it's built (for the dev). Part 4 = what's verified vs not. Part 5 = what's LEFT. Part 6 = the launch checklist. Part 7 = decisions to make together.

---

## 1. The 60-second story

Laurie's Love is a health / cancer-support community app (~10,000 live users) originally built by an outside agency on a rented, multi-vendor stack. We took it over and **re-platformed the entire backend onto Supabase** (one managed system: Postgres + Auth + Realtime + Storage), rebuilt chat and the social feed natively, and removed every paid third-party vendor.

The app the users have today is still the **old agency version**. What we've built is the **replacement**. It runs on infrastructure we control. The goal of this meeting is to align the dev on what's done, what's verified, and the shortlist of things standing between "built" and "live for 10,000 users."

**Honest status in one line:** the build is a solid ~7.5/10 and functionally does what the old app did (plus more); it is **not yet ready to swap under 10k live users today** — the gap is testing, the data migration rehearsal, and a handful of owner-account setups, not more building.

---

## 2. What's been built (plain English)

### The re-platform (the big one)
We replaced **five rented vendors** with **one** system:

| Old (agency) | New (ours) |
|---|---|
| Sendbird (chat **and** the social feed) | Native chat + feed on Supabase |
| AWS Cognito (login) | Supabase Auth |
| MySQL on AWS (database) | Supabase Postgres |
| AWS S3 (photos) | Supabase Storage |
| Intercom (support) | **Native in-app support** (built this session) |
| CometChat (dead leftover) | removed |

That kills recurring vendor bills (Sendbird alone charges per-user for chat) and puts everything under one roof we own.

### Core features working on the new backend
Signup with email verification code · community feed (posts, comments, likes, infinite scroll) · groups (create, join, chat, leave) · 1:1 and group chat with realtime delivery, image/document/video attachments · the members map · friends (add / accept / reject) · notifications · profiles & avatars · real account deletion.

### What we fixed this session (the review + fix pass)
An independent code review found two serious bugs the previous audits missed, both now fixed:
- **"Delete account" never actually deleted the account** — it only deactivated the profile; the real deletion step was being skipped. Fixed. (This was a legal / App-Store / GDPR liability.)
- **Every user's diagnosis + exact GPS location was readable by any signed-in user** via a direct API call — which defeated the map's location-blurring. Now coordinates are blurred to ~1 km at the point they're saved.

Plus a batch of medium bugs: chat history no longer disappears after you send a message; group chat no longer shows a blank screen on cold open; failed messages give your text back instead of silently eating it; group message notifications actually send now; a video in "Media & Docs" plays the video instead of a black screen; and we removed dead legacy code that could crash the app in one internal mode.

### The support system (built entirely this session)
A complete, in-app support flow so owners never leave the app:
- **Users** tap "Contact support" and get a guided 3-step ticket form (category → subject → description) instead of a blank chat.
- On submit it **logs a ticket** and **posts a formatted summary into a support chat**, then drops the user into that chat.
- **Owners/agents** get a staff-only **Support inbox** in their Profile tab: all tickets, filters, counts, and a detail screen to change status, assign, see the reporter's contact info, and **reply in the in-app chat**.
- **Owners** can **add/remove agents** from inside the app (with a safety rule that the last owner can never be removed).

### Small polish
Tapping a person on the map now **highlights their pin** (colored halo, larger, brought to front) so it's obvious who you selected.

---

## 3. How it's built (for the developer)

**App:** React Native 0.79 / Expo SDK 53, React 19, New Architecture, Hermes. Monorepo: `app/` (the RN app), `api/` (the old NestJS API, kept for reference only — not in the runtime path), `supabase/` (migrations + edge functions).

**The adapter strategy (important design decision):** the ~540 legacy screen files were kept largely unchanged. A new data layer in `app/src/services/supabase/*.ts` returns **legacy-shaped objects** (old Sendbird channel/message shapes, old REST response shapes) so the screens render without being rewritten. Trade-off: fast migration, but there's a translation layer to understand. Key files:
- `client.ts` — Supabase client + cached-session helper + a UUID injection guard
- `supabase.api.ts` — a ~500-line "router" that emulates the old REST API surface (the biggest maintainability smell; a known refactor target)
- `supabase.auth.ts` / `supabase.social.ts` / `supabase.chat.ts` / `supabase.storage.ts` / `supabase.support.ts` — the feature services
- `backend.config.ts` — single source of truth for the backend mode (`mock` | `supabase`)

**The database (the real contract):** ~25 version-controlled SQL migrations in `supabase/migrations/`. Every table has Row-Level Security (RLS) — access rules live in the database, not just in app code, so they can't be bypassed by a hostile client. Highlights: PII (email/phone/push token) is split into an owner-only table; group rosters are visible only to co-members (diagnosis-inference protection); chat is members-only; notification senders can't be spoofed; storage paths are owner-scoped. One edge function: `delete-account` (JWT-verified, service-role deletion).

**Testing/tooling:** `tsc` runs with a known ~194-error baseline in the legacy screens (watchable, not yet zero); a small Jest suite covers the data-adapter mappers. No full automated coverage yet.

**Where the dev should start reading:** `PROJECT-STATE.md` (master record), then `supabase/migrations/`, then `app/src/services/supabase/`, then `FABLE5-INDEPENDENT-REVIEW-2026-07-06.md` (the honest review with scores + findings).

---

## 4. What's verified vs. NOT (be honest about this in the meeting)

**Verified:**
- Type-checking runs clean against baseline (no new errors introduced this session).
- Data-adapter unit tests pass.
- The security model was verified by database-level tests (staff see all tickets; a regular user sees only their own; PII is not leakable by direct query).
- The app builds and runs on a physical iPhone (Xcode, this session).

**NOT verified (the honest gaps):**
- **No formal device QA pass.** There's a 31-item checklist in `LAUNCH-PLAN.md` and it's currently **0 checked**. Nobody has methodically walked every flow on a device and recorded it.
- **No end-to-end automated tests** beyond the small adapter suite.
- **The data migration from the live agency system has never been rehearsed.** The live Supabase DB currently holds ~23 test users, not the real 10,000.
- **~194 pre-existing type errors** in legacy screens remain (a watchable baseline, not a gate).

---

## 5. What's LEFT to do

### A. Blocked on owner accounts (not engineering — someone has to create/enable these)
- **Payments** — Stripe account + keys (donations flow).
- **Push notifications** — Firebase delivery (device tokens are already being saved; just needs the send side wired).
- **Transactional email** — Resend (or similar) SMTP, set in the Supabase dashboard (verification codes, password resets).
- **Production Google Maps key** — Android map currently needs a real key.
- **Leaked-password protection** — a single Supabase dashboard toggle.

### B. Engineering polish (real work, not blockers)
- Refactor the ~500-line `supabase.api.ts` "god-router" into per-resource modules.
- Proper spatial index for the map at scale (PostGIS in a dedicated schema) — deferred to the 250k-user phase.
- Feed still runs a per-post comment-count subquery; `/users` search uses count+limit instead of keyset pagination — fine at 10k, revisit before big growth.
- Rename the vendor-named providers (`SendbirdChatProvider`, `SendBirdPostsProvider`) now that Sendbird is gone.
- Drive the ~194 type errors down toward zero over time.

### C. Operational — the actual path to launch (highest risk)
- **Run the 31-item device QA pass and record it.**
- **Rehearse the data migration** end-to-end into a staging project with a full 10k dataset.
- **The forced-password-reset problem:** the old auth system's passwords **cannot be exported**, so at cutover **all ~10,000 users must reset their password**. This needs a plan, user comms, and an email-deliverability load test before go-live. This is the single biggest launch risk — a botched reset-email blast could lock out the whole user base on day one.

---

## 6. Pre-launch checklist (the order to do it in)

1. **Device QA pass** — walk all 31 items, fix what breaks, record it.
2. **Owner accounts** — Pilk/partner create Stripe, Firebase, Resend, Google Maps key; flip the leaked-password toggle.
3. **Wire the account-dependent features** — payments edge function, push send, email — once the accounts exist (small dev tasks each).
4. **Migration rehearsal** — dump the agency data (read-only), load into a staging Supabase, verify counts/mappings.
5. **Password-reset dry run** — test the reset email at volume; confirm deliverability + rate limits; write the user-facing comms.
6. **App Store redeploy** — build, submit, and coordinate the cutover the owners approve.
7. **Cutover** — swap under a maintenance window, with the migration + reset plan proven in staging first.

---

## 7. Decisions to make with the dev

- **Cutover strategy:** big-bang swap vs. phased? Given the forced password reset, how do we sequence comms so users aren't confused/locked out?
- **QA ownership:** who runs the 31-item pass, and do we want a light automated smoke-test suite before launch?
- **Who owns the external accounts** (Stripe, Firebase, Resend, Google) and the timeline to get them created — this is on the critical path.
- **Refactor now or later:** do the `supabase.api.ts` split and provider renames before launch, or after (they're maintainability, not correctness)?
- **Data migration rehearsal date** — this is the long pole; when can we get a real export to practice on?
- **Support staffing:** who are the agents, and do we want email alerts to agents when a ticket lands? (Easy add.)

---

### One-paragraph summary to open the meeting with
"We replaced the whole rented backend with one system we own, rebuilt chat and the feed natively, fixed two serious security/correctness bugs a fresh review caught, and added a full in-app support system. The build is solid and does everything the old app does. What's left before we can go live isn't more building — it's a proper QA pass, creating a few external accounts (Stripe/Firebase/email/Maps), and rehearsing the 10,000-user data migration, whose biggest risk is that everyone will need a one-time password reset at cutover. Let's align on who owns those and a timeline."
