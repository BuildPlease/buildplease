import fp from 'fastify-plugin';
import fastifyView from '@fastify/view';
import ejs from 'ejs';
import type { FastifyPluginAsync } from 'fastify';

const viewPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyView, {
    engine: {
      ejs: ejs,
    },
  });
};

export default fp(viewPlugin, {
  name: 'apikit-@fastify/view',
  dependencies: ['@fastify/view', 'ejs'],
});
