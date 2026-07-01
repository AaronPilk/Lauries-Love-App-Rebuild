import { Picture } from './picture.model';

export type UserInput = {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  diagnosedYear?: string;
  zipCode?: string;
  country?: string;
  password?: string;
  typeCancer?: string[];
  diagnosisSubType?: string[];
  age?: string;
  gender?: string;
  type?: string;
  profilePicture?: Picture;
};
