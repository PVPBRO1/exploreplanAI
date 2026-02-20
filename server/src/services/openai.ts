import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { config } from '../config.js';
import { ZodItinerary } from '../validators.js';
import { buildSystemPrompt, buildUserPrompt } from '../prompt.js';
import { OpenAIError, TimeoutError } from '../errors.js';
import type { NormalizedTripInputs, Itinerary, ScraperSearchBundle } from '../types.js';

let client: OpenAI | null = null;

export function createOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return client;
}

export async function generateItinerary(
  inputs: NormalizedTripInputs,
  searchBundle?: ScraperSearchBundle,
): Promise<Itinerary> {
  const openai = createOpenAIClient();

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(inputs, searchBundle);

  const result = await callWithRetry(openai, systemPrompt, userPrompt);
  return result;
}

async function callWithRetry(
  openai: OpenAI,
  systemPrompt: string,
  userPrompt: string,
): Promise<Itinerary> {
  const firstAttempt = await callStructuredOutput(openai, systemPrompt, userPrompt);

  if (firstAttempt.parsed) {
    return firstAttempt.parsed;
  }

  const repairPrompt = [
    'The previous output did not match the required schema. Fix it to match the schema exactly.',
    'Previous invalid output:',
    firstAttempt.raw ?? '(empty)',
  ].join('\n');

  const repairAttempt = await callStructuredOutput(openai, systemPrompt, repairPrompt);

  if (repairAttempt.parsed) {
    return repairAttempt.parsed;
  }

  throw new OpenAIError(
    'AI returned invalid output after retry. Please try again.',
  );
}

interface StructuredResult {
  parsed: Itinerary | null;
  raw: string | null;
}

async function callStructuredOutput(
  openai: OpenAI,
  systemPrompt: string,
  userPrompt: string,
): Promise<StructuredResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.openai.timeoutMs);

  try {
    const response = await openai.responses.parse({
      model: config.openai.model,
      input: [
        { role: 'developer', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      text: {
        format: zodTextFormat(ZodItinerary, 'itinerary'),
      },
      store: config.openai.store,
      temperature: 0.7,
    }, {
      signal: controller.signal,
    });

    const outputText = response.output_parsed;

    if (outputText) {
      const validated = ZodItinerary.safeParse(outputText);
      if (validated.success) {
        return { parsed: validated.data as Itinerary, raw: JSON.stringify(outputText) };
      }
    }

    const rawText = response.output_text;
    return { parsed: null, raw: rawText ?? null };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new TimeoutError();
    }

    if (err instanceof OpenAI.APIError) {
      throw new OpenAIError(
        `OpenAI API error: ${err.status} ${err.message}`,
        err,
      );
    }

    throw new OpenAIError(
      'Failed to communicate with AI service.',
      err,
    );
  } finally {
    clearTimeout(timeout);
  }
}
