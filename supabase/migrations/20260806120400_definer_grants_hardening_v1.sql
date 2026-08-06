-- Hardening: trigger functions must not be directly RPC-callable, and
-- default_org_id() only needs authenticated (no anon path calls it).
-- Clears advisor lints 0028/0029 for the new functions. Additive, idempotent.

revoke execute on function public.cleanup_comment_reactions() from anon, authenticated, public;
revoke execute on function public.default_org_id() from anon;
