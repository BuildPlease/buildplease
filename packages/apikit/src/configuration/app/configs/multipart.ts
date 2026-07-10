import type {
  FastifyMultipartAttachFieldsToBodyOptions,
  FastifyMultipartBaseOptions,
  FastifyMultipartOptions,
} from '@fastify/multipart';
import { ApiKitAppDefaults } from '@internal/configuration/app';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export type MultipartOptions =
  | FastifyMultipartBaseOptions
  | FastifyMultipartOptions
  | FastifyMultipartAttachFieldsToBodyOptions;

export const MultipartConfiguration = defineConfiguration('apikit.multipart', {
  enabled: field.boolean().default(ApiKitAppDefaults.multipart.enabled),
  options: field.custom<MultipartOptions>().default(ApiKitAppDefaults.multipart.options as MultipartOptions),
});

export type MultipartConfig = InferConfiguration<typeof MultipartConfiguration>;
