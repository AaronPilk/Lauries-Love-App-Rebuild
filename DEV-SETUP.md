# Dev Setup — Laurie's Love App (for Jeremy / Android)

Get the app running locally. Owner split: Aaron = Web + iOS + backend. Jeremy = Google Play / Android.
One shared Supabase backend serves iOS, Android, and Web — you don't stand up your own; you point at ours.

## 1. Prerequisites
- Node 18+ and Yarn
- JDK 17, Android Studio + Android SDK (Platform 34), an emulator or a physical Android device with USB debugging
- Watchman (optional, macOS), Git
- The app is Expo SDK 53 / React Native 0.79 (bare workflow — native folders are committed)

## 2. Clone
```
git clone https://github.com/AaronPilk/Lauries-Love-App-Rebuild.git
cd Lauries-Love-App-Rebuild/app
yarn install
```

## 3. Drop in the config files (sent to you separately, NOT in GitHub)
Aaron will send a `lauries-love-secret-config.zip` over a secure channel. Unzip it at the REPO ROOT so files land at these paths:
```
app/.env                                  # Supabase URL + key + backend mode flags
app/GoogleService-Info.plist              # (iOS — harmless to have)
app/ios/LauriesLove/GoogleService-Info.plist
app/google-services.json                  # Firebase Android config
app/android/app/google-services.json      # Firebase Android config (build)
app/firebase.json
app/android/app/debug.keystore            # standard Android debug key
app/.env.example, api/.env.example        # templates (already in git too)
```
The key one for you is `app/.env`. It sets `EXPO_PUBLIC_BACKEND=supabase` (real backend) and the Supabase URL + publishable key. To run against fake data instead (no backend needed), set `EXPO_PUBLIC_BACKEND=mock`.

## 4. Run on Android
```
cd app
yarn start --clear         # start Metro (leave running in its own terminal)
# in a second terminal:
npx expo run:android       # builds + installs to emulator/device
```
JS-only changes → just reload Metro. Native/dependency changes → re-run `expo run:android`.

## 5. Backend mode (important)
`app/src/services/supabase/backend.config.ts` is the single switch. `EXPO_PUBLIC_BACKEND`:
- `supabase` → real backend (our Supabase project). Needs the `.env`.
- `mock` → in-app fake data, no network. Great for UI work.
Invalid/blank value falls back to `supabase`.

## 6. What's already built (so you're not surprised)
Auth (signup/OTP/reset/delete), community wall (posts/comments/likes/photos), groups (browse/join/chat), 1:1 + group messaging with attachments + realtime + load-older, friends, privacy-safe map (viewport + coarse coords), media library, notifications (in-app). All on Supabase. See `PROJECT-STATE.md` for the full map and `SCOPE-GAP-ANALYSIS.md` for what's still to build against the client SOW.

## 7. Things specific to the Android side you'll own
- Google Play data-safety form + privacy disclosures (SOW: store submission).
- Push notifications: the Firebase Android config is in the zip; the push *delivery* edge function is still to be built (device tokens are already saved to profiles). Coordinate with Aaron on the fan-out function.
- Verify the release signing config before a Play build (the committed keystore is the DEBUG key only — the release key is separate and must NOT be committed).
- Known: ~955 Xcode warnings are iOS-only noise; on Android watch the Gradle build. `react-native-fast-image` was removed (cleared ~700 libwebp dup warnings) — run a clean `yarn install` so node_modules matches.

## 8. Database / migrations
The full schema + access rules live in `supabase/migrations/*.sql` (source of truth). Do NOT apply migrations against the DB casually — the project owner applies them. There is also `supabase/pending-migrations/` = designed-but-not-yet-applied schema (admin panel / feature flags / moderation / tickets) waiting on the connector being pointed at the right project.

## 9. Gotchas
- Metro dies if you paste into its terminal — keep it in its own window.
- Two Metro instances on :8081 cause stale bundles — `kill` port 8081 if things look stale.
- `.env` changes need a Metro restart with `--clear`.
- The repo is `~/Lauries-Love-App-Rebuild` — avoid paths with spaces (breaks RN script phases).

## 10. Contacts
Backend/DB questions, Supabase access, or the secret-config zip → Aaron. Web + iOS are Aaron's; Android + Play Store are yours.
