# Laurie's Love — Rebuild Status & Handoff Brief

**For:** [Partner] → the Laurie's Love owners
**From:** Aaron Pilkington (Skyway Media)
**Date:** July 5, 2026

---

## Where we stand in one line

We rebuilt the Laurie's Love app on a modern, owned backend, it builds and
runs on device, and four independent audit passes put it at roughly **7.5/10
overall — up from about 3.5/10 for the current live (agency) app.** It's ready
for a controlled data migration and cutover after a short punch-list.

---

## What this actually means

The version in the App Store today was built by an outside agency on rented
infrastructure — Sendbird for chat and the feed, AWS Cognito for login, a
separate server + database for data, and S3 for images. Every one of those is
a monthly bill and a vendor we don't control. It also shipped with real
problems: a private server key and Google Maps keys committed into the code
(a security exposure), a map that downloaded every user in the database at
once, and a signup flow that could leave orphaned accounts.

We rebuilt the entire backend onto **Supabase** — one platform that handles
login, database, real-time chat, and file storage — while keeping the app's
existing screens intact. Users won't see a different app; they'll see the same
app running on infrastructure we own, that's faster, cheaper, and more secure.

---

## Independent audit scorecard (1–10)

Graded by four separate specialist review passes, each comparing the original
agency code against our rebuild, with file-level evidence.

| Area | Original (live) app | Our rebuild |
|---|---|---|
| **Do the features work correctly** | 4 | 8.5 |
| **Security & data privacy** | 2.5 | 7.5 |
| **Speed & readiness to scale** | 2.5 | 6.5 |
| **Code quality & maintainability** | 5 | 6.5 |
| **Overall** | **~3.5** | **~7.5** |

The original scored near the floor on security specifically because it had a
**live server private key and API keys committed into the source code** — a
serious exposure that alone caps a security grade. Our rebuild has zero
secrets in the code, database-level access rules on every table, and a
privacy model built for health data.

---

## What we rebuilt (the short version)

- **Login & accounts** → Supabase Auth with email verification. Signup is now
  atomic (no more orphaned accounts). Account deletion actually deletes.
- **The community feed** → real posts/comments/likes in our database, with
  infinite scroll that only loads what's on screen.
- **Groups** → create, join, view members, group chat — all on our backend.
- **Direct & group messaging** → real-time chat with photo/document
  attachments, built natively (no Sendbird, no per-user licensing fees).
- **The map** → loads only the users in the visible area instead of everyone,
  and no longer exposes people's email/phone in the process.
- **Friends, notifications, profiles, donations plumbing** → all migrated.
- **Removed entirely:** Sendbird, AWS Cognito/Amplify, CometChat, Intercom —
  the packages *and* their native code. That's a smaller, faster app and a
  shorter monthly bill.

Every database change is version-controlled and committed to the repo, so any
developer can stand up an identical backend.

---

## The money

**Vendor cost, monthly:**

| | Current (live app) | Our rebuild |
|---|---|---|
| Chat (Sendbird) | ~$400–800 | $0 (built in) |
| Auth (Cognito) | ~$50–150 | included |
| Database/server + S3 | ~$150–300 | included |
| Support (Intercom) | ~$75–100 | $0 (or add back later) |
| **Backend platform** | — | ~$25–100 (Supabase Pro) |
| **Monthly total** | **~$675–1,350** | **~$75–200** |

That's roughly **$550–1,150/month saved**, or **$6,600–13,800/year** — and it
scales far better, because we're no longer paying per-user chat licensing.

*(Current figures are market estimates; exact numbers depend on the owners'
actual vendor contracts.)*

**What an agency would charge for this same work:** a full backend
re-platform, native chat build, security remediation, and audit of this scope
is a **$60,000–140,000** engagement running **3–6 months** with a team. We've
delivered the build; what remains is a defined punch-list.

---

## What's left before cutover (the honest punch-list)

Nothing here is a rebuild — these are finish-line items, most of which are
blocked only on account access, not engineering.

**Needs the owners' accounts / keys (fast once we have them):**
1. Payments — switch donations to Stripe (needs a Stripe account)
2. Push notifications — delivery wiring (needs the Firebase project)
3. Transactional email — Resend for verification/reset emails (needs a key)
4. Google Maps production key + one Auth toggle (leaked-password protection)

**One known security item (engineering, needs a staging test):**
5. Lock down direct database access to member email/phone so only the account
   owner can read their own — the *visible* leak is already closed; this
   closes the raw-API path. Straightforward, but we test it in staging first
   so we never risk the live data.

**Performance polish before a big growth push (not blocking a 10k launch):**
6. Serve resized image thumbnails instead of full photos in the feed
7. Return like *counts* instead of full liker lists
8. Chat history "load older messages"

**Housekeeping:**
9. Delete ~800 lines of now-unused legacy code and ~13 unused packages (this
   also clears the bulk of the Xcode build warnings), add automated tests.

---

## What we need from the owners (to finish)

1. **App Store / Google Play transfer** — begin the account-to-account app
   transfer so we can ship the update to existing users.
2. **Access to create/connect:** a Stripe account, the Firebase project, a
   Resend account, and the production Google Maps key.
3. **Green light on the cutover plan** — we migrate real user data into the
   new backend on a staging copy first, verify, then switch over with a
   rollback path. No risk to the live app until the owners approve the switch.

We have not touched anything in the live app or the agency's consoles. All of
this has been built in a separate copy. The live app keeps running untouched
until the owners approve the cutover.

---

## Bottom line for the owners

The app has been rebuilt on infrastructure Laurie's Love owns, it's more
secure and dramatically cheaper to run, and it's graded roughly twice as
healthy as the current version by independent review. The remaining work is a
short, defined list — most of it waiting on account access, not code. With the
transfer started and the accounts connected, we're weeks from a monitored
migration, not months.
