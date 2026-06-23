import type { FastifyPluginAsync } from 'fastify';
import fastifyIp from 'fastify-ip';
import fp from 'fastify-plugin';

const pluginName = 'apikit-ip';

const ipPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyIp, {
    strict: false,
    isAWS: false,
  });
};

export default fp(ipPlugin, {
  name: pluginName,
});
