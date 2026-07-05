-- Audit remediation: payload size limits (RLS handles ownership; these stop
-- oversized-body abuse). Rate limiting comes later via edge functions.
alter table public.posts add constraint posts_body_len check (char_length(body) <= 5000);
alter table public.comments add constraint comments_body_len check (char_length(body) <= 2000);
alter table public.messages add constraint messages_body_len check (body is null or char_length(body) <= 4000);
alter table public.notifications add constraint notifications_content_len check (content is null or char_length(content) <= 1000);
alter table public.profiles add constraint profiles_description_len check (description is null or char_length(description) <= 1500);
alter table public.groups add constraint groups_name_len check (char_length(name) <= 120);
