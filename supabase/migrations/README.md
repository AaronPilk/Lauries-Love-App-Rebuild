# Supabase migrations — Backend V2 (project `iwbfsbriippzmdyrsmsu`)

Exact copies of every migration applied to the Lauries Love Supabase project,
exported from `supabase_migrations.schema_migrations` on 2026-07-05. This is
the complete database contract the client code relies on: schema, triggers,
Row Level Security policies, storage policies, and RPCs.

Apply order = filename order (timestamps). To recreate the backend on a fresh
project: `supabase db push` with this directory, or run each file in order in
the SQL editor.

| Migration | What it does |
|---|---|
| initial_schema_v1 | 13 tables, triggers, RLS on everything, realtime on messages+notifications |
| security_hardening_v1/v2 | pinned search_path, revoked EXECUTE on trigger/helper functions |
| fix_conversation_create_rls | creator can read own conversation during setup |
| abuse_guards_v1 | body-length CHECK constraints (oversized-payload abuse) |
| storage_buckets_v1 | avatars/post-images buckets, owner-folder write policies |
| post_audience_tags | "My Groups" audience: audience_tags + my_tags() overlap policy |
| performance_hardening_v1 | FK covering indexes; all policies use `(select auth.uid())` init-plan pattern |
| group_chat_threads | one thread per group; chat membership DERIVED from group_members |
| direct_conversation_uniqueness_v1 | canonical pair key + atomic find_or_create_direct_conversation RPC |
| attachments_ratelimits_bbox_v1 | private chat-attachments bucket (member-gated), rate-limit triggers on 7 tables, users_in_bbox map RPC |
| rls_privacy_v1 | can_see_post/can_notify gates (comments, reactions, notifications), self-only conversation membership, addressee-only friend accept, narrowed bbox projection, create_group RPC, rate-limit composite indexes |
| rls_privacy_v2_write_gates | comment/react writes also require visibility of the target content |
| storage_listing_hardening_v1 | avatars/post-images bucket read restricted to authenticated (no anon listing) |
| profiles_private_pii_v1 | sensitive PII (email/phone/push_token/zip/device) split into owner-only profiles_private table — closes the direct-PostgREST scrape path |
| group_roster_privacy_v1 | group_members roster gated to co-members (was world-readable → diagnosis inference); member counts stay public via group_member_counts() RPC |

Security invariants the client depends on (all enforced here, not in JS):
writes are owner-scoped (`auth.uid()`), notification sender can never be
spoofed, chat is member-only, group posts are member/tag-gated, storage paths
must start with the uploader's uid, payments are read-only from the client.
