# Five-Pass Adversarial Audit — July 6, 2026 (current HEAD)

## The mandate this audit was run under (verbatim, as requested)

> "Do not just agree, act as an expert programmer and app builder, you are to
> give a true honest report not something that just agrees. Call all agents,
> max token usage and run 5 audit passes."

Five independent specialist agents were run, each told to be adversarial and
NOT to award points for intentions or documented-but-unfinished work. Below is
the honest composite. Scores went DOWN from the prior (over-generous) internal
numbers in places — that's the point.

## Honest scorecard (original agency app → current rebuild)

| Area | Original | Rebuild (honest) | Prior claim (too generous) |
|---|---|---|---|
| Correctness (features work) | 4 | 7.8 | 8.5 |
| Security | 2.5 | 7.0 | 8.5 |
| Performance / scale | 2.5 | 5.0 | 6.5 |
| Structure / maintainability | 5 | 6.0 | 6.5 |
| **Overall (build quality)** | **~3.5** | **~6.5** | ~7.5 |
| **Operational readiness to REPLACE the live app TODAY** | — | **3 / 10** | (not previously graded) |

"Build quality" and "ready to swap under 10k live users today" are DIFFERENT
questions. The build is genuinely good and hugely improved. It is NOT
operationally ready to cut over today, and no report should imply it is.

## Fixed during this pass (real, verified)
- **Correctness HIGH:** `HomeTabCreatePost` avatar passed a dead-proxy object to
  an `<Image>` in Supabase mode — now reads the real profile avatar.
- **Security HIGH:** `group_members` roster was world-readable (any user could
  reconstruct who is in each condition-specific group = diagnosis inference).
  Now gated to co-members; counts preserved via `group_member_counts()` RPC.
  Verified with simulated-JWT SQL.
- **Doc integrity:** corrected "18 migrations" → 16; corrected "verified on
  device" → "running on device, formal QA pass not yet executed."

## STILL OPEN — the honest list

### Security (1 HIGH, 1 MED remain)
- **HIGH — avatars/post-images are PUBLIC buckets.** Supabase serves public
  buckets via unauthenticated CDN URLs regardless of the SELECT policy, so
  member photos and user-posted images (potentially treatment/diagnosis photos)
  are reachable by anyone with the URL. Fix = make buckets private + signed
  URLs everywhere they render (same pattern as chat-attachments). This is a
  real multi-site refactor that needs device testing — do NOT hot-patch it
  before a demo. This is the #1 remaining security item.
- **MED — exact coordinates + full name + diagnosis readable** by any
  authenticated member via `profiles` (PII email/phone is now gone, but exact
  lat/lng + real name + condition remain a stalking/de-anon vector). Fix =
  coarsen/jitter public coordinates, consider dropping last_name from the public
  projection, add a location-sharing opt-out. Product decision + small change.
- LOW: leaked-password protection still off (dashboard toggle); delete-account
  edge fn leaks raw error text; notifications_update lets recipient edit any
  column of own rows.

### Performance / scale (score 5 — four items genuinely unfinished)
- Feed reactions ship unbounded liker-ID arrays (should be counts + has-liked).
- Feed images are full-size originals for all three size tiers (no thumbnails).
- Chat history capped at 100 messages, no "load older" cursor.
- `getMyGroupChannels` unbounded member fetch; single chat context re-renders
  all consumers on every message (architectural).

### Structure / testing / operational
- **Zero automated tests; `tsc` is broken repo-wide (TS5095)** → no static type
  safety net and no test net. Every regression is caught only by a human tapping
  a phone.
- ~800 LOC of unreachable legacy branches behind a dead-proxy shim across 24
  files, in vendor-named providers — a genuine trap for a future/client dev.
- ~11–13 zero-import packages still installed; ~700 of the 955 Xcode warnings
  are from `react-native-fast-image` (0 imports) — removing it clears most.
- **Data migration never rehearsed.** Cognito passwords cannot be exported, so
  at cutover every ~10k user must reset their password — a mass-support event
  that needs a plan and email-deliverability load test BEFORE go-live.
- **No formal device QA pass executed** (LAUNCH-PLAN 31-item checklist is 0/31).

## What must NOT be told to the client as fact
- "Verified on device" (it's demoed, not QA'd), "production-ready" or "weeks
  from live" as a firm promise, "fully tested" (one test file), or that the data
  migration is a solved low-risk step (the password-reset-for-all reality is a
  real risk to surface proactively).

## The honest bottom line
The rebuild took a genuinely broken, insecure app (committed live server key,
PII leaks, broken features) and produced a well-architected, far safer system —
that part is real and defensible. But it is a strong **build**, not a
**shipped, migration-tested product**. Overall ~6.5/10 build quality; ~3/10
ready-to-cut-over-today. The gap between those two numbers is the honest story.
