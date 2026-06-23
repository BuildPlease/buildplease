import crypto from 'node:crypto';

import basicAuth, { type FastifyBasicAuthOptions } from '@fastify/basic-auth';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import type { ServerPluginOptions } from '@/server';

const pluginName = 'apikit-basic-auth';
const LOG_PREFIX = '[ApiKit:BasicAuth]';

const basicAuthPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const config = options.apikitController.basicAuth;

  if (!config.enabled) return;

  const username = config.username;
  const password = config.password;

  if (!username || !password) {
    throw new Error(`${LOG_PREFIX} username and password are required when basic auth is enabled.`);
  }

  await fastify.register(basicAuth, {
    validate: makeValidate(username, password),
    authenticate: config.authenticate,
    proxyMode: config.proxyMode,
    header: config.header,
    strictCredentials: config.strictCredentials,
  });
};

export default fp(basicAuthPlugin, {
  name: pluginName,
});

// MARK: - Private

function makeValidate(username: string, password: string): FastifyBasicAuthOptions['validate'] {
  return async (inputUsername, inputPassword) => {
    validateCredentials({
      inputUsername: inputUsername,
      inputPassword: inputPassword,
      expectedUsername: username,
      expectedPassword: password,
    });
  };
}

function validateCredentials(input: {
  inputUsername: string | Buffer;
  inputPassword: string | Buffer;
  expectedUsername: string;
  expectedPassword: string;
}): void {
  const usernameMatches = secureCompare(input.inputUsername, input.expectedUsername);
  const passwordMatches = secureCompare(input.inputPassword, input.expectedPassword);

  if (!usernameMatches || !passwordMatches) throw new Error('Access denied');
}

function secureCompare(a: string | Buffer, b: string | Buffer): boolean {
  const bufferA = Buffer.isBuffer(a) ? a : Buffer.from(a, 'utf-8');
  const bufferB = Buffer.isBuffer(b) ? b : Buffer.from(b, 'utf-8');

  if (bufferA.length !== bufferB.length) {
    crypto.timingSafeEqual(bufferA, bufferA);
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}
