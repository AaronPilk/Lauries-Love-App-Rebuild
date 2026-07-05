# Laurie's Love — Where We Stand (for the owners)

Hey — here's the full picture on the app rebuild so you can bring the
Laurie's Love owners up to speed.

## What we did

We took the existing app's code, audited it top to bottom, and rebuilt it on
infrastructure we own. The live app in the App Store has NOT been touched —
everything below happened on a separate copy, tested on real devices against
a real database.

**Problems we found and fixed in the original code:**
- Signup could fail with a server error and lock people out permanently
- The map loaded the entire United States instead of your area, and dragged
  the whole app down every time you opened it
- Supporters, caregivers, and family members were INVISIBLE in the Connect
  directory — a filter bug that's live in production right now
- Caregivers/supporters were forced to enter a cancer diagnosis year they
  don't have — now it asks "Have you been diagnosed?" first
- A master chat key was shipped inside the app itself — anyone technical
  could have impersonated any user's messages (serious security hole)
- Dozens of performance bugs that made every screen slower than it should be

**What the rebuild runs on now:**
- Our own database and login system (Supabase — bank-grade row-level
  security, every user's data locked to them at the database layer)
- Our own chat and community feed with live message delivery — this REPLACES
  Sendbird, the third-party chat vendor the app currently pays for
- Our own photo storage (replaces Amazon S3 setup we didn't control)
- Our own support messenger (replaces Intercom, another paid vendor)
- Working today, verified on-device: signup, login, profiles, the map,
  friend requests, the community wall, comments, likes, photo posts, groups,
  group chat, direct messages, notifications

## What this means financially

The current app pays for: Sendbird (chat vendor — typically $400–800/mo at
this user count), AWS servers (~$150–350/mo), Intercom (~$75–150/mo), plus
whatever the agency charges monthly for maintenance.

The new stack costs roughly **$75–200/mo total** (Supabase, email delivery,
crash reporting). Vendor savings alone: roughly **$550–1,300 every month** —
before counting anything currently paid to the agency.

## What's left before we can switch over

1. The agency provides read-only data exports (we've prepared the exact
   request list — nothing they give us can affect the running app)
2. The agency transfers the App Store listing to our account (standard
   process, preserves all users and reviews — existing users just get an
   update)
3. We finish payment processing (moving donations to Stripe), push
   notifications, and run a full rehearsal migration with the real data on a
   staging copy before anything goes live
4. Coordinated switchover, with the old system left running untouched for
   30 days as a safety net

## The ask for the owners

Two things get this moving: (1) approval to send the data request to
One Seven Tech, and (2) starting the App Store transfer conversation —
that's the longest-lead item and costs nothing to begin.

The risk profile: the live app keeps running unchanged through all of this.
There is no step where current users are affected until the final,
coordinated switchover — and that step is reversible for 30 days.
