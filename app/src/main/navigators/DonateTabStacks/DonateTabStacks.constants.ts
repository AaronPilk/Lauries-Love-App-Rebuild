// types
import { RootDonateTabParamList } from './DonateTabStacks.types';

// constants
import { PATHS_DONATE_TAB } from '../paths';
import DonateTabMain from 'main/screens/Donate/DonateTabMain/DonateTabMain';
import DonateCheckout from 'main/screens/Donate/DonateCheckout/DonateCheckout';
import DonateInvoice from 'main/screens/Donate/DonateInvoice/DonateInvoice';
import DonateTabJoinTheFight from 'main/screens/Donate/DonateJoinTheFight/DonateTabJoinTheFight';

export const LIST_DONATE_TAB_SCREENS: Array<{
  id: keyof RootDonateTabParamList;
  name: keyof RootDonateTabParamList;
  title: keyof RootDonateTabParamList;
  component: React.ComponentType<any>;
  headerShown: boolean;
  gestureEnabled?: boolean;
}> = [
  {
    id: PATHS_DONATE_TAB.donateTabMain,
    name: PATHS_DONATE_TAB.donateTabMain,
    title: PATHS_DONATE_TAB.donateTabMain,
    component: DonateTabMain,
    headerShown: false,
    gestureEnabled: false,
  },
  {
    id: PATHS_DONATE_TAB.donateTabCheckout,
    name: PATHS_DONATE_TAB.donateTabCheckout,
    title: PATHS_DONATE_TAB.donateTabCheckout,
    component: DonateCheckout,
    headerShown: false,
    gestureEnabled: false,
  },
  {
    id: PATHS_DONATE_TAB.donateTabInvoice,
    name: PATHS_DONATE_TAB.donateTabInvoice,
    title: PATHS_DONATE_TAB.donateTabInvoice,
    component: DonateInvoice,
    headerShown: false,
    gestureEnabled: false,
  },
  {
    id: PATHS_DONATE_TAB.donateTabJoinTheFight,
    name: PATHS_DONATE_TAB.donateTabJoinTheFight,
    title: PATHS_DONATE_TAB.donateTabJoinTheFight,
    component: DonateTabJoinTheFight,
    headerShown: false,
    gestureEnabled: false,
  }
];
