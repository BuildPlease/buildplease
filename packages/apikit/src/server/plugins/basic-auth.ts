import crypto from 'node:crypto';

import basicAuth, { type FastifyBasicAuthOptions } from '@fastify/basic-auth';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import type { ServerPluginOptions } from '@/server';

const pluginName = 'apikit_@fastify/basic-auth';

const basicAuthPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const config = options.apikitController.basicAuth;

  if (!config.enabled) return;

  if (!config.username || !config.password) {
    throw new Error(`[${pluginName}] username and password are required when basic auth is enabled.`);
  }

  const validate: FastifyBasicAuthOptions['validate'] = async (
    inputUsername,
    inputPassword,
    _request,
    reply,
  ) => {
    let ok = true;

    ok = secureCompare(inputUsername, config.username!) && ok;
    ok = secureCompare(inputPassword, config.password!) && ok;

    if (!ok) {
      reply.code(401).header('WWW-Authenticate', `Basic realm="${config.realm}"`).send('Unauthorized');
      throw new Error('Access denied');
    }
  };

  await fastify.register(basicAuth, {
    ...config.options,
    authenticate: config.authenticate,
    validate: validate,
  });
};

function secureCompare(a: string | Buffer, b: string | Buffer): boolean {
  const bufferA = Buffer.isBuffer(a) ? a : Buffer.from(a, 'utf-8');
  const bufferB = Buffer.isBuffer(b) ? b : Buffer.from(b, 'utf-8');

  if (bufferA.length !== bufferB.length) {
    crypto.timingSafeEqual(bufferA, bufferA);
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

export default fp(basicAuthPlugin, {
  name: pluginName,
});
