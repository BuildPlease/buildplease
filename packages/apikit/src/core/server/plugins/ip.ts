import fp from 'fastify-plugin';
import fastifyIp from 'fastify-ip';
import type { FastifyPluginAsync } from 'fastify';

import 'fastify-ip';

const ipPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyIp, {
    strict: false,
    isAWS: false,
  });
};

export default fp(ipPlugin, {
  name: 'apikit-fastify-ip',
  dependencies: ['fastify-ip'],
});
