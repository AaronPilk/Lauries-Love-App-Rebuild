# Laurie's Love Rebuild — Independent Engineering Review

> **FIX-PASS ADDENDUM (same day, 2026-07-06):** the following findings were
> remediated after this review was written — verified by tsc (197→194 errors,
> none new) and the adapter jest suite (5/5):
> Critical account-deletion ordering (deleteAWS now runs first, edge function
> reachable, fallback-deactivate surfaces a toast); exact-GPS exposure
> (migration `coarsen_profile_coords_v1`: 2dp write-time trigger + backfill,
> verified live — diagnosis visibility intentionally kept per product
> decision); Media & Docs video (real signed URL to the player); chat history
> truncation (append-after-send + reachedStart reset); group-chat cold-cache
> blank screen (getChannels retry + catch-up effect); send-failure silent text
> loss (composer restore + toasts, both screens); group notification fan-out
> (recipients resolved at send time via getGroupMembers); feed keyExtractor
> (item.url); leaveGroup error check; group cover photo wired end-to-end
> (migration `create_group_cover_v1`); realtime channel topics unique per
> subscriber; mock-mode shim landmines removed (all reachable sdk.* fall-
> throughs deleted from MessagesTabChat, MessagesTabChatGroup,
> MessagesTabMain, useFriendsUserDB — shim now referenced only by the provider
> [verified unreachable] and type-only imports); repo↔DB drift reconciled
> (missing revert migration committed + version-mapping table in
> supabase/migrations/README.md).
> Still open: everything in §1B blocked on external accounts, device QA
> (0/31), and the migration/password-reset rehearsal.

**Reviewer:** Senior mobile engineering (independent pass)
**Date:** 2026-07-06
**Scope:** READ-ONLY. Supabase data layer (`app/src/services/supabase/`), providers, group/chat screens, `supabase/migrations/`, edge function, live DB (`iwbfsbriippzmdyrsmsu`). Original agency app spot-checked only to ground "before" scores.
**Method:** Migrations read line-by-line; 10 flows traced screen→provider→service→DB; live DB schema + RLS + advisors queried directly; shim residue counted; original app spot-checked.

---

## 0. Headline

