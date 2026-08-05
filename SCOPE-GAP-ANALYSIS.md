# Laurie's Love — Scope of Work vs. Current Build (Gap Analysis)

**Date:** July 29, 2026
**Owner split:** Pilk = Web app + iOS + backend. Jeremy Marshall = Google Play / Android side.
**Shared foundation:** one Supabase backend (Postgres + RLS + Auth + Realtime + Storage) serves iOS, Android, and Web. Everything below builds on it.

Legend: ✅ Done · ◐ Partial (needs finishing/wiring) · ⭕ Net-new (not started)

---

## 1. The honest headline

The **mobile rebuild is roughly 60–65% of the mobile feature list already built and running** on our own Supabase backend. The SOW, though, is much bigger than the mobile rebuild — it adds an entire **Web app**, a full **Admin Control Panel**, a **feature-toggle/licensing layer**, **analytics dashboards**, and **AI moderation**. Those four are net-new platforms, not tweaks.

Reality on the timeline: the SOW's "4-week Platform Build-Out" covers web + admin + toggles + analytics + AI moderation + the remaining mobile features **all at once**. That is aggressive for the team size. The backend we already built is what makes it *possible* (no re-platforming, one data model for all surfaces), but 4 weeks for all of it is the single biggest risk in this SOW and worth flagging to the client as "build-out begins; some modules land in fast-follow."

---

## 2. Mobile apps (iOS + Android) — feature-by-feature

### Accounts & profiles
| Feature | Status |
|---|---|
| Registration, login, email verification, password reset | ✅ |
| Secure account deletion (real deletion via edge function) | ✅ |
| International login support (Apple/Google, app-store pending) | ◐ Apple Sign-In + locale not yet added |
| Member profiles: photos, joined date, friends shown | ✅ |

