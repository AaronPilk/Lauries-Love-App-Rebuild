# Independent Audit + Debug Request — Laurie's Love Rebuild (V3)

You are performing an INDEPENDENT, adversarial audit AND debug pass. Verify
everything against actual code — never trust the docs or this prompt. Your
job is to find what two prior audits missed. Every finding needs file:line
evidence and a concrete fix. If something is solid, say so briefly and move on.

## What changed since your last audit (verify each claim, don't accept it)

Your V2 findings were remediated and a second pass went further:
1. Backend mode is single-source: EXPO_PUBLIC_BACKEND drives both
   backend.config.ts and mocks/mock.config.ts.
2. The @sendbird/*, aws-amplify, @aws-amplify/*, CometChat, Intercom and
   aws-sdk packages were REMOVED from package.json and the iOS build
   (AppDelegate + pods). Remaining unreachable legacy branches compile
   against app/src/services/legacy-chat.shim.ts (a dead-proxy shim) and
   local types in providers/SendbirdChatProvider/SendbirdChatProvider.types.ts.
3. Email verify uses Supabase OTP (sbConfirmSignUp/sbResendSignUpCode).
4. Notifications force sender_id = auth.uid() client-side AND via RLS.
5. DMs: atomic find_or_create_direct_conversation RPC + unique canonical
   direct_key. UUID validation (assertUuid) on interpolated filters.
6. Feed: keyset pagination wired (HomeTabMain onEndReached + before cursor);
   post JSON emits image_sm/md/lg.
7. Chat attachments end-to-end: private chat-attachments bucket
   (member-gated via is_conversation_member on the first path segment),
   sendChatAttachment, batch signed URLs, Media & Docs on Supabase, sync
   double-tap send lock, camera square-crop removed.
8. Map: users_in_bbox RPC + viewport-scoped useGetUsersInRegionReq.
9. Rate limiting: BEFORE INSERT COUNT triggers on 7 tables.
10. delete-account edge function deployed (JWT-only identity); client wired.
11. ALL schema/RLS migrations are now committed: supabase/migrations/*.sql
    (11 files) — audit the security model from these directly.
12. Profile writes are idempotent upserts.

## Codebases

1. ORIGINAL (agency, live): folder `Lauries Love app rebuild ` (trailing
   space) — LauriesLove-ReactJS-app-main/ + laurieslove-api-main/. Only
   needed to ground BEFORE ratings; a prior audit of it exists at
   `Lauries Love app rebuild /Lauries-Love-Code-Audit.md` (sample-verify).
2. REBUILD (audit target): repo Lauries-Love-App-Rebuild/ — app/src is the
   app; supabase/migrations/ is the DB contract; supabase/functions/ has the
   edge function. Runtime is ONLY mock|supabase; there is no legacy mode.

## Known-open items (do NOT count as new findings; DO verify the list is honest)

Payments/Stripe edge function, push-notification delivery (FCM tokens are
saved; fan-out edge function pending), Resend SMTP, leaked-password
protection toggle, Release-build perf test, final dead-code sweep (~1.5k LOC
unreachable legacy branches + the shim + vendor-named providers), zero unit
tests, image transforms/CDN tiering, chat history pagination past 100
messages.

## Audit + debug scope (prioritized)

1. **Dead-proxy leak hunt (highest value).** legacy-chat.shim.ts returns a
   TRUTHY chainable proxy for sdk.*. Find every screen/provider where, in
   supabase mode, a shim value can reach state, render, navigation params,
   or logic (e.g. sdk.currentUser?.userId short-circuiting ?? chains, or
   unguarded fetch paths with no SUPABASE_ENABLED branch). Check ALL group
   management screens (create/details/members), identity reads in feed/like
   components, and any screen listed in the shim's importers.
2. **Adapter shape mismatches.** For every field a screen reads off posts/
   comments/messages/channels, confirm the supabase mappers
   (supabase.social.ts msg/post shapes, supabase.chat.ts msgShape/
   conversationToChannel) emit it. Known past bug class: detail screens
   reading fields (image_md, channelUrl) the mapper didn't emit. Also check
   REST router PUT/PATCH branches actually honor the request body
   (supabase.api.ts friend-requests PUT).
3. **RLS from the committed migrations.** Hostile-user analysis per table.
   Prior findings to verify fixed-or-open: comments/reactions select
   using(true) vs group-post privacy; conv_members_insert creator-adds-anyone;
   friendships_update requester-self-accept; notifications recipient
   unrestricted; profiles/users_in_bbox over-exposure (email, phone,
   push_token, exact coords). Report anything NEW.
4. **Realtime + pagination scale.** subscribeToConversation lifecycle,
   refetch-per-message pattern, chat 100-message ceiling, unbounded reaction/
   member fetches, signed-URL 1h expiry vs long sessions, video attachments
   (extToMime has no video branch — verify and extend the check to every
   mime-sensitive consumer).
5. **Config integrity.** backend.config.ts vs mock.config.ts precedence for
   INVALID env values (typo'd EXPO_PUBLIC_BACKEND) — can both flags be false
   simultaneously and reach legacy branches? app.json/ios plists consistent
   with removed packages? package.json: list zero-import dependencies.
6. **Secrets + supply chain.** git-tracked files only; verify .env and
   GoogleService-Info.plist are ignored; placeholders in app.json.
7. **Edge function.** supabase/functions/delete-account/index.ts — identity,
   method handling, error leakage.

## Deliverable

1. Findings table: [CRITICAL/HIGH/MED/LOW] [file:line] [issue] [fix].
   Separate NEW findings from confirmations of the known-open list.
2. Flow traces (pass/fail + call chain): signup→OTP→profile; feed→detail→
   comment→like; group join→group chat text+image; group CREATE→details→
   members (walk these three screens explicitly); DM create→send→realtime
   receive; Media & Docs (DM and group entry); friend request→accept AND
   reject; map viewport load; account deletion.
3. Ratings, 1–10, BEFORE (original) and AFTER (current HEAD), scored from
   code before reading anyone's numbers: code structure, performance,
   security, scalability readiness, overall. 2–3 sentences each.
4. Debug appendix: for each CRITICAL/HIGH, the exact minimal patch (diff or
   precise instructions) — this prompt is also a debug request.
5. Verdict: fit to replace the live app after the known-open list? Top 3
   risks.

Constraints: read-only. Focus effort on app/src/services/supabase/*,
app/src/providers/*, the group-management screens, and supabase/migrations/*.