The re-platform is real and mostly well-built. The RLS architecture is genuinely good, the PII split is real, and the hard concurrency problems (atomic DM/group creation, dedup'd realtime, keyset pagination) are solved correctly. This is a legitimate 7-ish codebase, not a soft 8.

But two things gate it, and neither is on your known-open list:

1. **CRITICAL — "Delete account" never deletes the auth user.** The edge function is correct but unreachable: `deleteUserDB()` signs the session out *before* `deleteAWS()` runs, so `currentUserId()` returns null and the `delete-account` invoke is skipped. This is the exact bug you believe you fixed; the fix re-introduced it by ordering the two calls wrong. Legal/App-Store/GDPR exposure for a health app. Confirmed in code, not theory.
2. **HIGH — the base `profiles` table leaks diagnosis + exact location of every user to any signed-in user.** You moved email/phone/push_token into `profiles_private` (verified, real). But `diagnosis_type_ids`, `diagnosis_year`, full-precision `latitude`/`longitude`, `last_name`, `gender`, `age_range` all remain on `profiles`, whose SELECT policy is `using (active)`. Any authenticated user can `GET /rest/v1/profiles?select=first_name,last_name,diagnosis_type_ids,diagnosis_year,latitude,longitude` and reconstruct, for all ~10k users, who has which diagnosis and where they live to full GPS precision. This **defeats** the map-coordinate coarsening and the group-roster privacy migration you shipped — both are bypassed by reading the table directly. For a cancer-support community this is the single most serious finding in the rebuild.

Everything else is polish, maintainability, or launch-ops. Details below.

---

## 1. Findings

### 1A. NEW findings (not on your known-open list)

| Sev | Location | Finding | Fix |
|---|---|---|---|
| **Critical** | `ProfileTab/ProfileTabMain/ProfileTabMain.tsx:180-181` + `providers/UserDBProvider/UserDBProvider.tsx:233` + `services/supabase/supabase.auth.ts:114-132` | "Delete account" never calls `delete-account`. `deleteUserDB()` runs `signOutAWS()`→`supabase.auth.signOut()` first; then `deleteAWS()`→`sbDeactivateAndSignOut()`→`currentUserId()` reads the now-cleared session, gets `null`, skips the `functions.invoke`. Auth user survives; profile only set `active=false`. | Call `deleteAWS()` **before** `deleteUserDB()`, or drop `deleteUserDB()` entirely (auth-delete FK-cascades the profile). Add a post-condition check. |
| **High** | live `profiles` table + `initial_schema_v1.sql:278` (`profiles_select using (active)`) | Diagnosis (`diagnosis_type_ids`, `diagnosis_subtype_ids`, `diagnosis_year`), full-precision coords, `last_name`, `gender`, `age_range` readable for **all** users by any authenticated user via direct PostgREST select. Defeats `users_in_bbox` coordinate coarsening (`perf_privacy_v2`) and `group_roster_privacy_v1`. `diagnosis_type_ids` FKs resolve against world-readable `value_definitions`, so IDs → diagnosis names. | Split diagnosis + precise coords the same way you split PII: move to an owner-only / friends-only table, or gate them behind a narrowed view + RPC. At minimum, coarsen stored coords and drop precise lat/lng from the base table. |
| **High** | `MessagesTab/MessagesTabMediaAndDocs.tsx:201-210` → `components/PhotoMediaMessagesTab` → `OpenFileModal.tsx:55-97` | Video open in Media & Docs plays the **JPEG thumbnail** with a video mime type (black player); the real signed video URL (`video.url`) is dropped. In-chat video path is correct (`MessagesTabChat.tsx:425-435`), only Media & Docs is broken. | Pass `video.url` for playback; use thumbnail only for the grid tile. |
| Medium | live DB vs `supabase/migrations/` | **Repo↔DB drift.** Live DB has 20 applied migrations; repo has 19 SQL files. Live-only migration `20260706020230_revert_postgis_keep_btree_bbox` is **not committed**. Five committed files also carry filename timestamps that differ from the applied `version` (e.g. repo `20260705180000_attachments…` = applied `20260705171158`; repo `20260705234500_profiles_private…` = applied `20260706004030`). The repo is not a faithful mirror of the deployed schema — undercuts "migrations are the source of truth." | Commit the missing revert migration; reconcile filenames to applied versions; add a CI check (`supabase db diff`) that fails on drift. |
| Medium | `providers/SendbirdChatProvider/SendbirdChatProvider.tsx:179-183` (`MessagesTabChat`), `:167-171` (`MessagesTabChatGroup`), `useFriendsUserDB.tsx:92-94` | **Mock-mode landmines.** Guards are written `if (SUPABASE_ENABLED){…return}` with the legacy `else` = mock path still hitting the shim. In mock mode the dead Proxy gets stored into `channel` state (function-typed value → "Functions are not valid as a React child" render crash) and `isFriend` becomes permanently truthy. Harmless in supabase mode; a trap for any dev who runs mock. | Finish the dead-code sweep in these 4 files, or make guards `if (!SUPABASE_ENABLED) return` early. |
| Medium | `MessagesTab/MessagesTabChat/MessagesTabChat.tsx:348` + `SendbirdChatProvider.tsx:397-402,101,110` | **Chat history truncation after send.** `sendMessage`→`loadMessages` replaces the thread with the newest 50; if the user paged up, older messages are discarded and `reachedStartRef` is never reset, permanently disabling "load older" for that mount. | After send, append the sent message instead of reloading page 1; reset the reached-start ref. |
| Medium | `HomeTab/HomeTabMain.tsx:368-371` | Feed `keyExtractor` reads `item.channelUrl` but posts carry `url` (mapper `social.ts:75`); every key falls back to `post-${index}`, causing row recycling/animation glitches on re-sort (Trending/New). | Key off `item.id` (or `item.url`). |
| Medium | `MessagesTab/MessagesTabChatGroup/MessagesTabChatGroup.tsx:557,147-175` | Group chat opened before the provider cache is warm (push deep-link / cold start) shows a permanent blank screen with no header/back — unlike the DM screen it never re-fetches on cache miss. | Mirror `MessagesTabChat.tsx:174`'s `getChannels()` catch-up on miss. |
| Medium | `MessagesTabChatGroup.tsx:448-456,374-383` + `social.ts:399-401` | Screen reads `channel.members` to fan out group-message notifications, but the group mapper always returns `members: []`, so group message notifications are never generated. Screen-reads-what-mapper-doesn't-provide. | Populate members in the group mapper, or fan out server-side. |
| Medium | `services/supabase/supabase.chat.ts:333` | Realtime channels named `conv-${id}`; two screens on the same conversation (e.g. support chat opened twice) share a topic — `removeChannel` on one unmount can kill delivery for the other. | Namespace the channel per subscriber instance. |
| Medium | `notifications.screen.tsx:104`, `SendbirdChatProvider.tsx:224-226` | Several load paths swallow errors into `console.warn` / never reset `isLoading` → skeletons spin forever or empty-state renders as if the user has no data, on any network blip. | Add error state + retry; reset loading in `finally`. |
| Low | `supabase.storage.ts:133` + `MessagesTabChatGroup.tsx:245`, `PhotoMediaMessagesTab.tsx:62` | 1h signed URLs rendered with `cache:'force-cache'`; threads held in state >1h show broken images until a full refetch. (You list the 1h expiry as known; the force-cache interaction is the new part.) | Re-sign on render or shorten cache; refresh on focus. |
| Low | `MessagesTabChat.tsx:342-357`, `MessagesTabChatGroup.tsx:438-461` | Send failure clears the composer and only `console.warn`s — user's typed text silently vanishes. | Restore text + toast on failure. |
| Low | `MessagesTabCreateGroup.tsx:101-103` | Group description + cover image collected by the UI are silently dropped (service supports `description`). | Pass them through. |
| Low | `social.ts:460-465` (`leaveGroup`) | Delete error unchecked; a failed leave still returns `true` and the UI resets as if it worked. | Check `error`. |
| Low | advisor | `can_notify`, `can_see_post`, `is_group_member`, `is_conversation_member`, `my_tags`, `create_group`, `find_or_create_direct_conversation`, `group_member_counts` are all callable via `/rest/v1/rpc/*` by `authenticated` (Supabase advisor WARN ×8). They only return booleans/counts about the caller, so not a data leak — but they're needlessly exposed API surface. | Fine to leave; note it. Nothing returns another user's data. |

### 1B. Confirmations of your known-open list (verified honest)

| Status | Item | Note |
|---|---|---|
| Confirmed | `supabase.api.ts` god-router | 518 lines, single `supabaseApi(url,config)` dispatch. As described. |
| Confirmed | No true spatial index | `users_in_bbox` is btree range filter; PostGIS reverted (live migration `20260706020230`). Documented. |
| Confirmed | `any` in services layer | 33 occurrences across `services/supabase/*.ts` (chat 12, social 8, api 7, auth 4, adapter 1, storage 1). Your "~29" was close. |
| Confirmed | Shim residue unfinished | 21 executable `sdk.*` sites + 2 property reads across 5 files (SendbirdChatProvider ×9, useFriendsUserDB ×5, MessagesTabChat ×4+2, MessagesTabChatGroup ×2, MessagesTabMain ×1). **All unreachable in supabase mode — verified per site.** Claim holds for supabase; see Medium mock-mode note. |
| Confirmed | Vendor naming debt | `SendbirdChatProvider`, `SendBirdPostsProvider` still named for a dead vendor. |
| Confirmed | Leaked-password protection off | Advisor WARN present. Dashboard toggle. |
| Confirmed | No recorded QA pass | LAUNCH-PLAN 31-item checklist 0/31. |
| Confirmed | Data migration unrehearsed | Live DB holds **23 test profiles**, not 10k. Nothing migrated. |
| Confirmed | Denormalizations landed | `posts.like_count` (trigger), `conversations.last_message_body/sender` (trigger), signed thumbnails, keyset chat cursor, bbox — all present in migrations + services. |
| Confirmed | Chat re-render isolation holds | Main chat provider's memoized value + deps exclude `messages`; `messages` lives only in `chatMessagesContext`. Only 3 screens consume `useChatMessages`. No leak. (Latent: the main context **type** still declares `messages` — a future consumer would read `undefined`.) |

---

## 2. Flow traces (Part 6A)

| # | Flow | Verdict | Call chain (abbrev.) |
|---|---|---|---|
| 1 | Signup → OTP → profile → onboarding | **Pass** | `create-password.screen:96`→`sbSignUp`(`auth.ts:27`)→`verify-email.screen:109`→`sbConfirmSignUp`(`auth.ts:39`,`verifyOtp type:'signup'`)→`createUserDB`(`UserDBProvider:139`)→`POST /users`(`api.ts:337`, upserts `profiles`+`profiles_private`)→onboarding `PUT /users/:id`. Edge risk: redundant re-sign-in at `verify-email:115`; if it fails after OTP is consumed, user can strand on the OTP screen (medium). |
| 2 | Feed → detail → comment → like | **Pass** | `PostsProvider:119 getPosts`→`getFeedPosts`(`social.ts:33`, keyset `lt(created_at)`, `like_count` denorm, `likedByMe` own-reactions-only, batch-signed thumbs)→detail `HomeTabPost:145`→`sendComment`(`social.ts:240`)→`toggleReactionOn`(`social.ts:268` returns `{count,likedByMe}`, no liker arrays). Heart correct on load; feed-card like optimistic **with revert**. Bugs: keyExtractor (medium), comment-heart desync on failed toggle (medium), refeed-on-focus truncates paginated list (medium). |
| 3 | Group join → chat → text → image | **Pass** | `MessagesTabJoinGroup:79 joinGroup`(`social.ts:447`)→`getMyGroupChannels`(`social.ts:374`)→`MessagesTabChatGroup`→`resolveThreadId`(`chat.ts:201`, lazy thread create, 23505 handled)→`sendChatMessage`(`chat.ts:252`)/`sendChatAttachment`(`chat.ts:271`, private bucket, membership-gated). Realtime lifecycle correct. Bugs: cold-cache blank screen (medium), dead notification fan-out (medium). |
| 4 | Group create → details → members → leave | **Pass** | `MessagesTabCreateGroup:93`→`createGroup`(`social.ts:409`)→`create_group` RPC (atomic; name/length/100-member/5-per-hr limits)→`getChannels()` before nav→`getGroupMembers`(`social.ts:432`)→`leaveGroup`(`social.ts:457`). Minor: description/cover dropped; leave error unchecked (both low). |
| 5 | DM create → send → realtime → older history | **Pass** | `MessagesTabCreateChat:84`→`findOrCreateDirectConversation`(`chat.ts:153`)→`find_or_create_direct_conversation` RPC (canonical key, unique-violation fallback — race-free)→`subscribeToConversation`(`chat.ts:326`, UUID-guarded filter, unsubscribe returned)→`appendMessage`(`provider:481`, prepend + dedupe by id, inverted list)→`loadOlderMessages`(`provider:419`, keyset via ref-mirror). Bug: history truncation after send (medium); strict `lt` skips same-timestamp rows (low). |
| 6 | Media & Docs (DM + group, video) | **Partial** | Entry ids correct→`getConversationAttachments`(`chat.ts:297`, mime split, batch-sign, cap 200). Photos/docs fine. **Video open broken** (high) — plays thumbnail, drops `video.url`. |
| 7 | Friend accept AND reject | **Pass** | Accept: `useNotificationsScreen:22`→`PUT /users/:id/friend-requests {accepted}`→`api.ts:263` (addressee-only update). **Reject: `RequestNotification:65`→`PUT {rejected}`→`api.ts:272` DELETEs the pending row** — old accept-on-reject bug is genuinely fixed. Minor: accept not constrained to `status='pending'` (low). |
| 8 | Map viewport / PII | **Pass (RPC)** | `map.screen:177`→`useGetUsersInRegionReq`→`api.ts:299` bbox→`users_in_bbox` RPC returns narrowed projection, coords 2dp, `last_name` null. **Payload the map receives is PII-free.** ⚠️ But see 1A-High: the underlying `profiles` table is directly selectable with full coords + diagnosis, so map privacy is defeated off-screen. |
| 9 | Account deletion | **Fail (critical)** | `ProfileTabMain:180 deleteUserDB()`→signs out→`deleteAWS()`→`sbDeactivateAndSignOut()`→`currentUserId()` null→**`delete-account` never invoked.** Edge function itself (`functions/delete-account/index.ts`) is correct (JWT-only identity, service-role delete). Just unreachable. |
| 10 | Support chat entry | **Pass** | `HomeTabMain:196 handleIntercom`→`findOrCreateDirectConversation(SUPPORT_PROFILE_ID)`→nav to Messages stack. Opens a real DM, does **not** hijack the Messages tab (the original bug). Depends on a seeded support profile (operational). |

---

## 3. Scoring

Scored independently from the code, not adopted from internal numbers. 1–10.

| Category | Before (agency) | After (rebuild) | Justification |
|---|---|---|---|
| **Correctness** | 4 | **7** | Before: shipped and mostly worked at 10k, but non-atomic signup, broken map, and the documented functional bugs. After: 8 of 10 core flows pass, but account-deletion is a hard fail on a legally-required feature, Media&Docs video is broken, and there's a cluster of medium state bugs (history truncation, cold-cache blank screen, feed keys, dead notification fan-out). The engine is right; shipped features still have one critical + one high. Not an 8. |
| **Data access & privacy** | 2 | **7** | Before: committed Firebase private key, hardcoded Maps keys, public `/users` returning all PII, client-trusted `senderId`. Near floor. After: genuinely strong RLS — PII split real and verified, notification/friendship/conversation/roster gates correct, injection guard present, definer functions properly scoped. Capped at 7 by the base-`profiles` diagnosis+exact-coords exposure, which is exactly the class of bug fixed for email/phone but missed for health data. Fix that one hole and this is an honest 8.5. |
| **Performance & scale** | 3 | **7** | Before: fetch-all-users map, 4-relation eager loads on every users query, N+1, refetch-everything. After: keyset pagination, denormalized counts, bbox, signed thumbnails, verified re-render isolation — the right moves. Held to 7 by the god-router, no spatial index, feed per-post comment-count subquery, `/users` count:exact+limit-500 (no keyset), and the fact that it's **never been run against real volume** (23 rows live). Architecturally ready for 10k, unproven for 250k. |
| **Code structure & maintainability** | 5 | **6.5** | Before: conventional NestJS+RN, navigable, thin services, ~3 test files. After: clean layering and a genuinely well-designed single-source backend config, but a 518-line god-router, 33 `any` in the data layer, a 197-error `tsc` baseline, 21 dead `sdk.*` sites left in delicate files, mock-mode landmines, and vendor naming debt. Real friction for an inheritor. |
| **Overall build quality** | 3.5 | **7** | Legitimate re-platform, correct on the hard problems, let down by one critical correctness bug, one high privacy bug, and maintainability debt. A real 7 — I agree with your ~7.5 direction but land half a point lower because the deletion bug and the profiles exposure are both in shipped, security-relevant paths. |

**Two single scores (rebuild only):**

- **Would you hand this to another developer to maintain? — 6.5.** Docs are excellent, the config layer is exemplary, and the data-layer boundary is clear. But a new dev will trip over: the god-router, the shim residue + mock-mode Proxy traps, 197 type errors (signal drowned in noise), and providers still named for a vendor that's gone. Workable, not smooth.
- **Operationally ready to replace the live 10k app TODAY? — 3.** Below your internal 4. A confirmed critical deletion bug, 0/31 QA, an **unrehearsed** migration (live DB has 23 rows, not 10k), the forced-password-reset-for-10k-users problem with no email-deliverability test, payments/push/email all unwired, broken video, and repo↔DB drift. This is not a today swap. It's a 3–4 week hardening job from ready.

Where I **agree** with internal: performance ~7.5→I say 7 (close); structure ~7.5→I say 6.5 (you're slightly generous — the type-error baseline and god-router are heavier than a 7.5 implies); operational ~4→I say 3.
Where internal is **too generous:** correctness 8–8.5 and privacy 8–8.5. Both miss a shipped-path defect (deletion; profiles diagnosis/coords). Neither can honestly sit at 8+ until those two are closed. Corrected, correctness→8 and privacy→8.5 are fair.

---

## 4. Fix-first (in order) — raises Correctness and Operational-readiness (the two lowest-justified)

1. **Fix account deletion.** Swap the call order in `ProfileTabMain.onPressDelete` (`deleteAWS()` first) or drop `deleteUserDB()`. Add an assertion that `delete-account` returned 200. Manually verify the auth user is gone in the dashboard. (Critical, ~1 hr.)
2. **Close the `profiles` diagnosis + exact-coords exposure.** Move `diagnosis_*`, precise `latitude`/`longitude`, `last_name`, `gender`, `age_range` behind a friends/owner-gated table or a narrowed view; coarsen stored coords. Re-verify with a simulated-JWT select as a stranger. (High, ~half day.)
3. **Fix Media & Docs video** (`MessagesTabMediaAndDocs.tsx:201-210`) to pass `video.url`. (High, ~30 min.)
4. **Run the LAUNCH-PLAN 31-item QA on a device** and record it. This is where the medium state bugs (history truncation, cold-cache blank screen, keyExtractor, dead notification fan-out) get caught and burned down. (Blocks any "ready" claim.)
5. **Rehearse the data migration end-to-end** into a staging project with a full 10k dataset, and load-test the forced-password-reset email send (deliverability + rate limits) before committing to a cutover date. Reconcile repo↔DB migration drift and add a `supabase db diff` CI gate while you're in there. (Blocks cutover.)

---

## 5. Verdict

**Conditional yes.** This rebuild is fit to replace the live app **after** the known-open items *and* the two new blockers above are closed — the architecture is sound, the security model is well-conceived, and the hard problems are solved correctly. It is not fit to swap today, and the internal correctness/privacy scores of 8+ are half a point too kind because both categories still contain a defect in a shipped, security-relevant path.

**Top three risks, in order:**
1. **Account deletion silently doesn't work** — a legal/App-Store/GDPR liability that currently ships as "fixed."
2. **Every user's diagnosis and exact location are readable by anyone who signs up** — the map/roster privacy work is real but bypassable at the table level; unacceptable for a cancer-support app until closed.
3. **Un-rehearsed 10k migration + forced password reset** — the highest-variance part of cutover has never been tested, and a botched reset email blast could lock out the entire user base on day one.

Fix 1 and 2 this week, prove out 3 in staging, run the QA pass, and this is a defensible 8 across the board and a real replacement candidate.