### Community wall
| Feature | Status |
|---|---|
| Public + private posts, photos on posts, likes, comments, post deletion | ✅ |
| Clickable post cards; profile section showing a member's posts | ✅ |
| Search across community posts | ◐ Local search built; server-side full-text search recommended at scale |
| **User mentions (@)** | ⭕ new |
| **Hashtags (#) + searchable hashtags** | ⭕ new |

### Groups
| Feature | Status |
|---|---|
| Browse groups, join, cancer-specific listings, group chat, group search | ✅ |

### Private messaging
| Feature | Status |
|---|---|
| 1:1 + group conversations, real-time delivery, photo + document attachments, load-older history, search conversations | ✅ |
| Video attachments | ◐ mime handling done; upload/preview polish + size limits to confirm |
| **Chat push notifications** | ⭕ needs Firebase push fan-out (below) |

### Friends
| Feature | Status |
|---|---|
| Requests, accept/decline, indicators throughout, friends on profiles | ✅ |

### Community map
| Feature | Status |
|---|---|
| Viewport loading + coarsened coordinates (exact location never exposed) | ✅ privacy done |
| **Hierarchical clustering: state clusters → city clusters → individual markers + member counts** | ⭕ new — current map is flat markers, not the tiered cluster UX in the SOW |

### Notifications
| Feature | Status |
|---|---|
| In-app notifications, interaction notifications | ◐ in-app works; sender identity secured |
| **Push notifications (chat, mentions, interactions)** | ⭕ needs Firebase service account + a push edge function (device tokens already saved) |

### Donations
| Feature | Status |
|---|---|
| One-time donations, **monthly recurring**, Stripe processing, donation calculator, "What Donations Cover" education | ⭕ new — payments were stubbed with an honest failure; needs Stripe account + a Stripe edge function (one-time + subscription) |

### Other mobile
| Feature | Status |
|---|---|
| Media & document library | ✅ |
| **Built-in support center with support-ticket creation** | ◐ we have support *chat* (DM to a support account); a real *ticketing* model (status, assignment, inbox) is new |
| **Sponsorship landing page with tiered opportunities** | ⭕ new |
| **Automated welcome message for new members** | ⭕ new (trigger on signup) |
| Improved navigation (mobile menu, quick-action sheet, bottom nav) | ◐ existing nav works; the "expanded quick-action sheet" is a UX addition |
| Improved loading/media performance | ✅ (thumbnails, pagination, re-render isolation, dead-code removed) |

---

## 3. Web application (React) — ⭕ NET-NEW (Pilk)

A full browser build with the same member experience, synced accounts/messages/notifications/groups/posts/media, **and** it's the primary access point for the Admin Control Panel. Nothing exists yet, but it reuses the entire Supabase backend and business logic — this is a front-end build, not a new backend. Realistic scope: the community features (feed/groups/chat/profile/map/donations) + the admin portal shell.

## 4. Admin Control Panel — ⭕ NET-NEW (largest new workstream)

Staff-only portal (web). None of this exists yet:
- **Member management:** search, filter, alphabetical sort, view/edit members
- **Roles:** moderator + administrator + staff account management (new `role` on profiles + RLS for staff)
- **Support inbox** (pairs with support ticketing above)
- **Community/group management**, branding & content settings, **custom profile-field management**, platform configuration

## 5. Feature Management / toggle system — ⭕ NET-NEW (the licensing foundation)

Every major module (Map, Donations, Messaging, Wall, Groups, Sponsorships, Notifications, AI Moderation, Support Center) can be enabled/disabled per deployment. This needs a `platform_settings`/`feature_flags` table read by every surface (mobile + web) and gated in the admin panel. It's what makes the app licensable to other orgs without custom builds — worth designing cleanly up front because it touches every feature.

## 6. Dashboard & Analytics — ⭕ NET-NEW

New users, DAU, MAU, D1/D7/D30 retention, session duration, growth. Approach: **PostHog** (already integrated in the app, currently disabled without a key — wire it up) for event capture + retention, surfaced in an admin dashboard. Some metrics (member counts, growth) can also come straight from Postgres.

## 7. AI Moderation — ⭕ NET-NEW

Auto-review posts/comments, flag suspect content into a moderation queue, human admin approves/acts before it's actioned. Approach: an edge function on post/comment insert calling a moderation model, writing to a `moderation_queue` table surfaced in the admin panel. Design for human-in-the-loop (SOW is explicit about that).

---

## 8. Technology alignment — where the SOW differs from our current build

These are worth confirming before build-out so we don't build twice:

1. **Email: SOW says SendGrid.** Our earlier plan (and internal docs) said Resend. **Recommend we standardize on SendGrid** to match the client SOW and the "migrate off Lambda email → SendGrid" language. One provider, wire it into Supabase Auth SMTP + transactional sends. *(Low effort, just pick one — SendGrid per the SOW.)*
2. **"AES encryption for sensitive application data."** We currently protect PII via a column split (owner-only `profiles_private` table) + database-level RLS. The SOW explicitly promises AES encryption at rest for sensitive fields. To honor that literally, add `pgcrypto`/`pgsodium` column encryption on the truly sensitive fields (phone, etc.). **Decision needed:** is RLS + column-split sufficient, or do we implement AES column encryption to match the SOW wording? (Supabase-managed disk encryption already covers encryption-at-rest for the whole DB — we should clarify which the client means.)
3. **Postman API workspace** — ⭕ new deliverable: document the Supabase/edge-function API surface in Postman.
4. **PostHog** — already integrated in code (guarded off without a key). Just needs the key + dashboards.
5. **Stripe** — matches our plan. Needs the account + edge functions (one-time + recurring).
6. **PostgreSQL, DB-level security, RN single codebase, React web** — all match what we've built. ✅

---

## 9. What's blocked on accounts (fast once we have them)
Stripe (donations), Firebase service account (push), SendGrid key (email), Google Maps production key, PostHog key, and the OpenAI/moderation key (AI moderation). Every one of these unblocks a listed feature.

---

## 10. Recommended build sequence (mapped to the SOW milestones)

**Discovery (1 wk):** lock the admin console spec, the feature-flag data model, custom-profile-field model, analytics event list, AI-moderation policy, and the migration plan. Resolve the SendGrid + AES decisions here. Design the `platform_settings`/roles/moderation tables now since everything reads them.

**Platform Build-Out (4 wks — the crunch):**
- *Backend first (shared):* feature-flags table, staff roles + RLS, moderation queue, welcome-message trigger, Stripe edge functions, push fan-out, SendGrid wiring, hashtags/mentions schema.
- *Mobile (iOS Pilk / Android Jeremy):* finish the ◐ items (push, video, quick-action nav, international login) + new mobile features (donations, hierarchical map, sponsorships, support tickets, mentions/hashtags).
- *Web (Pilk):* community web app + admin portal shell + feature toggles + analytics dashboard + moderation queue UI.
- Honest call: web app + full admin panel + AI mod + analytics in 4 weeks alongside mobile is the risk. Recommend prioritizing **admin + feature-flags + analytics** (the licensing story) and letting AI moderation + sponsorships land as fast-follow if the window tightens.

**QA & Migration Rehearsal (1 wk):** the 31-item device checklist (still 0 done), plus the staging migration dry-run — including the forced-password-reset flow at 10k users and SendGrid deliverability at volume.

**Store Submission (1 wk):** Apple (Pilk) + Google Play (Jeremy), privacy disclosures, data-safety forms.

**Launch:** validated migration → password-reset emails → publish mobile + web → monitor.

---

## 11. Open decisions to confirm with the team (short list)
1. SendGrid (SOW) vs Resend (our earlier plan) → **recommend SendGrid**.
2. AES column encryption vs RLS + column-split + managed disk encryption → clarify what the client means by "AES."
3. Support **ticketing** system vs the support **chat** we already have — build the ticket model, or extend chat?
4. Feature-flag granularity — per-org (licensing) from day one, or Laurie's-Love-only first then generalize?
5. AI moderation model/provider + policy (what gets flagged) — needs a written content policy before build.
6. The 4-week build-out — align internally on what's core-launch vs fast-follow before committing the date to the client.
