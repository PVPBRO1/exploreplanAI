import type { FastifyPluginAsync } from 'fastify';
import { ZodGenerateRequest } from '../validators.js';
import { ValidationError } from '../errors.js';
import { toErrorResponse } from '../errors.js';
import { normalizeTripInputs, ensureMapQueries, finalValidateItinerary, gatherSearchData } from '../services/itinerary.js';
import { generateItinerary } from '../services/openai.js';
import { safeLogInputs } from '../redact.js';
import type { Verification } from '../types.js';

export const generateItineraryRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/generate-itinerary', async (request, reply) => {
    const requestId = request.id;
    const start = Date.now();

    try {
      const parseResult = ZodGenerateRequest.safeParse(request.body);

      if (!parseResult.success) {
        const messages = parseResult.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ');
        throw new ValidationError(messages);
      }

      const { tripInputs: rawInputs } = parseResult.data;

      const pace = rawInputs.pace;
      if (pace === '') {
        throw new ValidationError('pace is required and must be one of: relaxed, balanced, packed');
      }

      const normalized = normalizeTripInputs({
        ...rawInputs,
        pace,
      });

      request.log.info({
        requestId,
        inputs: safeLogInputs(normalized),
        msg: 'generating itinerary',
      });

      const searchBundle = await gatherSearchData(normalized, String(requestId));

      let verification: Verification | undefined;
      if (searchBundle.verification) {
        verification = searchBundle.verification;
        request.log.info({
          requestId,
          verification: {
            status: verification.status,
            attempted: verification.providersAttempted,
            succeeded: verification.providersSucceeded,
            counts: verification.counts,
          },
          msg: 'scraperclaw search complete',
        });
      }

      let itinerary = await generateItinerary(normalized, searchBundle);

      itinerary = ensureMapQueries(itinerary, normalized.destination);
      itinerary = finalValidateItinerary(itinerary, normalized.tripLength);

      const elapsed = Date.now() - start;
      request.log.info({
        requestId,
        daysGenerated: itinerary.days.length,
        elapsedMs: elapsed,
        msg: 'itinerary generated',
      });

      return reply.send({ itinerary, verification });
    } catch (err) {
      const elapsed = Date.now() - start;
      request.log.error({
        requestId,
        elapsedMs: elapsed,
        err,
        msg: 'itinerary generation failed',
      });

      const { statusCode, body } = toErrorResponse(requestId, err);
      return reply.status(statusCode).send(body);
    }
  });
};
