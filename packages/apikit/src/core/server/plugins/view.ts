import ejs from 'ejs';
import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import fastifyView from '@fastify/view';

const viewPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyView, {
    engine: {
      ejs: ejs,
    },
  });
};

export default fp(viewPlugin, {
  name: 'apikit-@fastify/view',
});
