// Real-backend router: same route surface as mockApi, backed by Supabase.
// ApiProvider calls this when BACKEND === 'supabase', so the 540-file screen
// layer keeps working unchanged while we retire the old REST API.

import { supabase, currentUserId, assertUuid } from './client';

// ---------------------------------------------------------------------------
// Shape mappers: Postgres rows -> the legacy API shapes the app expects
// ---------------------------------------------------------------------------

type DefRow = {
  id: string;
  definition_type: string;
  value: string;
  description: string;
  active: boolean;
  created_at: string;
};

const mapDefinition = (row: DefRow) => ({
  id: row.id,
  active: row.active,
  createdAt: row.created_at,
  updatedAt: row.created_at,
  valueDefinition: row.value,
  description: row.description,
  validationType: null,
  creatorUserId: 'system',
  modifierUserId: null,
  definitionType: {
    id: `type-${row.definition_type}`,
    active: true,
    createdAt: row.created_at,
    updatedAt: row.created_at,
    definitionType: row.definition_type,
    description: row.definition_type,
    creatorUserId: 'system',
  },
});

// Definitions are static per session — cache after first load.
// Both the list and an id->def Map are cached so profile mapping is O(1) per
// field instead of O(defs) via Array.find (matters when mapping 500 profiles).
let defsCache: ReturnType<typeof mapDefinition>[] | null = null;
let defsByIdCache: Map<string, ReturnType<typeof mapDefinition>> | null = null;
async function getAllDefinitions() {
  if (defsCache) return defsCache;
  const { data, error } = await supabase
    .from('value_definitions')
    .select('*')
    .eq('active', true)
    .order('sort');
  if (error) throw error;
  defsCache = (data as DefRow[]).map(mapDefinition);
  defsByIdCache = new Map(defsCache.map(d => [d.id, d]));
  return defsCache;
}

async function getDefinitionsById() {
  if (!defsByIdCache) await getAllDefinitions();
  return defsByIdCache!;
}

/** Synchronous profile mapper — pass the prebuilt definitions Map. */
function mapProfileWith(
  row: any,
  defsById: Map<string, ReturnType<typeof mapDefinition>>,
) {
  const byId = (id: string) => defsById.get(id) ?? id;
  const roleDef = row.role_id ? defsById.get(row.role_id) ?? null : null;
  return {
    id: row.id,
    cognitoId: row.id, // legacy field name; = auth uid in V2
    sendBirdId: row.id, // legacy; chat now keys on profile id
    email: row.email,
    firstName: row.first_name ?? '',
    lastName: row.last_name,
    displayName: row.display_name,
    diagnosisYear: row.diagnosis_year,
    designation: roleDef,
    role: roleDef,
    phoneNumber: row.phone_number,
    phoneNumberLocation: row.phone_number_location,
    dob: null,
    addressLine1: null,
    addressLine2: null,
    city: row.city,
    state: row.state,
    country: row.country,
    zipCode: row.zip_code,
    geoLocation:
      row.latitude != null && row.longitude != null
        ? { latitude: row.latitude, longitude: row.longitude }
        : null,
    diagnosisTypes: (row.diagnosis_type_ids ?? []).map(byId),
    diagnosisSubTypes: (row.diagnosis_subtype_ids ?? []).map(byId),
    age: row.age_range,
    gender: row.gender,
    diagnosisDate: null,
    timeline: null,
    profilePicture: row.avatar_path,
    config: {
      notifications: {
        active: row.push_active ?? false,
        notificationToken: row.push_token ?? '',
        deviceType: row.device_type ?? '',
      },
    },
    description: row.description,
  };
}

async function mapProfile(row: any) {
  return mapProfileWith(row, await getDefinitionsById());
}

