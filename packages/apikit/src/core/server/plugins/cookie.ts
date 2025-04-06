import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';
import type { FastifyPluginAsync } from 'fastify';

import '@fastify/cookie';

const cookiePlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyCookie, {
    hook: 'onRequest',
    parseOptions: {},
  });
};

export default fp(cookiePlugin, {
  name: 'apikit-@fastify/cookie',
  dependencies: ['@fastify/cookie'],
});
