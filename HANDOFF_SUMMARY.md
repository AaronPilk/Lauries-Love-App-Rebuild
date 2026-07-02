# Handoff Summary — Laurie's Love App Rebuild

Paste the "PROMPT FOR NEW CHAT" section (bottom) into the new chat. The rest is full context.

---

## Who / what

- **User:** Aaron "Pilk" Pilkington (aaron@skyway.media). Marketer/operator + self-taught builder. Wants concise, direct, execution-focused help (no fluff). Acts as an execution partner.
- **The job:** Taking over the **Laurie's Love** app from an agency (One Seven Tech / "oneseven") that charges too much. Rebuilding it cleanly, fixing bugs, then testing on his own iPhone before figuring out data migration + App Store submission later.
- **The app:** Health/patient-support community mobile app, ~10k live users. **App = React Native 0.79 / Expo 53** (true native). **API = NestJS 11 + TypeORM + MySQL + AWS Cognito + S3 + Authorize.Net + Sendbird** (Sendbird powers BOTH chat AND the social feed). Hosted on AWS ECS Fargate.
- **His own app for comparison:** "Watchman" (Next.js + Supabase + Capacitor, on the App Store) — audited as better-engineered than Lauries Love. Not the current focus.

## Decisions made

1. **Rebuild = fork the original code + apply fixes** (NOT rewrite from scratch). Clean owned repo.
2. **Repo:** `~/Lauries-Love-App-Rebuild` on his Mac (monorepo: `app/` = RN app, `api/` = NestJS). Remote: https://github.com/AaronPilk/Lauries-Love-App-Rebuild.git, branch `main`. Already pushed.
   - NOTE: was originally under a mounted folder with SPACES in the path ("Lauries Love app rebuild ") — that broke the iOS build, so it was **moved to `~/Lauries-Love-App-Rebuild`** (no spaces). It's re-added to the Cowork session so Claude has file access.
