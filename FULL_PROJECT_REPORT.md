# Laurie's Love — Full Project Report (Complete Context for Fable)

This is the exhaustive record of everything done on this project so far. Read it end-to-end and you'll know exactly what's going on. A shorter version lives in `HANDOFF_SUMMARY.md`; this is the deep one.

---

## 1. The people and the goal

- **User: Aaron "Pilk" Pilkington** (aaron@skyway.media; Apple ID aaronpilk14@gmail.com). A marketer/operator and self-taught builder — ships real apps but isn't a career iOS dev. Wants a sharp, concise, execution-focused partner. No fluff, no over-explaining. He builds/tests on his own Mac; you patch files and give him exact terminal/Xcode steps.
- **The goal:** He's taking over the **Laurie's Love** app from the agency that built it (**One Seven Tech**, aka "oneseven" / Sentry org `oneseventech`) because they charge too much. Plan: fork the code into his own repo, fix the bugs and performance problems, strip out the agency's keys, get it building + running on his own iPhone to test, and *later* deal with user-data migration and App Store submission.
- **He does NOT want to touch the live production system.** This is an independent rebuild.

---

## 2. What the app is

**Laurie's Love** = a health / patient-support community mobile app with **~10,000 live users**. Users register with a diagnosis (type + subtype), location, and profile, then connect with nearby people in similar situations. Features: profiles, friend requests, in-app chat, a social feed/posts, events, push notifications, paid membership/donations.

It is a **native iOS + Android app** (React Native), not a website. Store version was 2.1.3 (build 154).

---

## 3. Complete technical architecture

