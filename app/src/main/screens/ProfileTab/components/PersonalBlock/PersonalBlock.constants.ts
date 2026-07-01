import {
  IconCalendarProfile,
  IconFileProfile,
  IconListProfile,
  IconLocationProfile,
  IconLockProfile,
  IconMailProfile,
  IconPhoneProfile,
  IconRoleProfile,
} from 'assets/icons-auto/components';
import { IconType } from 'assets/icons-auto/icon.types';
import {
  ItemsInfoProfileType,
  ItemsProfileTabType,
} from '../../ProfileTab.types';

export const LIST_BUTTONS_PERSONAL_BLOCK: Array<{
  id: string;
  title: string;
  type: ItemsProfileTabType;
  Icon: (originalProps: IconType) => React.JSX.Element;
}> = [
  {
    id: 'role',
    title: 'Role',
    type: 'role',
    Icon: IconRoleProfile,
  },
  {
    id: 'address',
    title: 'Address',
    type: 'address',
    Icon: IconLocationProfile,
  },
  {
    id: 'age',
    title: 'Age',
    type: 'age',
    Icon: IconCalendarProfile,
  },
  {
    id: 'gender',
    title: 'Gender',
    type: 'gender',
    Icon: IconRoleProfile,
  },
  {
    id: 'cancerType',
    title: 'Cancer type',
    type: 'cancerType',
    Icon: IconListProfile,
  },
  {
    id: 'sebCancerType',
    title: 'Sub cancer type',
    type: 'subCancerType',
    Icon: IconListProfile,
  },
  {
    id: 'diagnosedYear',
    title: 'Diagnosed year',
    type: 'diagnosedYear',
    Icon: IconFileProfile,
  },
];

export const LIST_BUTTONS_INFO_BLOCK: Array<{
  id: string;
  title: string;
  type: ItemsInfoProfileType;
  Icon: (originalProps: IconType) => React.JSX.Element;
}> = [
  {
    id: 'fullName',
    title: 'Full name',
    type: 'fullName',
    Icon: IconRoleProfile,
  },
  {
    id: 'email',
    title: 'Email',
    type: 'email',
    Icon: IconMailProfile,
  },
  {
    id: 'phone',
    title: 'Phone',
    type: 'phone',
    Icon: IconPhoneProfile,
  },
  {
    id: 'password',
    title: 'Password',
    type: 'password',
    Icon: IconLockProfile,
  },
];
