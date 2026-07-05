-- Advisor remediation: pin search_path + lock down function execution.

-- 1) set_updated_at had a mutable search_path
alter function public.set_updated_at() set search_path = public;

-- 2) Trigger functions must never be callable via the REST RPC surface
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.bump_conversation() from anon, authenticated, public;
revoke execute on function public.set_updated_at() from anon, authenticated, public;

-- 3) RLS helper: authenticated keeps EXECUTE (policies need it);
--    anon/public have no business calling it
revoke execute on function public.is_conversation_member(uuid) from anon, public;
