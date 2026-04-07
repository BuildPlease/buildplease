import fastifyIp from 'fastify-ip';
import fp from 'fastify-plugin';

import type { FastifyPluginAsync } from 'fastify';

const ipPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyIp, {
    strict: false,
    isAWS: false,
  });
};

export default fp(ipPlugin, {
  name: 'apikit_fastify-ip',
});