// Legacy camelCase user fields -> profiles columns
function toProfilePatch(data: Record<string, any>) {
  const defIdOf = (v: any) => (typeof v === 'string' ? v : v?.id ?? null);
  const patch: Record<string, any> = {};
  if ('firstName' in data) patch.first_name = data.firstName;
  if ('lastName' in data) patch.last_name = data.lastName;
  if ('displayName' in data) patch.display_name = data.displayName;
  if ('email' in data && data.email) patch.email = data.email;
  if ('role' in data) patch.role_id = defIdOf(data.role);
  if ('diagnosisTypes' in data)
    patch.diagnosis_type_ids = (data.diagnosisTypes ?? [])
      .map(defIdOf)
      .filter(Boolean);
  if ('diagnosisSubTypes' in data)
    patch.diagnosis_subtype_ids = (data.diagnosisSubTypes ?? [])
      .map(defIdOf)
      .filter(Boolean);
  if ('diagnosisYear' in data) patch.diagnosis_year = data.diagnosisYear;
  if ('age' in data) patch.age_range = data.age;
  if ('gender' in data) patch.gender = data.gender;
  if ('description' in data) patch.description = data.description;
  if ('phoneNumber' in data) patch.phone_number = data.phoneNumber;
  if ('phoneNumberLocation' in data)
    patch.phone_number_location = data.phoneNumberLocation;
  if ('city' in data) patch.city = data.city;
  if ('state' in data) patch.state = data.state;
  if ('country' in data) patch.country = data.country;
  if ('zipCode' in data) patch.zip_code = data.zipCode;
  if ('geoLocation' in data) {
    patch.latitude = data.geoLocation?.latitude ?? null;
    patch.longitude = data.geoLocation?.longitude ?? null;
  }
  if ('profilePicture' in data) patch.avatar_path = data.profilePicture;
  if ('config' in data && data.config?.notifications) {
    patch.push_active = data.config.notifications.active ?? false;
    patch.push_token = data.config.notifications.notificationToken ?? '';
    patch.device_type = data.config.notifications.deviceType ?? '';
  }
  if ('active' in data) patch.active = data.active;
  return patch;
}

// Shared UUID guard lives in ./client (also used by chat realtime filters).

// Local cached session read — no network round-trip per request.
const uid = currentUserId;

