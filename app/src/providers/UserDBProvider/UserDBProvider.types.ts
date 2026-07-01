import { z } from 'zod';
import { userDbSchema } from './UserDBProvider.schemas';

export type UserDBType = z.infer<typeof userDbSchema>;

export interface UserOnboardingType {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  phoneLocation?: string;
  country?: string;
  city?: string;
  zipCode?: string;
  geoLocation?: { latitude: number; longitude: number };
  userType?: string;
  cancerType?: string;
  subCancerType?: string;
  ageRange?: string;
  gender?: string;
  diagnosedYear?: string;
}
