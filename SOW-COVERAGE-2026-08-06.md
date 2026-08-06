# Laurie's Love — SOW Coverage Check (7/29 Scope vs. Current Build)

**Date:** 2026-08-06 · **Method:** code-level audit of `app/` (mobile), `web/` (web + admin), and `supabase/migrations` + `functions`. Only features with real code are marked Done. No assumptions.

**Legend:** ✅ Done · 🟡 Partial (some code, incomplete/not wired) · ❌ Missing (no code)

---

## Bottom line

The **communication + community backbone is real and running on device** (auth, messaging, friends, groups, support, feed read/write, map with privacy, admin role-gating, moderation queue, feature-flag table). What's **not built yet** falls into two buckets:

1. **Gated on client input / keys** — Stripe, SendGrid, PostHog key, AI-moderation (OpenAI) key, data-migration access. These are integrations we can't finish until the client hands over accounts/keys/decisions. This is expected per the SOW's own "Discovery" milestone.
2. **New/expanded community features not yet coded** — mentions (@), hashtags (#), post search, hierarchical map clustering, sponsorship page, welcome automation, and several admin pages (group mgmt, branding, custom fields, platform config, analytics).

Roughly: **core platform ~ built; the "expanded features + paid integrations" layer is the remaining work.**

---

## Mobile App (iOS/Android)

| SOW item | Status | Notes |
|---|---|---|
| Registration, login, email verification, password reset, account deletion | ✅ | `services/supabase/supabase.auth.ts`; account deletion via `delete-account` edge fn |
| International login | 🟡 | Backend supports it; "app store pending" per SOW |
| Member profiles (photos, friends) | 🟡 | Photos + friend indicators shown; **joined date not displayed**, **no "posts by member"** |
| Community wall: public/private posts, photo attach, likes, comments | 🟡 | Create/like/comment done; **post deletion missing**; "private" = group-audience, not per-post |
| User mentions (@) | ❌ | No code anywhere |
| Hashtags (#) + searchable hashtags | ❌ | No code anywhere |
| Search across community posts | ❌ | Only member search + conversation search exist |
| Profile shows all posts by a member | ❌ | No author-filtered post query |
| Groups: browse, join, cancer-specific listings, group chat | ✅ | `getRecommendedGroups` uses diagnosis terms; group chat wired |
| Group search | ❌ | Not found |
| Private messaging: 1:1, group, photo/video/doc attach, realtime, chat notifs, search | ✅ | Fully wired in `supabase.chat.ts` + realtime subscriptions |
| Friends: request, accept/decline, indicators, on profiles | ✅ | Via `friendships`; one dead helper stub but accept works |
| Interactive map | 🟡 | Individual markers + bbox fetch + **coord coarsening (privacy) done**; **hierarchical state→city clustering + member-count bubbles NOT built** |
| Notifications: push, in-app, chat, interaction | 🟡 | All present **except mention notifications** (mentions unbuilt) |
| Donations: one-time, monthly recurring, calculator, "What Donations Cover" | 🟡 | Full UI incl. recurring toggle + calculator + education copy; **Stripe not integrated** (posts to backend REST, processing opaque) |
| Media / document library | 🟡 | Exists only as **per-conversation** chat attachments, not a standalone library |
| Support center + ticket creation | ✅ | `supabase.support.ts` + screens |
| Sponsorship landing page (tiered) | ❌ | Zero code in mobile |
| Automated welcome messages for new members | ❌ | Not implemented |
| Navigation: bottom nav, quick-action sheet, menu | ✅ | Wired |

---

## Web Application

| SOW item | Status | Notes |
|---|---|---|
| Login / auth | ✅ | `pages/Login.tsx`, session-gated routes |
| Community feed | 🟡 | **Read-only** — displays posts/likes; can't create/like/comment from web |
| Groups (browse/join) | ✅ | Join/leave writes `group_members` |
| Messages (realtime) | ✅ | Thread + realtime INSERT subscription |
| Map (Leaflet/OSM, bbox) | ✅ | Loads via `users_in_bbox`; clustering is fast-follow |
| Donate (one-time + recurring, Stripe) | 🟡 | Full UI; **edge function not connected → always shows "Stripe pending"** |
| Notifications | ✅ | In-app read/mark-read (push is separate) |
| Sponsorships page | 🟡 | 3 tiered cards but **hardcoded + dead CTA buttons** |
| Profile (with private PII) | 🟡 | **Read-only** — shows own email/phone from `profiles_private`; no edit |

---

## Admin Control Panel

| SOW item | Status | Notes |
|---|---|---|
| Auth/role gating (owner\|agent) | ✅ | `ProtectedRoute requireStaff`, roles from `support_staff` |
| Member mgmt: search, filter, alpha sort | 🟡 | Search + alpha sort done; **no status/role filters** |
| Moderator + admin roles | 🟡 | Only **owner\|agent** modeled; **no distinct "moderator" role** |
| Staff account management | 🟡 | Inline role assign only; **no dedicated invite/create/deactivate flow** |
| Support inbox | ✅ | Reads `support_tickets`, status open/in_progress/closed |
| Community/group management | ❌ | No admin groups page (fast-follow comment only) |
| Moderation queue (approve/reject) | ✅ | Reads `moderation_queue`, writes status + reviewer |
| Feature toggle system (9 modules) | 🟡 | Toggle UI + `platform_features` table exist; **no enumeration of the 9 modules; migration not confirmed applied; unverified end-to-end** |
| Branding & content settings | ❌ | No page |
| Custom profile field management | ❌ | No page + **no schema support** |
| Platform configuration | ❌ | No page/route |
| Dashboard & Analytics (DAU/MAU/retention/session) | 🟡 | **Live counts only** (members/posts/groups/convos); **DAU/MAU/Day1-7-30 retention/session all hardcoded "—"** pending PostHog |

---

## Technology, Backend & Ownership

| SOW item | Status | Notes |
|---|---|---|
| React Native (one codebase iOS+Android) | ✅ | Runs on device (confirmed 2026-08-06) |
| React web, shared functionality | ✅ | `web/` app live |
| PostgreSQL, DB-level security (RLS) | ✅ | 98 RLS policies; 27 migrations |
| PII split (profiles_private) | ✅ | email/phone/push_token owner-only |
| **AES encryption for sensitive data** | ❌ | `pgcrypto` loaded but **unused**; protection is RLS + column-split + Supabase disk encryption, not app-level AES (open decision) |
| platform_features (licensing toggles) | ✅ | Table + 11 seeded keys |
| support_staff + roles + support_tickets | ✅ | Present + last-owner guard |
| moderation_queue table | ✅ | Exists (but nothing populates it yet) |
| **AI Moderation edge function** | ❌ | Only `delete-account` fn exists; **nothing auto-reviews/flags** |
| **Stripe (one-time + recurring)** | ❌ | No Stripe code; `payments` defaults to authorize_net |
| **Recurring donation schema** | 🟡 | Only an enum flag `ONE_TIME/RECURRING`; **no subscription table / billing state** |
| **SendGrid email (migrate from Lambda)** | ❌ | Not implemented (provider decision open) |
| **Push notification backend / fan-out** | 🟡 | Client + token storage done; **no server-side sender** |
| Map coarsened coords + bbox | ✅ | `users_in_bbox`, 2-decimal coords, last name hidden |
| Custom profile fields (schema) | ❌ | Fixed columns; no custom-field mechanism |
| PostHog analytics | 🟡 | SDK in `package.json` but **disabled (no key)**; no DAU/MAU tables |
| **Data migration tooling** | ❌ | `legacy_id` landing columns exist, but **no import scripts at all** |

---

## What blocks the biggest gaps (needs client input)

- **Stripe account + keys** → donations (one-time + recurring), web donate, subscription schema.
- **SendGrid account + key** → transactional email, password-reset emails at launch.
- **OpenAI (or moderation) key** → AI moderation function to feed the queue that already exists.
- **PostHog project key** → analytics dashboard (DAU/MAU/retention/session).
- **Access/export from the old system** → data migration tooling + rehearsal.
- **Discovery decisions** → custom profile fields model, branding settings, moderator role definition, AES-vs-RLS encryption stance.

## What we can build now without waiting on the client

Mentions (@), hashtags (#) + hashtag search, community post search, "posts by member" on profiles, post deletion, group search, hierarchical map clustering + member-count bubbles, sponsorship page + tiers, welcome-message automation, admin group management, branding/settings/custom-field/platform-config pages, feature-toggle module enumeration, web feed write actions (post/like/comment) + profile edit.