3. **Stripped ALL agency keys** for a clean slate (user's explicit want). Deleted Firebase admin key + Google config files; replaced Google Maps / Facebook / Intercom / CometChat / EAS / Sentry values with `YOUR_*` placeholders; scrubbed `.env.example`. Firebase config files + a dummy `.env` restored LOCALLY only (gitignored) so it can build. User wires up his own services LATER.
4. **Testing approach:** get the app to build + launch in Xcode on his physical iPhone (shows as "iPhone (87)"), using a **mock/stub API** so it runs against fake data (mock layer NOT built yet).

## Fixes already applied to the code (committed)

- **React Query defaults** (`app/src/main/App.tsx`) — staleTime/gcTime/refetchOnWindowFocus:false (stops constant refetching).
- **Map opens on user location** (`app/src/main/screens/Connect/Map/map.screen.tsx`) — was hardcoded to whole-US; also removed the Android "re-zoom to US on every focus" bug.
- **Podfile patches** (`app/ios/Podfile` post_install): re-applies the fmt fix + bumps pod deployment targets to 15.1 on every `pod install`.
- **fmt consteval fix** — patched `app/ios/Pods/fmt/include/fmt/base.h` to force `FMT_USE_CONSTEVAL 0` (a `-D` flag can't win; the header hard-codes it).
- **Payment modules excluded from iOS build** — created `app/react-native.config.js` setting `ios: null` for `@stripe/stripe-react-native`, `react-native-apple-payment`, `react-native-gpay-api` (Stripe SDK won't compile on Xcode 26; payments not needed for UI test).

## The iOS build saga (user's Xcode = v26, VERY new — much newer than RN 0.79 supports)

Building the `app/` in Xcode on his Mac. Claude can't run Xcode — user runs commands/builds, pastes errors/screenshots, Claude patches. Progress:
- git push ✅ · yarn install ✅ (yarn was missing → `corepack enable`) · CocoaPods auto-installed ✅
- Signing ✅ (Team = Aaron Pilkington, bundle id → `com.aaronpilk.laurieslove`, **deleted the Apple Pay capability** — agency merchant IDs couldn't provision)
- **fmt consteval error** → FIXED (base.h patch above). A deep-debug agent confirmed the build then compiled 68 targets / 121 files clean — no other hidden toolchain landmines at that point.
- **Spaces in path** → FIXED by moving repo to `~/Lauries-Love-App-Rebuild` + `rm -rf ios/build Pods && pod install`.
- **Workspace case mismatch** (`LauriesLove.xcodeproj` vs disk `laurieslove.xcodeproj`) → FIXED via `sed` on `LauriesLove.xcworkspace/contents.xcworkspacedata` (chose "Use Version on Disk").
- **Stripe SDK compile error** ("Enumeration redeclared with different underlying type NSInteger/NSUInteger" in stripe-react-native) → JUST FIXED by excluding payment modules via `react-native.config.js`.

## CURRENT STATE / immediate next step

User was told to run, in `~/Lauries-Love-App-Rebuild/app`:
```
cd ios && pod install && cd ..
```
then in Xcode: **Clean Build Folder (Cmd+Shift+K) → Run**.

**Waiting on the result of that build.** Likely outcomes: (a) it launches to the login screen — then we build the mock layer to get past login; (b) a NEW native error (Intercom is the next most likely candidate) — strip/patch it same as Stripe.

## Known things still TODO

- **Mock/stub layer** (biggest one): app has no real backend config (Cognito/API/Sendbird), so it'll hit a login wall. Need to stub the API + bypass Cognito auth so the UI is testable with fake data. `EXPO_PUBLIC_MOCK=true` flag already in the local `.env` but nothing reads it yet.
- Remaining audit fixes (backend signup idempotency/500, `/users/nearby` endpoint, DB indexes, provider memoization, FastImage, remove CometChat, etc.) — see `Lauries-Love-MASTER-Fix-Plan.md` in the repo's parent docs folder.
- Env values (Cognito, API URL, Sendbird, Maps) don't exist in code (they live in the agency's infra) — needed for real backend later.

## How to work with this user

- He builds/tests on his Mac; you patch files in `~/Lauries-Love-App-Rebuild` (Cowork file access) and give him exact terminal/Xcode steps.
- One error at a time; he screenshots or uploads build logs. Read logs in the `uploads` folder.
- The Xcode-26-vs-RN-0.79 mismatch is the recurring theme — expect more "compiler too strict for this old dependency" errors; strip non-essential native modules (payments done; Intercom/others if needed) or patch headers. Fallback if it keeps fighting: a simulator build, or note that Xcode 16 is what RN 0.79 targets (but his phone may be on iOS 26, which Xcode 16 can't deploy to — so simulator is the cleaner fallback).

---

## PROMPT FOR NEW CHAT (paste this)

You're my execution partner continuing a project already in progress — read `~/Lauries-Love-App-Rebuild/HANDOFF_SUMMARY.md` (this file) for full context first.

TL;DR: I'm rebuilding the "Laurie's Love" React Native 0.79 / Expo 53 app (taking it over from an agency) in a clean repo at `~/Lauries-Love-App-Rebuild` (monorepo: `app/` + `api/`, pushed to github.com/AaronPilk/Lauries-Love-App-Rebuild). We stripped all the agency's API keys, applied several fixes, and are fighting to get it to BUILD in Xcode 26 on my physical iPhone. We've already fixed: the fmt consteval error (patched `app/ios/Pods/fmt/include/fmt/base.h` + Podfile), spaces-in-path (moved the repo), the workspace case mismatch, and the Stripe compile error (excluded payment native modules via `app/react-native.config.js`).

Right now I just ran `cd app/ios && pod install && cd ..` then Clean Build Folder + Run in Xcode. Here's what happened: [PASTE the build result — "it launched" or the error screenshot / build log]. 

Keep going: get the app building and launching on my phone, then help build a mock/stub API layer so I can click through the UI with fake data (I have no real backend config yet — that's for later). Be concise and direct. I build on my Mac; you patch files in the repo and give me exact terminal/Xcode steps.