// ---------------------------------------------------------------------------
// Router — same contract as mockApi(url, {method, data})
// ---------------------------------------------------------------------------
export async function supabaseApi(
  url: string,
  config: { method?: string; data?: any } = {},
): Promise<any> {
  const method = (config.method || 'GET').toUpperCase();
  const path = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
  const query = url.includes('?') ? url.split('?')[1] : '';

  if (__DEV__) console.log(`🗄️ supabaseApi: ${method} ${path}`);

  // --- value definitions ---------------------------------------------------
  if (path === '/valueDefinitions/byTypeAndName') {
    const type = /type=([A-Z_]+)/.exec(query)?.[1] || '';
    const defs = await getAllDefinitions();
    return defs.filter(d => d.definitionType?.definitionType === type);
  }

  // --- users ----------------------------------------------------------------
  if (path.startsWith('/users/getUserInfoByCognitoId/')) {
    const id = path.split('/').pop()!;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return mapProfile(data);
  }

  if (path === '/users/intercom/user-hash') return null;

  const friendReqMatch = /^\/users\/([^/]+)\/friend-requests$/.exec(path);
  if (friendReqMatch) {
    const otherId = assertUuid(friendReqMatch[1], 'user id');
    const me = await uid();
    if (!me) throw new Error('Not authenticated');

    if (method === 'GET') {
      const { data, error } = await supabase
        .from('friendships')
        .select('status')
        .or(
          `and(requester_id.eq.${me},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${me})`,
        );
      if (error) throw error;
      return data ?? [];
    }
    if (method === 'POST') {
      const { data, error } = await supabase
        .from('friendships')
        .insert({ requester_id: me, addressee_id: otherId })
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        active: true,
        status: data.status,
        sender: { id: me },
      };
    }
    if (method === 'PUT') {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('requester_id', otherId)
        .eq('addressee_id', me);
      if (error) throw error;
      return { status: 'accepted' };
    }
    if (method === 'DELETE') {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(
          `and(requester_id.eq.${me},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${me})`,
        );
      if (error) throw error;
      return { ok: true };
    }
  }

  if (path === '/users') {
    const me = await uid();
    if (method === 'GET') {
      // NOTE: capped page for now; /nearby + real pagination replace the old
      // fetch-everything pattern before launch.
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('active', true)
        .limit(500);
      if (error) throw error;
      // Single-pass, synchronous mapping with a prebuilt definitions Map —
      // no per-row awaits/promises for a 500-profile page.
      const defsById = await getDefinitionsById();
      const mapped = (data ?? []).map(row => mapProfileWith(row, defsById));
      return {
        data: mapped,
        count: mapped.length,
        total: count ?? mapped.length,
        page: 1,
        pageCount: 1,
      };
    }
    if (method === 'POST') {
      // Legacy "create profile" -> fill in the trigger-created row.
      if (!me) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('profiles')
        .update(toProfilePatch(config.data ?? {}))
        .eq('id', me)
        .select()
        .single();
      if (error) throw error;
      return mapProfile(data);
    }
    if (method === 'DELETE') {
      if (!me) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({ active: false })
        .eq('id', me);
      if (error) throw error;
      return { ok: true };
    }
  }

  const userByIdMatch = /^\/users\/([^/]+)$/.exec(path);
  if (userByIdMatch) {
    const id = userByIdMatch[1];
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return mapProfile(data);
    }
    if (method === 'PUT' || method === 'PATCH') {
      const { data, error } = await supabase
        .from('profiles')
        .update(toProfilePatch(config.data ?? {}))
        .eq('id', id) // RLS guarantees only own row is writable
        .select()
        .single();
      if (error) throw error;
      return mapProfile(data);
    }
  }

  // --- notifications ---------------------------------------------------------
  if (path === '/notifications') {
    const me = await uid();
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', me)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      const rows = data ?? [];

      // Resolve senders in one query -> actor firstName/profilePicture.
      const senderIds = [
        ...new Set(rows.map(r => r.sender_id).filter(Boolean)),
      ];
      const sendersById: Record<string, any> = {};
      if (senderIds.length > 0) {
        const { data: senders } = await supabase
          .from('profiles')
          .select('id, first_name, display_name, avatar_path')
          .in('id', senderIds);
        (senders ?? []).forEach(s => {
          sendersById[s.id] = s;
        });
      }

      // Legacy shape the Notifications screen reads:
      //   item.active, item.id, item.createdAt,
      //   item.notificationObject.entity            -> senderId
      //   item.notificationObject.entityType.description -> NEW_LIKE | NEW_MESSAGE | NEW_FRIEND_REQUEST
      //   item.notificationObject.content
      //   item.notificationObject.redirect          -> 'sendbird/<postId>/<messageId>'
      //   item.notificationObject.notificationChange.actor.{firstName, profilePicture}
      const mapped = rows.map(row => {
        const sender = row.sender_id ? sendersById[row.sender_id] : null;
        return {
          id: row.id,
          active: row.read_at == null,
          createdAt: row.created_at,
          notificationObject: {
            entity: row.sender_id ?? '',
            entityType: { description: row.entity_type ?? '' },
            content: row.content ?? '',
            redirect: row.meta?.redirectUrl ?? '',
            notificationChange: {
              actor: {
                firstName: sender?.first_name || sender?.display_name || '',
                profilePicture: sender?.avatar_path ?? '',
              },
            },
          },
        };
      });

      return {
        data: mapped,
        count: mapped.length,
        total: mapped.length,
        page: 1,
        pageCount: 1,
      };
    }
    if (method === 'POST') {
      const d = config.data ?? {};
      const me = await uid();
      if (!me) throw new Error('Not authenticated');
      // SECURITY: sender is ALWAYS the authenticated user — never trust a
      // client-supplied senderId (spoofable). Enforced here and by RLS.
      const { error } = await supabase.from('notifications').insert({
        recipient_id: d.notifierId,
        sender_id: me,
        entity_type: d.entityType,
        content: d.content ?? null,
        meta: d.meta ?? {},
      });
      if (error) throw error;
      return { ok: true, msg: 'sent' };
    }
  }
  if (path === '/notifications/send-push-notification') {
    // Honest stub: delivery is NOT implemented yet (edge function pending).
    // Non-throwing so in-app notification flows aren't blocked on push.
    if (__DEV__) console.warn('[supabase] push delivery not implemented yet');
    return { ok: false, msg: 'push delivery pending (edge function)' };
  }
  const notifMatch = /^\/notifications\/([^/]+)$/.exec(path);
  if (notifMatch && (method === 'PUT' || method === 'PATCH')) {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notifMatch[1]);
    if (error) throw error;
    return { id: notifMatch[1] };
  }

  // --- payments ----------------------------------------------------------------
  if (path === '/payments' && method === 'GET') {
    const me = await uid();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('profile_id', me)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return {
      data: data ?? [],
      count: data?.length ?? 0,
      total: data?.length ?? 0,
      page: 1,
      pageCount: 1,
    };
  }
  if (path.startsWith('/payments') || path.startsWith('/payment-profiles')) {
    // Payment processing moves to an edge function (Authorize.Net + service
    // role). Until then FAIL LOUDLY — a fake success here would let users
    // believe a donation went through.
    throw new Error('Donations are not enabled in this build yet.');
  }

  if (__DEV__)
    console.warn(`🗄️ supabaseApi: UNHANDLED ${method} ${path} — returning null`);
  return null;
}
