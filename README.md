# Laurie's Love — App Rebuild

Clean, owned rebuild of the Laurie's Love app with all audit fixes applied. Forked from the original codebase (not a from-scratch rewrite) so the proven, battle-tested logic is preserved while the bugs, performance issues, and security gaps are fixed.

**This repo does not touch the live production system.** It's an independent copy for rebuilding, hardening, and testing. User-data migration and App Store submission are handled separately, later.

## Structure

```
Lauries-Love-App-Rebuild/
├── app/    # React Native (Expo SDK 53) mobile app — opens in Xcode
├── api/    # NestJS 11 + TypeORM + MySQL backend
└── REBUILD_PLAN.md   # the fix checklist we're working through
```

## Stack
- **App:** React Native 0.79 / Expo 53, React Query, React Navigation v7, Sendbird chat
- **API:** NestJS 11, TypeORM, MySQL, AWS Cognito auth, S3, Authorize.Net
- **Hosting (later):** AWS ECS Fargate (existing), or your own infra

## Current build mode: MOCK API
The app is being wired to run against **mocked/stubbed data** so it compiles and runs in Xcode with zero backend infrastructure. Real backend wiring comes after the app is testable.

## Getting it running in Xcode (once fixes land)
```sh
cd app
yarn install
npx expo prebuild --platform ios     # generates the ios/ project
npx expo run:ios                      # or open ios/*.xcworkspace in Xcode
```
Secrets (`firebase.json`, `GoogleService-Info.plist`, `.env`) are gitignored — keep your local copies in place for the build; they are not committed.

## Fix progress
See `REBUILD_PLAN.md` — work is tiered P0 (security) → P1 (signup + map) → P2 (performance) → P3 (cleanup).
