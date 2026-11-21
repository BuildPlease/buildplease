import { type InferConfiguration, defineConfiguration, field } from '@buildplease/core/node';
import type {
  FastifyMultipartAttachFieldsToBodyOptions,
  FastifyMultipartBaseOptions,
  FastifyMultipartOptions,
} from '@fastify/multipart';
import { ApiKitDefaults } from '@src-internal/configuration';

export type MultipartOptions =
  FastifyMultipartBaseOptions | FastifyMultipartOptions | FastifyMultipartAttachFieldsToBodyOptions;

export const MultipartConfiguration = defineConfiguration('apikit.multipart', {
  enabled: field.boolean().default(ApiKitDefaults.multipart.enabled),
  options: field.custom<MultipartOptions>().default(ApiKitDefaults.multipart.options as MultipartOptions),
});

export type MultipartConfig = InferConfiguration<typeof MultipartConfiguration>;
