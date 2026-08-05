# Laurie's Love — Web App

Browser version of the Laurie's Love platform + the staff Admin Console.
Shares the SAME Supabase backend as the iOS/Android apps — accounts, posts,
groups, chats, notifications all synced across surfaces.

Stack: Vite + React 18 + TypeScript + React Router + TanStack Query +
@supabase/supabase-js + Tailwind.

## Run it
```
cd web
cp .env.example .env      # then fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
                          # from the mobile app's app/.env (same project)
npm install               # (or yarn)
npm run dev               # http://localhost:5173
```

## What's scaffolded (working today)
- Supabase auth (email/password sign-in) + session persistence.
- Member web app shell: header nav, protected routes, a live **Community feed**
  reading the real `posts` table (respects the same row-level rules and the
  denormalized like_count).
- **Admin Console** at `/admin` (staff-only, gated by the `staff_roles` table):
  - Dashboard with live member/post/group/conversation counts (retention/DAU/MAU
    arrive with the PostHog integration).
  - **Feature Toggles** UI that reads/writes `platform_features` — the licensing
    layer that turns modules on/off across all surfaces.
- **Feature-flag hook** (`useFeatureFlags`) — every module checks its flag;
  defaults to ON so nothing breaks before the toggle table is applied.

## Depends on the pending admin migration
The admin console fully lights up once
`supabase/pending-migrations/PENDING_admin_foundation_v1.sql` is applied to the
Laurie's Love Supabase project (staff_roles, platform_features, moderation_queue,
support_tickets). Until then: the member app works fully, and the admin pages
render but show empty/placeholder state (no staff access, no flags). See the
repo root `SCOPE-GAP-ANALYSIS.md` for the full build plan.

## Fast-follow (next builds)
Member: groups, messages (realtime), map, profile, donations (Stripe), media,
notifications, mentions/hashtags. Admin: members management, support inbox,
moderation queue, groups, branding/settings, custom profile fields.

Owner: Aaron (web + iOS + backend). Android/Play: Jeremy.
