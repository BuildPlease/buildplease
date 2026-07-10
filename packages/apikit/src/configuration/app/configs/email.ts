import { ApiKitAppDefaults } from '@internal/configuration/app';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export const EmailConfiguration = defineConfiguration('apikit.email', {
  enabled: field.boolean().default(ApiKitAppDefaults.email.enabled),
  templatesPath: field.string().default(ApiKitAppDefaults.email.templatesPath),
  globals: field.custom<Record<string, unknown>>().default(ApiKitAppDefaults.email.globals),

  smtp: {
    host: field.string().optional(),
    port: field.number().optional(),
    secure: field.boolean().optional(),
    user: field.string().optional(),
    password: field.string().optional(),
  },
});

export type EmailConfig = InferConfiguration<typeof EmailConfiguration>;
