// moderate-content
// Body: { entity_type: 'post' | 'comment', entity_id: uuid, text: string }
// Calls the OpenAI moderation endpoint. If flagged, inserts a row into
// `moderation_queue` (flagged_by='ai', score, status='pending') for human review.
//
// This is designed to REPLACE the keyword-heuristic DB trigger: the app should
// call this after a post/comment is created. It resolves org_id (lauries-love)
// and author_id server-side so the queue row matches the schema's constraints.
//
// Required secrets: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Optional secrets: OPENAI_MODERATION_MODEL (default 'omni-moderation-latest')
import { handlePreflight, json, notConfigured } from '../_shared/cors.ts';
import { adminClient, env, getUser, missingEnv } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const missing = missingEnv([
    'OPENAI_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]);
  if (missing.length) return notConfigured(missing);

  // SECURITY (2026-08-23): require an authenticated caller. Previously anyone
  // could hit this unauthenticated and burn the OpenAI key (cost DoS) + spam
  // the moderation queue. Below we also require the caller to be the content's
  // author (or staff) before spending an OpenAI call.
  const caller = await getUser(req);
  if (!caller) return json({ error: 'unauthorized' }, 401);

  try {
    const body = await req.json().catch(() => ({}));
    const entityType: string = body.entity_type;
    const entityId: string = body.entity_id;
    const text: string = body.text ?? '';

    if (entityType !== 'post' && entityType !== 'comment') {
      return json({ error: "entity_type must be 'post' or 'comment'" }, 400);
    }
    if (!entityId) return json({ error: 'entity_id is required' }, 400);
    if (!text.trim()) {
      return json({ flagged: false, categories: {}, note: 'empty text' });
    }

    const admin = adminClient();

    // Authorize BEFORE calling OpenAI: only the author of the content (or a
    // staff member) may moderate it.
    const srcTable = entityType === 'post' ? 'posts' : 'comments';
    const { data: srcRow } = await admin
      .from(srcTable)
      .select('author_id')
      .eq('id', entityId)
      .maybeSingle();
    if (!srcRow) return json({ error: 'entity not found' }, 404);
    if (srcRow.author_id !== caller.id) {
      const { data: staffRow } = await admin
        .from('support_staff')
        .select('profile_id')
        .eq('profile_id', caller.id)
        .maybeSingle();
      if (!staffRow) return json({ error: 'forbidden' }, 403);
    }

    const model = env('OPENAI_MODERATION_MODEL') ?? 'omni-moderation-latest';

    const resp = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, input: text }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return json({ error: 'openai_error', status: resp.status, detail }, 502);
    }

    const result = await resp.json();
    const item = result?.results?.[0] ?? {};
    const flagged: boolean = !!item.flagged;
    const categories: Record<string, boolean> = item.categories ?? {};
    const categoryScores: Record<string, number> = item.category_scores ?? {};

    // Highest category score = a single 0..1 severity signal for reviewers.
    const score = Object.values(categoryScores).reduce(
      (max, v) => (typeof v === 'number' && v > max ? v : max),
      0,
    );

    // Only flagged content enters the human-review queue.
    if (flagged) {
      // Resolve org + author to satisfy moderation_queue's shape.
      const { data: org } = await admin
        .from('organizations')
        .select('id')
        .eq('slug', 'lauries-love')
        .maybeSingle();

      const table = entityType === 'post' ? 'posts' : 'comments';
      const { data: entity } = await admin
        .from(table)
        .select('author_id')
        .eq('id', entityId)
        .maybeSingle();

      // Human-readable reason: the categories that tripped.
      const reasons = Object.entries(categories)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(', ');

      // Idempotent-ish: skip if this entity is already pending in the queue.
      const { data: existing } = await admin
        .from('moderation_queue')
        .select('id')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('status', 'pending')
        .maybeSingle();

      if (!existing) {
        const { error: insErr } = await admin.from('moderation_queue').insert({
          org_id: org?.id ?? null,
          entity_type: entityType,
          entity_id: entityId,
          author_id: entity?.author_id ?? null,
          reason: reasons ? `AI: ${reasons}` : 'AI: flagged',
          score,
          flagged_by: 'ai',
          status: 'pending',
        });
        if (insErr) throw insErr;
      }
    }

    return json({ flagged, categories, score });
  } catch (e) {
    return json({ error: (e as Error).message ?? 'moderation failed' }, 500);
  }
});
