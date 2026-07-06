/**
 * Unit tests for the pure adapter-layer mapper logic in supabase.api.ts.
 *
 * toProfilePatch() and mapDefinition() are module-private, so we exercise them
 * through the ONE exported surface that funnels into them: supabaseApi().
 *
 *   - PATCH /users/:id      -> toProfilePatch(): the safe/priv PII split
 *   - /valueDefinitions/... -> mapDefinition():  row -> legacy definition shape
 *
 * ../client is fully mocked with a chainable, call-recording fake so these run
 * with NO live DB and NO native modules — just the pure transforms.
 *
 * NOTE: everything the jest.mock factory touches is either created inside the
 * factory or prefixed `mock*` — jest hoists mock factories above imports and
 * forbids referencing other out-of-scope variables.
 */

// Shared, hoisting-safe recorders (the `mock` prefix is allow-listed by jest).
const mockCaptured: Array<{ table: string; op: string; payload: any }> = [];
const mockState: { valueDefRows: any[] } = { valueDefRows: [] };

jest.mock('../client', () => {
  const UID = '11111111-1111-1111-1111-111111111111';

  const profileRow = () => ({
    id: UID,
    email: 'me@example.com',
    first_name: 'Ada',
    last_name: 'Lovelace',
    display_name: 'Ada',
    role_id: null,
    diagnosis_type_ids: [],
    diagnosis_subtype_ids: [],
    latitude: null,
    longitude: null,
  });

  const makeBuilder = (table: string) => {
    const result: any = { data: [], error: null, count: 0 };
    const builder: any = {
      select: jest.fn(() => builder),
      eq: jest.fn(() => builder),
      is: jest.fn(() => builder),
      in: jest.fn(() => builder),
      or: jest.fn(() => builder),
      order: jest.fn(() =>
        table === 'value_definitions'
          ? Promise.resolve({ data: mockState.valueDefRows, error: null })
          : builder,
      ),
      limit: jest.fn(() => builder),
      update: jest.fn((payload: any) => {
        mockCaptured.push({ table, op: 'update', payload });
        return builder;
      }),
      upsert: jest.fn((payload: any) => {
        mockCaptured.push({ table, op: 'upsert', payload });
        return builder;
      }),
      insert: jest.fn((payload: any) => {
        mockCaptured.push({ table, op: 'insert', payload });
        return builder;
      }),
      delete: jest.fn(() => builder),
      single: () => Promise.resolve({ data: profileRow(), error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      // Make the builder awaitable (update().eq() has no terminal .single()).
      then: (resolve: any) => resolve(result),
    };
    return builder;
  };

  return {
    supabase: {
      from: jest.fn((table: string) => makeBuilder(table)),
      rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
      auth: {
        getSession: jest.fn(() =>
          Promise.resolve({
            data: { session: { user: { id: UID, email: 'me@example.com' } } },
          }),
        ),
      },
    },
    currentUserId: jest.fn(() => Promise.resolve(UID)),
    assertUuid: (v: string) => v,
  };
});

// __DEV__ isn't defined in the plain jest env; supabaseApi logs behind it.
(global as any).__DEV__ = false;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { supabaseApi } = require('../supabase.api');

const UID = '11111111-1111-1111-1111-111111111111';

const patchedTo = (table: string) =>
  mockCaptured.find(
    c => c.table === table && (c.op === 'update' || c.op === 'upsert'),
  )?.payload;

beforeEach(() => {
  mockCaptured.length = 0;
  mockState.valueDefRows = [];
});

describe('toProfilePatch (via PATCH /users/:id)', () => {
  it('routes public fields to profiles and PII to profiles_private', async () => {
    await supabaseApi(`/users/${UID}`, {
      method: 'PATCH',
      data: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phoneNumber: '+15551234567',
        zipCode: '90210',
        city: 'Los Angeles',
      },
    });

    const safe = patchedTo('profiles');
    const priv = patchedTo('profiles_private');

    expect(safe).toMatchObject({
      first_name: 'Ada',
      last_name: 'Lovelace',
      city: 'Los Angeles',
    });
    // PII must NOT leak into the community-visible row.
    expect(safe).not.toHaveProperty('email');
    expect(safe).not.toHaveProperty('phone_number');
    expect(safe).not.toHaveProperty('zip_code');

    // PII isolated to the owner-only private row.
    expect(priv).toMatchObject({
      email: 'ada@example.com',
      phone_number: '+15551234567',
      zip_code: '90210',
    });
  });

  it('maps a role object to its id and geoLocation into lat/lng columns', async () => {
    await supabaseApi(`/users/${UID}`, {
      method: 'PATCH',
      data: {
        role: { id: 'role-abc', valueDefinition: 'Patient' },
        geoLocation: { latitude: 34.05, longitude: -118.24 },
      },
    });

    const safe = patchedTo('profiles');
    expect(safe.role_id).toBe('role-abc');
    expect(safe.latitude).toBe(34.05);
    expect(safe.longitude).toBe(-118.24);
  });

  it('splits config.notifications into private push_* columns', async () => {
    await supabaseApi(`/users/${UID}`, {
      method: 'PATCH',
      data: {
        config: {
          notifications: {
            active: true,
            notificationToken: 'tok-123',
            deviceType: 'ios',
          },
        },
      },
    });

    const priv = patchedTo('profiles_private');
    expect(priv).toMatchObject({
      push_active: true,
      push_token: 'tok-123',
      device_type: 'ios',
    });
  });

  it('does not touch profiles when only PII fields are patched', async () => {
    await supabaseApi(`/users/${UID}`, {
      method: 'PATCH',
      data: { email: 'onlypii@example.com' },
    });

    expect(patchedTo('profiles')).toBeUndefined();
    expect(patchedTo('profiles_private')).toMatchObject({
      email: 'onlypii@example.com',
    });
  });
});

describe('mapDefinition (via /valueDefinitions/byTypeAndName)', () => {
  it('shapes a raw value_definitions row into the legacy definition object', async () => {
    mockState.valueDefRows = [
      {
        id: 'def-1',
        definition_type: 'DIAGNOSIS_TYPE',
        value: 'Leukemia',
        description: 'Blood cancer',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'def-2',
        definition_type: 'ROLE',
        value: 'Patient',
        description: 'A patient',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    ];

    // supabase.api.ts caches definitions in a module-level var after the first
    // load, and the PATCH tests above already primed that cache (with []). Load
    // a fresh module instance so mapDefinition() actually runs on our rows.
    let freshApi: any;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      freshApi = require('../supabase.api');
    });

    const out = await freshApi.supabaseApi(
      '/valueDefinitions/byTypeAndName?type=DIAGNOSIS_TYPE',
    );

    // Filtered to the requested type only.
    expect(Array.isArray(out)).toBe(true);
    expect(out).toHaveLength(1);

    const def = out[0];
    expect(def.id).toBe('def-1');
    expect(def.valueDefinition).toBe('Leukemia');
    expect(def.description).toBe('Blood cancer');
    expect(def.active).toBe(true);
    expect(def.creatorUserId).toBe('system');
    expect(def.definitionType.definitionType).toBe('DIAGNOSIS_TYPE');
  });
});
