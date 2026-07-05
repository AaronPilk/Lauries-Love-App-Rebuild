# Internal Max-Agent Audit — July 5, 2026 (post remediation passes 1 + 2)

Four specialist agents (correctness, security, performance/scale, structure)
audited the current HEAD adversarially, file:line evidence required. This is
the honest state of the app AFTER the Codex-audit remediation and the full
Sendbird/Amplify/CometChat/Intercom removal.

## Scorecard (1–10, before = agency code at import, after = current HEAD)

| Area | Before | After | Codex's "after" (pre-remediation) |
|---|---|---|---|
| Correctness (features work as shipped) | 3 | 6 | — |
| Security | 2 | 6 | 5.5 |
| Performance / scale readiness | 3 | 6.5 | 6.5 / 5.5 |
| Structure / maintainability | 4 | 6 | 6.5 |
| **Overall** | **3** | **6.5** | **6** |

Verdict: the spine is solid — auth with OTP, race-free DMs, realtime chat with
attachments, feed with real pagination, viewport map, RLS everywhere, secrets
clean, packages purged. The score is held down by a short list of concrete,
fixable bugs the agents found (below). Fixing the P0/P1 list moves overall to
~8.

## NEW findings (not in Codex's audit) — fix queue

### P0 — broken user-facing behavior
1. **Rejecting a friend request ACCEPTS it.** supabase.api.ts PUT
   /friend-requests ignores the client's status and hardcodes 'accepted'.
2. **Group create / group details / group members screens run on the dead
   Sendbird proxy** (no supabase branch) — create silently fails then
   navigates to a broken thread; details/members render garbage; group
   Media & Docs is only reachable through the broken details screen.
3. **Post detail loses image + like count** — getPostComments messages don't
   emit `channelUrl`, so the detail screen's post lookup never matches.
4. **Like state never renders as "liked"** on feed/comments — identity read
   from dead `sdk.currentUser` proxy instead of userDB.

### P1 — security (privacy for a health community)
5. **comments_select using(true)** — anyone can read comment BODIES on
   group-only posts (post is gated, its comments are not).
6. **conv_members_insert** — a conversation creator can force ANY user into
   their conversation (harassment vector). Route all membership through RPCs.
7. **friendships_update** — requester can self-accept a pending request.
8. **notifications recipient unrestricted** — spam any stranger (60/min under
   the rate trigger). Gate recipient to a relationship.
9. profiles over-exposure: email, phone, push_token, exact lat/lng readable by
   any authenticated user; users_in_bbox returns full rows. Narrow the
   projection.

### P2 — scale cliffs (order they break as users grow)
10. Chat: no history pagination past 100 messages; realtime does a full
    100-row refetch per incoming message (busy group chats multiply this).
11. Feed reactions fetched as unbounded liker-ID arrays (viral post = huge
    payloads); switch to counts + "did I like".
12. Images ship full-size originals for all three size tiers (no transforms)
    — dominant egress cost and scroll-perf killer.
13. getMyConversations last-message preview uses global newest-200 heuristic
    — wrong previews for power users; denormalize onto conversations.
14. Rate-limit COUNT triggers lack (actor, created_at) composite indexes.
15. Video attachments misclassified as image/jpeg (extToMime has no video
    branch); msgShape missing `size`.

### P3 — structure
16. Env-typo hole: invalid EXPO_PUBLIC_BACKEND + EXPO_PUBLIC_MOCK=true makes
    BOTH flags false → "unreachable" legacy axios branch executes. Make
    mock.config derive from backend.config; warn on unknown values.
17. Zero tests; jest config broken (preset mismatch). The supabase adapter
    layer (1,551 LOC) is ideal for unit tests against mock fixtures.
18. ~1,400–1,800 LOC dead legacy branches across 24 files (planned sweep) +
    15 zero-import packages (ui-kitten, eva, react-native-elements,
    emoji-mart-native, date-fns, @stripe/stripe-react-native unused, etc.)
    and dev tools misplaced in dependencies.
19. SUPPORT_PROFILE_ID not seeded in migrations — support chat button no-ops
    on a fresh environment.
20. supabase/migrations/README table missing the 11th migration row.

## What passed cleanly
- Secrets hygiene (nothing sensitive git-tracked; .env + GoogleService plist
  ignored), client injection (every interpolated filter assertUuid-guarded),
  delete-account edge function (JWT-only identity, cannot delete others),
  all SECURITY DEFINER functions search_path-pinned with tight EXECUTE,
  rate-limit trigger correctly rate-limits the real caller inside the DM RPC,
  DM uniqueness (canonical pair key), signup→OTP→profile flow, map bbox
  params plumbing end-to-end, account deletion flow, boot path (no legacy SDK
  work), all 14 providers memoized, feed keyset pagination.
