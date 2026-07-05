-- rls_auto_enable is a pre-existing project helper (event trigger); it should
-- never be callable through the REST RPC surface.
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
