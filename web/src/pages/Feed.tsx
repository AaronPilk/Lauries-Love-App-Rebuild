import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useFeatureFlags } from '../lib/featureFlags';

type FeedPost = {
  id: string;
  body: string;
  created_at: string;
  like_count: number;
  visibility: string;
  author: {
    first_name: string | null;
    display_name: string | null;
    avatar_path: string | null;
  } | null;
  comments: { count: number }[];
};

// Reads the same posts the mobile feed reads. RLS lets the caller see public
// posts + their own + posts in groups they belong to. Uses the denormalized
// like_count column (no unbounded liker arrays).
async function fetchFeed(): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, body, created_at, like_count, visibility, author:profiles!posts_author_id_fkey(first_name, display_name, avatar_path), comments(count)',
    )
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []) as unknown as FeedPost[];
}

function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl ?? null;
}

export function Feed() {
  const { isEnabled } = useFeatureFlags();
  const { data, isLoading, error } = useQuery({
    queryKey: ['feed'],
    queryFn: fetchFeed,
  });

  if (!isEnabled('community_wall'))
    return <p className="text-gray-500">The community wall is turned off.</p>;
  if (isLoading) return <p className="text-brand-700">Loading the feed…</p>;
  if (error)
    return <p className="text-red-600">Couldn’t load the feed.</p>;
  if (!data || data.length === 0)
    return <p className="text-gray-500">It’s quiet here — no posts yet.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-700">Community</h1>
      {data.map((p) => {
        const name =
          p.author?.display_name || p.author?.first_name || 'Member';
        const img = avatarUrl(p.author?.avatar_path);
        return (
          <article
            key={p.id}
            className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm"
          >
            <header className="mb-2 flex items-center gap-3">
              {img ? (
                <img
                  src={img}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {name[0]}
                </div>
              )}
              <div>
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-xs text-gray-400">
                  {new Date(p.created_at).toLocaleDateString()}
                  {p.visibility === 'group' && ' · group'}
                </div>
              </div>
            </header>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
              {p.body}
            </p>
            <footer className="mt-3 flex gap-4 text-sm text-gray-500">
              <span>♥ {p.like_count}</span>
              <span>💬 {p.comments?.[0]?.count ?? 0}</span>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
