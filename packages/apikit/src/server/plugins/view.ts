import fastifyView from '@fastify/view';
import ejs from 'ejs';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const viewPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyView, {
    engine: {
      ejs: ejs,
    },
  });
};

export default fp(viewPlugin, {
  name: 'apikit_@fastify/view',
});
