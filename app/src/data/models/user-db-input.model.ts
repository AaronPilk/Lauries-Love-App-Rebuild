import { User } from './user.model';

export interface UserDBInput
  extends Partial<Omit<User, 'diagnosisType' | 'diagnosisSubType'>> {
  diagnosisTypes?: string[];
  diagnosisSubTypes?: string[];
}
