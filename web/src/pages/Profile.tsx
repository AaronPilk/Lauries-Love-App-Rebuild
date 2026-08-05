import { useQuery } from '@tanstack/react-query';
import { supabase, currentUserId } from '../lib/supabase';

// Own profile. Reads the public row + the caller's own profiles_private
// (owner-only, so email/phone only ever show for yourself).
async function fetchMyProfile() {
  const me = await currentUserId();
  if (!me) return null;
  const [{ data: profile }, { data: priv }, posts, friends] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, first_name, last_name, display_name, avatar_path, city, state, country, created_at')
      .eq('id', me)
      .single(),
    supabase.from('profiles_private').select('email, phone_number').eq('profile_id', me).maybeSingle(),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', me),
    supabase
      .from('friendships')
      .select('id', { count: 'exact', head: true })
      .or(`requester_id.eq.${me},addressee_id.eq.${me}`)
      .eq('status', 'accepted'),
  ]);
  return {
    ...profile,
    email: priv?.email ?? null,
    phone: priv?.phone_number ?? null,
    postCount: posts.count ?? 0,
    friendCount: friends.count ?? 0,
  };
}

function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl ?? null;
}

export function Profile() {
  const { data, isLoading } = useQuery({ queryKey: ['my-profile'], queryFn: fetchMyProfile });
  if (isLoading) return <p className="text-brand-700">Loading…</p>;
  if (!data) return <p className="text-gray-500">Not signed in.</p>;

  const name = data.display_name || data.first_name || 'Member';
  const img = avatarUrl(data.avatar_path);
  const place = [data.city, data.state, data.country].filter(Boolean).join(', ');

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-brand-100 bg-white p-6 text-center shadow-sm">
        {img ? (
          <img src={img} alt="" className="mx-auto mb-3 h-24 w-24 rounded-full object-cover" />
        ) : (
          <div className="mx-auto mb-3 grid h-24 w-24 place-items-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700">
            {name[0]}
          </div>
        )}
        <h1 className="text-xl font-bold text-brand-700">{name}</h1>
        {place && <p className="text-sm text-gray-500">{place}</p>}
        <p className="mt-1 text-xs text-gray-400">
          Joined {data.created_at ? new Date(data.created_at).toLocaleDateString() : ''}
        </p>

        <div className="mt-4 flex justify-center gap-8">
          <div>
            <div className="text-lg font-bold text-brand-500">{data.postCount}</div>
            <div className="text-xs text-gray-400">Posts</div>
          </div>
          <div>
            <div className="text-lg font-bold text-brand-500">{data.friendCount}</div>
            <div className="text-xs text-gray-400">Friends</div>
          </div>
        </div>

        <div className="mt-6 space-y-1 border-t pt-4 text-left text-sm">
          {data.email && (
            <div>
              <span className="text-gray-400">Email: </span>
              {data.email}
            </div>
          )}
          {data.phone && (
            <div>
              <span className="text-gray-400">Phone: </span>
              {data.phone}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