### 3a. Mobile app (`app/`)
- **React Native 0.79.6 + Expo SDK 53**, React 19, New Architecture enabled. TypeScript. ~41,000 LOC, ~540 files.
- Clean-architecture folders: `domain / data / infra / presentation / main / providers / services`.
- **Navigation:** React Navigation v7 (stack + bottom tabs).
- **Data/forms:** TanStack React Query v5, react-hook-form + zod.
- **Auth:** AWS Cognito via Amplify.
- **Chat:** Sendbird (primary — powers chat AND the social feed: a post = a Sendbird GroupChannel, a comment = a message, a like = a reaction). CometChat is leftover dead code from a previous chat vendor (half-finished migration).
- **Payments:** Stripe + Apple Pay + Google Pay + Authorize.Net.
- **Analytics/monitoring:** PostHog (+ session replay), Sentry, Facebook SDK.
- **Support:** Intercom. **Push:** Firebase Messaging + Expo Notifications. **Maps:** react-native-maps + Google Maps.
- **UI libraries (bloat):** UI Kitten/Eva, native-base, react-native-paper, react-native-elements — FOUR UI kits bundled at once.
- Original iOS bundle id: `com.SMv587dd8da82c.app` (agency's) → changed to `com.aaronpilk.laurieslove` for the rebuild.
- Shipped via EAS Build + Expo Updates OTA (channels: production / staging).

### 3b. Backend API (`api/`)
- **NestJS 11**, Node 20, TypeScript. ~5,800 LOC, ~86 files.
- **Database:** MySQL via **TypeORM** (migrations + snake_case naming, ~10 migrations). Schema in `libs/database/src/entities`.
- **Auth:** AWS **Cognito** user pool (`us-east-1_K3nWoTP66`) — validates Cognito JWTs with passport-jwt + jwks-rsa. Identities live in Cognito, NOT the app DB.
- **Payments:** Authorize.Net. **Storage:** AWS S3 (presigned URLs). **Push:** firebase-admin. **Chat:** Sendbird service. **Monitoring:** Sentry (org `oneseventech`).
- **Modules:** users, events, notifications, payments, value-definitions, definition-types, auth. Uses `@dataui/crud` for auto-CRUD.
- **Entities/tables:** `user` (diagnosis info, geoLocation JSON, address, JSON config with push tokens + Authorize.Net billing IDs), `event`, `friend_request`, `notification` (+ object/change), `payment`, `values_definition` + `definitions_type` (lookup tables).

### 3c. Infrastructure
- **AWS**, provisioned with **Terraform** (state in S3 bucket `lauries-api-production`), region **us-east-1**.
- **Compute:** ECS **Fargate** (containers), image in **ECR**. ALB + Route53 DNS + ACM SSL.
- **CI/CD:** GitHub Actions — push to `production`/`development` branch → build Docker → push ECR → force-new ECS deployment + Sentry release.

### 3d. Third-party accounts involved (needed later for full function)
AWS, Cognito, Firebase (project `laurie-s-love-1e463`), Authorize.Net, Sendbird, Stripe, Sentry (`oneseventech`), PostHog, Intercom, Apple Developer, Google Play, Expo/EAS, GitHub, Google Maps. **Env config (API URL, Cognito, Sendbird, etc.) is NOT in the code — it lives in the agency's infra.** This is the main takeover gate.

---

## 4. The problems (why he's rebuilding)

Three user-facing symptoms, all root-caused with exact file locations via a three-pass audit (and independently verified by Codex):

### Symptom 1 — Signup throws HTTP 500
- Signup is a multi-request flow: Cognito `signUp`/`confirmSignUp` happen in the app, then a **separate** `POST /users` saves the DB profile — no transaction, no idempotency.
- A retry/back-nav/double-tap re-inserts the same `cognito_id` → MySQL `ER_DUP_ENTRY` → the API returns **500 instead of 409**.
- Errors are **double-wrapped** (service wraps in InternalServerErrorException, controller wraps again) so real 400/409 codes are lost.
- If the DB insert fails after Cognito succeeds → **orphaned Cognito account** → user is stuck in a permanent retry-500 loop.
- DTO `geoLocation` lacks `@IsOptional()` (and misuses `@ValidateNested({each:true})`). (NOTE: my first audit wrongly said `role`/`diagnosisTypes`/`diagnosisSubTypes` also lacked it — Codex corrected this; they DO have it. Only geoLocation is missing.)

### Symptom 2 — Map loads the whole US and is slow
- `initialRegion` hardcoded to a continental-US zoom (`app/src/main/screens/Connect/Map/map.screen.tsx:127`). Device GPS IS fetched but never used for the first view. Android re-zooms to whole-US on every map-tab focus.
- Client fetches the **entire users table** and drops **one `<Marker>` per user**, no clustering. `tracksViewChanges` toggling causes marker re-render storms. Backend has **no geospatial "nearby" query**; `geoLocation` is an unindexed JSON column.

### Symptom 3 — App is generally slow
- **React Query** created with `new QueryClient()` — no defaults → everything refetches on mount/focus/reconnect.
- The **whole users table** is fetched on 4 screens (map, connect list, home feed x2).
- **~18 nested context providers** with unmemoized `value={{...}}` objects → any state change re-renders the whole tree.
- Remote images use plain `Image` (FastImage installed but unused). Feed requests `-sm`/`-md` **thumbnail URLs that don't exist** (fabricated client-side; S3 only stores the original) → retries dead URLs, falls back to full-res.
- Friends/suggested-channels lists use `ScrollView` + `.map()` (no virtualization).
- Backend **blocks responses** on Firebase/Cognito/S3 calls inside request handlers.
- Unbounded `@Crud` endpoints, eager relations on User CRUD, **missing indexes** (user.email, friend-request sender/receiver, payment/notification FKs), nightly subscription cron makes one external API call per row.
- Dead weight: CometChat still bundled + hardcoded key; four UI kits.

### Security issues found (agency left these)
- **Firebase Admin private key committed** (`api/firebase.json`).
- **DB password** in `api/.env.example`.
- **Google Maps key hardcoded** in 5 places.
- **Sendbird MASTER API token shipped inside the app bundle** and used as the chat `accessToken` (`SendbirdChatProvider.tsx:409`) — anyone can extract it and impersonate any user's chat. (Codex caught this — most serious.)
- **Hardcoded CometChat API key** in the axios factory.
- Sentry + PostHog sampling at 100% (cost + privacy).

---

## 5. The audits performed

1. **Three parallel deep-dive agents** audited signup, map, and performance — each returned findings with `file:line` and specific fixes.
2. A **Codex audit prompt** was written and the user ran it; Codex did an independent pass, confirming the core diagnosis, correcting a few of my specifics (DTO optionality, React Query partial, chat-list virtualization target, thumbnail pipeline is deeper than stated), and catching new items (Sendbird master token, CometChat key, sampling, string-message filter bug, payment hooks using React Query v4 syntax on v5, Sendbird friends N+1).
3. The two audits were **reconciled into a master fix plan** with a plain-English section and difficulty ratings.

### Watchman comparison (context, not current work)
The user's OWN app "Watchman" (Next.js 14 + Supabase + Capacitor, live on the App Store) was given the same three-pass audit. Verdict: **Watchman is better-engineered** (RLS-first security, owns its data, no chat vendor, far less debt) but is a **hybrid WebView app** (not true native) with an untyped data layer (182 `any`), no tests, and a feed hard-capped at 50 posts. Lauries Love is more mature-infra + true-native + proven at 10k scale but sloppily executed. A `WATCHMAN_FIX_PROMPT.md` was written into the Watchman repo (one real security item: `award_points` RPC has public execute → points forgery).

---

## 6. Documents created (where they live)

**In the ORIGINAL mounted folder `Lauries Love app rebuild ` (separate from this repo — the repo was moved out):**
- `Lauries-Love-Architecture-Brief.md` — how the app is built, stack, infra, risks.
- `Lauries-Love-Code-Audit.md` — full audit with file:line for all three symptoms.
- `Codex-Audit-Prompt.md` — the prompt used to get Codex's independent audit.
- `Codex-Independent-Audit-2026-07-01.md` — Codex's returned audit.
- `Lauries-Love-MASTER-Fix-Plan.md` — reconciled master plan + plain-English section + difficulty ratings. **This is the source-of-truth fix backlog.**
- `Takeover-Readiness-Checklist.md` — everything needed to take over (access, keys, accounts).
- `Partner-Email-Lauries-Love.md` — a plain-English email for his business partners.
- `Watchman-vs-LauriesLove-Verdict.md` — the head-to-head comparison.

**In this repo (`~/Lauries-Love-App-Rebuild`):**
- `README.md`, `REBUILD_PLAN.md` (fix checklist), `.gitignore`, `HANDOFF_SUMMARY.md`, this `FULL_PROJECT_REPORT.md`, and `app/react-native.config.js`.

---

## 7. The rebuild — approach & repo

- **Decision: fork the original code + apply fixes** (NOT rewrite from scratch). Keeps the proven, battle-tested logic; fastest safe path.
- **Repo:** `~/Lauries-Love-App-Rebuild` on the Mac. Monorepo: `app/` (RN app) + `api/` (NestJS). Remote **https://github.com/AaronPilk/Lauries-Love-App-Rebuild.git**, branch `main`, already pushed.
- **Originally** the repo sat inside a mounted folder whose name had spaces + a trailing space (`Lauries Love app rebuild `). That path broke the iOS build, so it was **moved to `~/Lauries-Love-App-Rebuild`** (no spaces) and re-added to the Cowork session so Claude keeps file access.
- **Git commits so far:** (1) baseline import, (2) React Query + map fixes, (3) strip all agency keys. Plus later uncommitted working changes (react-native.config.js, Podfile/fmt patches, local `.env` + restored Firebase configs which are gitignored).

---

## 8. Keys stripped (clean slate — user's explicit requirement)

User wanted NONE of the agency's keys in the rebuild. Done:
- **Deleted** agency Firebase project files: `api/firebase.json` (admin private key), iOS/Android `GoogleService-Info.plist` + `google-services.json`.
- **Replaced with `YOUR_*` placeholders:** Google Maps key (app.json ×2, AppDelegate.swift, Info.plist, AndroidManifest.xml), Facebook app ID/token (app.json, Info.plist, strings.xml), Intercom SDK keys (app.json, MainApplication.kt), CometChat key (axios factory → env), EAS project id + Expo `owner`, Sentry org (config + native + CI), DB password + Cognito IDs in `api/.env.example`.
- **Removed** agency internal Swimm docs (`api/.swm`).
- `.gitignore` updated so secrets never re-enter git history.
- **For local building only** (gitignored, NOT committed): the original Firebase config files were restored to disk and a dummy `app/.env` was created (with `EXPO_PUBLIC_MOCK=true` and placeholder values) so the app can compile/launch. Real service keys are the user's to add later.

---

## 9. Code fixes applied so far (in the repo)

- **React Query defaults** — `app/src/main/App.tsx`: staleTime 5min, gcTime 10min, refetchOnWindowFocus false, refetchOnMount/Reconnect 'stale', retry 1.
- **Map opens on user location** — `app/src/main/screens/Connect/Map/map.screen.tsx`: `initialRegion` seeded from device GPS (or profile geo) with a tight ~0.15 delta; whole-US only as last resort. Removed the Android focus "re-zoom to US" effect (now returns to the user's location).
- **fmt build fix** — `app/ios/Pods/fmt/include/fmt/base.h` patched to force `FMT_USE_CONSTEVAL 0` (see build saga). Podfile `post_install` re-applies this + bumps pod deployment targets to 15.1 on every `pod install`.
- **Payment modules excluded from iOS build** — `app/react-native.config.js` sets `ios: null` for `@stripe/stripe-react-native`, `react-native-apple-payment`, `react-native-gpay-api` (Stripe SDK won't compile under Xcode 26; payments not needed for a UI test; PaymentProvider at root does NOT import these, so it's safe — they're only used in the Donate checkout screen).

Everything in the MASTER-Fix-Plan beyond these is still TODO (see §12).

---

## 10. The iOS build saga (chronological — this is the active battleground)

**Critical fact: the user's Xcode is version 26 — extremely new (mid-2026), much newer than React Native 0.79 (mid-2025) supports.** The recurring theme is "the new compiler is too strict for these older native dependencies." Claude CANNOT run Xcode — the user runs builds on his Mac and pastes errors/screenshots; Claude reads logs (uploaded to the `uploads` folder) and patches files.

Sequence of what happened and how each was fixed:
1. **git push** ✅ (works from the repo).
2. **`yarn` not installed** → dependencies never installed → Podfile failed (`cannot load ./scripts/autolinking`). Fixed with `corepack enable` then `yarn install`.
3. **CocoaPods** auto-installed by Expo (Homebrew) ✅.
4. **Signing** ✅ — Team = Aaron Pilkington; bundle id changed to `com.aaronpilk.laurieslove`; **deleted the Apple Pay capability** (agency merchant IDs `merchant.com.laurieslove.*` couldn't provision under his account).
5. **`fmt` consteval compile error** ("Call to consteval function 'fmt::basic_format_string...' is not a constant expression"). RN 0.79's bundled fmt (via RCT-Folly) won't compile under Xcode 26's Clang. A `-D` preprocessor flag can't fix it because `fmt/base.h` **unconditionally** sets `FMT_USE_CONSTEVAL 1`. **Fix: directly patched `base.h` to force `FMT_USE_CONSTEVAL 0`** (both occurrences) + added a self-healing re-patch to the Podfile post_install. → FIXED (confirmed 0 consteval errors after).
6. A **deep-debug agent** then read the full build log and confirmed the build compiled **68 targets / 121 files clean** — no other lurking C++/toolchain landmines at that point; the next blocker was purely the path.
7. **Spaces in the project path** (`/bin/sh: /Users/pilksclaes/Lauries: No such file or directory` — RN codegen/Hermes/Sentry script phases word-split on the spaces in `Lauries Love app rebuild `). **Fix: moved the repo to `~/Lauries-Love-App-Rebuild`** (no spaces), then `rm -rf ios/build Pods && pod install`.
8. **Workspace filename case mismatch** — the workspace referenced `LauriesLove.xcodeproj` but the file on disk is lowercase `laurieslove.xcodeproj`. Non-fatal earlier, became the blocker after the move. **Fix: `sed` on `LauriesLove.xcworkspace/contents.xcworkspacedata`** to point at the lowercase name; chose "Use Version on Disk" when Xcode prompted.
9. **Stripe SDK compile error** ("Enumeration redeclared with different underlying type 'NSInteger' (was 'NSUInteger')" in stripe-react-native, plus many "Cannot find protocol definition for STP..." warnings). Same class of Xcode-26-strictness problem. Since payments aren't needed for a UI test and the user agreed, **Fix: excluded the payment native modules via `app/react-native.config.js`** (§9).

---

## 11. CURRENT STATE — exact next step

The user was told to run, in `~/Lauries-Love-App-Rebuild/app`:
```
cd ios && pod install && cd ..
```
(regenerates Pods WITHOUT the payment modules + re-applies the fmt patch), then in Xcode: **Clean Build Folder (Cmd+Shift+K) → Run**.

**We are waiting on that build result.** Expected outcomes:
- ✅ **It launches to the login screen** — the expected "wall" (no real backend). Next work = build the mock/stub layer so the UI is testable with fake data.
- 🔀 **A NEW native error** — most likely candidate is **Intercom** (or another older native module choking on Xcode 26). Strip/patch it the same way (react-native.config.js exclusion or header patch).

If Xcode 26 keeps producing these, fallbacks: build to the **iOS Simulator** (avoids device-iOS-version issues; same UI test), or note that Xcode 16 is what RN 0.79 targets (but his phone may be on iOS 26, which Xcode 16 can't deploy to — so simulator is the cleaner fallback).

---

## 12. Everything still TODO (the backlog)

### Immediate (to get a testable app)
- **Get the build to launch** on the phone/simulator (finish the native error whack-a-mole).
- **Build the mock/stub API layer** — the big one. The app has NO real backend config (Cognito, API URL, Sendbird all dummy), so it hits a login wall. Need to: stub the API client to return fake data, bypass Cognito auth, and stub Sendbird/Intercom/PostHog init so the app boots to the real UI. `EXPO_PUBLIC_MOCK=true` is already in the local `.env` but nothing reads it yet.

### The audit fix backlog (from `Lauries-Love-MASTER-Fix-Plan.md`)
- **Signup:** make `POST /users` idempotent (get-or-return by cognitoId; map `ER_DUP_ENTRY`→409); stop double-wrapping errors; add `@IsOptional()` to geoLocation; add Cognito-orphan repair path.
- **Map/backend:** add `/users/nearby` (radius/bbox) endpoint + indexed lat/lng; add marker clustering; stop fetching the whole users table on 4 screens.
- **Performance:** memoize all provider context values; FastImage + real server-side thumbnails; virtualize friends/channel lists (FlatList); fix payment hooks to React Query v5 syntax.
- **Backend scale:** `maxLimit` on CRUD + paginate events; drop eager relations; add indexes (user.email, friend-request sender/receiver, payment/notification FKs); move Firebase/S3 off the request path; batch the subscription cron.
- **Cleanup:** remove CometChat entirely; consolidate to one UI kit.
- **Security (user handling separately/later):** rotate all keys; move Sendbird to per-user backend session tokens; lower Sentry/PostHog sampling.

### Later (not now)
- User-data migration from the agency's Cognito + MySQL to the new setup.
- Standing up the user's own backend/services + real env values.
- App Store submission under the user's own Apple account.

---

## 13. How to work on this project (operating notes)

- **You cannot run Xcode/iOS builds** — the sandbox is Linux. The user builds on his Mac; you patch files in `~/Lauries-Love-App-Rebuild` and give exact terminal + Xcode steps. He pastes screenshots or uploads build logs (read them from the `uploads` folder).
- **One error at a time.** The Xcode-26-vs-RN-0.79 mismatch means expect more "compiler too strict for old dependency" errors. Strategy: strip non-essential native modules (payments done; Intercom likely next) via `react-native.config.js`, or patch offending pod headers (like fmt) with a self-healing Podfile post_install step.
- **File deletion** in the mounted folder may need the `allow_cowork_file_delete` permission tool (it was used earlier for a stale git lock).
- **Keep memory updated** — the user asked for this. Memory files already cover: user profile, the rebuild project, Watchman, and the iOS build state.
- **Tone:** concise, direct, execution-first. He's tired of the build back-and-forth but committed — keep momentum, acknowledge progress, be honest about the Xcode-26 difficulty.

---

## 14. Key file locations

- Repo root: `~/Lauries-Love-App-Rebuild`
- RN app: `~/Lauries-Love-App-Rebuild/app`
- NestJS API: `~/Lauries-Love-App-Rebuild/api`
- iOS project: `~/Lauries-Love-App-Rebuild/app/ios` (workspace: `LauriesLove.xcworkspace`, project on disk: `laurieslove.xcodeproj`)
- Podfile (patches live in post_install): `~/Lauries-Love-App-Rebuild/app/ios/Podfile`
- fmt patch: `~/Lauries-Love-App-Rebuild/app/ios/Pods/fmt/include/fmt/base.h`
- Native-module exclusions: `~/Lauries-Love-App-Rebuild/app/react-native.config.js`
- Local dummy env (gitignored): `~/Lauries-Love-App-Rebuild/app/.env`
- Map screen: `~/Lauries-Love-App-Rebuild/app/src/main/screens/Connect/Map/map.screen.tsx`
- App root/providers: `~/Lauries-Love-App-Rebuild/app/src/main/App.tsx`
- Audit + plan docs: in the OTHER mounted folder `Lauries Love app rebuild ` (not this repo).

---

## 15. Prompt to paste into the new Fable chat

> You're my execution partner continuing a project already in progress. First read `~/Lauries-Love-App-Rebuild/FULL_PROJECT_REPORT.md` for complete context (and `HANDOFF_SUMMARY.md` for the short version).
>
> Quick version: I'm rebuilding the "Laurie's Love" React Native 0.79 / Expo 53 app — taking it over from an agency — in a clean repo at `~/Lauries-Love-App-Rebuild` (monorepo `app/` + `api/`, pushed to github.com/AaronPilk/Lauries-Love-App-Rebuild). We stripped all the agency's API keys, applied fixes, and are getting it to build in Xcode 26 on my physical iPhone. Already fixed: fmt consteval error (patched `app/ios/Pods/fmt/include/fmt/base.h` + Podfile), spaces-in-path (moved the repo), workspace case mismatch, and the Stripe compile error (excluded payment native modules via `app/react-native.config.js`).
>
> I just ran `cd app/ios && pod install && cd ..` then Clean Build Folder + Run in Xcode. Here's the result: [PASTE build result — "it launched" or the error screenshot/log].
>
> Keep going: get it building + launching on my phone, then help build a mock/stub API layer so I can click through the UI with fake data (I have no real backend config yet — that's for later). Be concise and direct; I build on my Mac, you patch files and give me exact steps. Make sure the `~/Lauries-Love-App-Rebuild` folder is added to this chat so you have file access.
