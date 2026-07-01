import { defaultNS } from 'presentation/translations';
import * as resources from 'presentation/translations/resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}
