import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import { config } from './config.js';
import { generateItineraryRoute } from './routes/generate-itinerary.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_VERSION = '1.0.0';

async function main() {
  const fastify = Fastify({
    logger: {
      level: config.logLevel,
      ...(config.isDev
        ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
        : {}),
    },
    requestIdHeader: 'x-request-id',
    genReqId: () => crypto.randomUUID(),
    bodyLimit: 65_536,
  });

  await fastify.register(fastifyHelmet, {
    contentSecurityPolicy: config.isProd
      ? undefined
      : false,
  });

  await fastify.register(fastifyCors, {
    origin: config.isDev ? config.corsOrigin : false,
    methods: ['GET', 'POST'],
  });

  await fastify.register(fastifyRateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
  });

  fastify.get('/health', async () => ({
    ok: true as const,
    version: PKG_VERSION,
    uptime: process.uptime(),
  }));

  await fastify.register(generateItineraryRoute);

  const publicDir = join(__dirname, '..', 'public');
  if (existsSync(publicDir)) {
    await fastify.register(fastifyStatic, {
      root: publicDir,
      prefix: '/',
      wildcard: false,
    });

    fastify.setNotFoundHandler((_request, reply) => {
      return reply.sendFile('index.html');
    });

    fastify.log.info({ publicDir }, 'serving static frontend');
  } else if (config.isProd) {
    fastify.log.warn('No public/ directory found — frontend will not be served');
  }

  const shutdown = async (signal: string) => {
    fastify.log.info({ signal }, 'shutting down');
    await fastify.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  await fastify.listen({ port: config.port, host: '0.0.0.0' });
  fastify.log.info(`ExplorePlan server listening on port ${config.port}`);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
