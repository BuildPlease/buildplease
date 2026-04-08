import fastifyCookie from '@fastify/cookie';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const cookiePlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyCookie, {
    hook: 'onRequest',
    parseOptions: {},
  });
};

export default fp(cookiePlugin, {
  name: 'apikit_@fastify/cookie',
});
