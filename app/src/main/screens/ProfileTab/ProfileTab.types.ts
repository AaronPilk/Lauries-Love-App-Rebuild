import { z } from 'zod';
import {
  nameModalsInformationSchema,
  nameModalsProfileContainerSchema,
  nameModalsProfileTabContainerSchema,
  nameModalsSettingsContainerSchema,
} from './ProfileTab.schema';

export type ItemsProfileType = z.infer<typeof nameModalsProfileContainerSchema>;

export type ItemsSettingsType = z.infer<
  typeof nameModalsSettingsContainerSchema
>;

export type ItemsProfileTabType = z.infer<
  typeof nameModalsProfileTabContainerSchema
>;

export type ItemsInfoProfileType = z.infer<typeof nameModalsInformationSchema>;
