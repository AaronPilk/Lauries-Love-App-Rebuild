// Fake data for mock/demo mode. Shapes match the real API responses
// (definitionSchema, userDbSchema, PaginationResponse) so zod parsing passes.

const NOW = '2026-01-01T00:00:00.000Z';

const defType = (definitionType: string, description: string) => ({
  id: `deftype-${definitionType.toLowerCase()}`,
  active: true,
  createdAt: NOW,
  updatedAt: NOW,
  definitionType,
  description,
  creatorUserId: 'mock',
});

const makeDef = (
  type: string,
  value: string,
  description: string,
  typeDescription: string,
) => ({
  id: `def-${type.toLowerCase()}-${value}`,
  active: true,
  createdAt: NOW,
  updatedAt: NOW,
  valueDefinition: value,
  description,
  validationType: null,
  creatorUserId: 'mock',
  modifierUserId: null,
  definitionType: defType(type, typeDescription),
});

export const MOCK_DEFINITIONS: Record<string, any[]> = {
  DIAGNOSIS_TYPE: [
    ['001', 'Breast Cancer'],
    ['002', 'Lung Cancer'],
    ['003', 'Colorectal Cancer'],
    ['004', 'Prostate Cancer'],
    ['005', 'Pancreatic Cancer'],
    ['006', 'Lymphoma'],
    ['007', 'Leukemia'],
    ['008', 'Melanoma'],
    ['009', 'Ovarian Cancer'],
    ['098', 'No Preference'],
    ['099', 'Other'],
  ].map(([v, d]) => makeDef('DIAGNOSIS_TYPE', v, d, 'Diagnosis types')),
  DIAGNOSIS_SUB_TYPE: [
    ['001', 'Stage I'],
    ['002', 'Stage II'],
    ['003', 'Stage III'],
    ['004', 'Stage IV'],
    ['005', 'Triple Negative'],
    ['006', 'HER2 Positive'],
    ['007', 'In Remission'],
    ['099', 'Other'],
  ].map(([v, d]) => makeDef('DIAGNOSIS_SUB_TYPE', v, d, 'Diagnosis sub types')),
  USER_ROLE: [
    ['001', 'Warrior (patient)'],
    ['002', 'Survivor'],
    ['003', 'Caregiver'],
    ['004', 'Supporter'],
  ].map(([v, d]) => makeDef('USER_ROLE', v, d, 'Group of values for user roles')),
  USER_DESIGNATION: [
    ['001', 'Warrior (patient)'],
    ['002', 'Survivor'],
    ['003', 'Caregiver'],
    ['004', 'Supporter'],
  ].map(([v, d]) => makeDef('USER_DESIGNATION', v, d, 'User designations')),
  USER_NOTIFICATIONS: [
    ['001', 'Friend requests'],
    ['002', 'Messages'],
    ['003', 'Community posts'],
  ].map(([v, d]) => makeDef('USER_NOTIFICATIONS', v, d, 'User notifications')),
};

const role = (i: number) => MOCK_DEFINITIONS.USER_ROLE[i % 4];
const diag = (i: number) => MOCK_DEFINITIONS.DIAGNOSIS_TYPE[i % 9];
const subDiag = (i: number) => MOCK_DEFINITIONS.DIAGNOSIS_SUB_TYPE[i % 7];

const baseUser = (i: number, overrides: Record<string, any>) => ({
  id: `mock-user-${i}`,
  cognitoId: `mock-cognito-${i}`,
  sendBirdId: `mock-sendbird-${i}`,
  email: `user${i}@example.com`,
  firstName: overrides.firstName ?? `User${i}`,
  lastName: overrides.lastName ?? 'Demo',
  displayName: overrides.displayName ?? `User ${i}`,
  diagnosisYear: overrides.diagnosisYear ?? `${2015 + (i % 10)}`,
  designation: role(i),
  role: role(i),
  phoneNumber: null,
  phoneNumberLocation: 'US',
  dob: null,
  addressLine1: null,
  addressLine2: null,
  city: overrides.city ?? 'Nashville',
  state: overrides.state ?? 'TN',
  country: 'United States',
  zipCode: overrides.zipCode ?? '37203',
  geoLocation: overrides.geoLocation ?? null,
  diagnosisTypes: overrides.diagnosisTypes ?? [diag(i)],
  diagnosisSubTypes: overrides.diagnosisSubTypes ?? [subDiag(i)],
  age: overrides.age ?? `${30 + (i % 5) * 5}-${35 + (i % 5) * 5}`,
  gender: overrides.gender ?? (i % 2 ? 'Female' : 'Male'),
  diagnosisDate: null,
  timeline: null,
  profilePicture: null,
  config: { notifications: { active: false, notificationToken: '', deviceType: 'ios' } },
  description: overrides.description ?? 'Mock community member for local testing.',
  active: true,
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

// Spread across US metros so the map has markers wherever you pan.
const METROS: Array<[string, string, number, number]> = [
  ['Nashville', 'TN', 36.16, -86.78],
  ['Atlanta', 'GA', 33.75, -84.39],
  ['Dallas', 'TX', 32.78, -96.8],
  ['Phoenix', 'AZ', 33.45, -112.07],
  ['Denver', 'CO', 39.74, -104.99],
  ['Chicago', 'IL', 41.88, -87.63],
  ['New York', 'NY', 40.71, -74.01],
  ['Los Angeles', 'CA', 34.05, -118.24],
  ['Miami', 'FL', 25.76, -80.19],
  ['Seattle', 'WA', 47.61, -122.33],
  ['Boston', 'MA', 42.36, -71.06],
  ['Kansas City', 'MO', 39.1, -94.58],
];

const FIRST_NAMES = [
  'Sarah', 'Emily', 'Jessica', 'Maria', 'Karen', 'Linda',
  'Mike', 'David', 'Chris', 'James', 'Anna', 'Rachel',
];

export const MOCK_USERS = METROS.map(([city, state, lat, lng], i) =>
  baseUser(i + 2, {
    firstName: FIRST_NAMES[i],
    displayName: `${FIRST_NAMES[i]} ${'D'}.`,
    city,
    state,
    geoLocation: {
      latitude: lat + (Math.random() - 0.5) * 0.1,
      longitude: lng + (Math.random() - 0.5) * 0.1,
    },
  }),
);

// The signed-in mock user. Mutable: PUT /users/:id merges into it so the
// onboarding/profile-edit flows behave like the real thing.
export const MOCK_CURRENT_USER = baseUser(1, {
  id: 'mock-user-1',
  cognitoId: 'mock-cognito-1',
  email: 'pilk@test.com',
  firstName: 'Pilk',
  lastName: 'Tester',
  displayName: 'Pilk (Test)',
  city: 'Nashville',
  state: 'TN',
  geoLocation: { latitude: 36.1627, longitude: -86.7816 },
  description: 'Local test account (mock mode).',
});
