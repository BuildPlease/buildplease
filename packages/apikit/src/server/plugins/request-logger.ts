import { Readable } from 'stream';

import { ignoreError, isDefinedAndNotNull } from '@buildplease/core';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { HttpHeaders } from '@/http';
import { RequestLogMetadata } from '@/request';
import type { ServerPluginOptions } from '@/server';

import { resolveRequestLoggerIgnoredPaths, shouldSkipRequestLog } from './request-logger-paths';

const pluginName = 'apikit-request-logger';
const REQUEST_LOG_PREFIX = '[ApiKit:Request]';
const RESPONSE_LOG_PREFIX = '[ApiKit:Response]';

const requestLoggerPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const logger = options.logger;
  const loggerConfig = options.apikitController.logger;
  const debug = options.apikitController.isDebug;
  const ignoredPaths = resolveRequestLoggerIgnoredPaths(options);

  /* Fastify lifecycle (simplified for logging):
     onRequest     → body not parsed yet (only raw stream).
     preParsing    → still raw, unless using a custom parser.
     preValidation → body fully parsed (json/form/multipart)
     preHandler    → same as above, after validation.
     onSend        → response payload before sending.
     onResponse    → after response is sent (payload gone).
  */

  if (!loggerConfig.enabled) {
    return;
  }

  // MARK: [ORDER]: 1 - onRequest (log metadata)
  fastify.addHook('onRequest', async (request) => {
    if (shouldSkipRequestLog(request.url, ignoredPaths)) return;

    const metadata = new RequestLogMetadata(request.metadata);

    ignoreError(() => {
      logger.info(`${REQUEST_LOG_PREFIX} onRequest`, { metadata: metadata });
    });
  });

  // MARK: [ORDER]: 2 - preValidation (log parsed body only if debug)
  fastify.addHook('preValidation', async (request) => {
    if (shouldSkipRequestLog(request.url, ignoredPaths)) return;
    if (!debug) return;

    const metadata = new RequestLogMetadata({ requestId: request.metadata.requestId });

    ignoreError(() => {
      logger.debug(`${REQUEST_LOG_PREFIX} preValidation`, {
        metadata: metadata,
        details: { body: safeSanitize(request.body, request.headers) },
      });
    });
  });

  // MARK: [ORDER]: 3 - onSend (log timing, payload only if debug)
  fastify.addHook('onSend', async (request, reply, payload) => {
    if (shouldSkipRequestLog(request.url, ignoredPaths)) {
      return payload;
    }

    ignoreError(() => {
      const metadata = new RequestLogMetadata({ requestId: request.metadata.requestId });
      const details = { elapsedTime: reply.elapsedTime, statusCode: reply.statusCode };

      if (debug) {
        logger.debug(`${RESPONSE_LOG_PREFIX} onSend`, {
          metadata: metadata,
          details: { ...details, body: safeSanitize(payload, reply.getHeaders()) },
        });
      } else {
        logger.info(`${RESPONSE_LOG_PREFIX} onSend`, { metadata: metadata, details: details });
      }
    });

    // ⚠️ [IMPORTANT]: must return payload or response breaks
    return payload;
  });
};

export default fp(requestLoggerPlugin, {
  name: pluginName,
  dependencies: ['apikit-request-metadata'],
});

function safeSanitize(input: unknown, headers?: Record<string, unknown>) {
  const contentType = String(headers?.[HttpHeaders.contentType] ?? '').toLowerCase();
  if (contentType.includes('multipart/form-data')) {
    return '[Multipart]';
  }
  return sanitizeBody(input);
}

function sanitizeBody(input: unknown, seen = new WeakSet(), depth = 0): unknown {
  // 1. Handle null/undefined
  if (!isDefinedAndNotNull(input)) {
    return '[Not provided]';
  }

  // 2. Strings → attempt JSON parse
  if (typeof input === 'string') {
    try {
      return JSON.parse(input);
    } catch {
      return input; // plain string
    }
  }

  // 3. Primitives
  if (typeof input === 'number' || typeof input === 'boolean') return input;
  if (typeof input === 'bigint') return input.toString();
  if (typeof input === 'symbol') return input.toString();
  if (typeof input === 'function') return `[Function: ${input.name || 'anonymous'}]`;

  // 4. Buffers / Streams
  if (Buffer.isBuffer(input)) return '[Buffer]';
  if (input instanceof Readable) return '[Stream]';

  // 5. File-like objects
  if (typeof input === 'object' && input && 'file' in input && 'filename' in input) {
    return '[File]';
  }

  // 6. Objects / Arrays (shallow recursion with cycle protection)
  if (typeof input === 'object') {
    if (seen.has(input)) return '[Circular]';
    seen.add(input);

    if (Array.isArray(input)) {
      return input.map((v) => sanitizeBody(v, seen, depth + 1));
    }

    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      result[k] = sanitizeBody(v, seen, depth + 1);
    }
    return result;
  }

  // 7. Fallback
  return String(input);
}
