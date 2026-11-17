import { defineConfiguration, field } from '../configuration';

export const BuildConfiguration = defineConfiguration('apikit.build', {
  id: field.string().optional(),
});
