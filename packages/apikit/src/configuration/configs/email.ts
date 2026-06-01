import { ApiKitDefaults } from '@internal/configuration/apikit-defaults';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export const EmailConfiguration = defineConfiguration('apikit.email', {
  enabled: field.boolean().default(ApiKitDefaults.email.enabled),
  templatesPath: field.string().default(ApiKitDefaults.email.templatesPath),
  globals: field.custom<Record<string, unknown>>().default(ApiKitDefaults.email.globals),

  smtp: {
    host: field.string().optional(),
    port: field.number().optional(),
    secure: field.boolean().optional(),
    user: field.string().optional(),
    password: field.string().optional(),
  },
});

export type EmailConfig = InferConfiguration<typeof EmailConfiguration>;
