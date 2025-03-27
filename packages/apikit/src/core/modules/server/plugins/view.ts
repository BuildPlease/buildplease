import fp from 'fastify-plugin';
import fastifyView from '@fastify/view';
import ejs from 'ejs';
import type { FastifyPluginAsync } from 'fastify';

const ejsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyView, {
    engine: {
      ejs: ejs,
    },
  });
};

export default fp(ejsPlugin, {
  name: 'apikit-ejs',
  dependencies: ['ejs'],
});
