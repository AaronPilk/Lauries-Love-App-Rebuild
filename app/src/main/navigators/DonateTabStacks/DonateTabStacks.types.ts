import { PATHS_DONATE_TAB } from '../paths';

export type RootDonateTabParamList = {
  [PATHS_DONATE_TAB.donateTabMain]?: Record<
    string,
    string | number | boolean
  >;
  [PATHS_DONATE_TAB.donateTabCheckout]?: Record<
    string,
    string | number | boolean
  >;
  [PATHS_DONATE_TAB.donateTabInvoice]?: Record<
    string,
    string | number | boolean
  >;
  [PATHS_DONATE_TAB.donateTabJoinTheFight]?: Record<
    string,
    string | number | boolean
  >;
};