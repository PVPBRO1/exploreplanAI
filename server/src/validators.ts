import { z } from 'zod';

export const ZodTripPlanInputs = z.object({
  destination: z.string().min(1, 'destination is required'),
  dates: z.string().optional(),
  tripLength: z.number().int().min(1).max(30).optional(),
  budget: z.string().min(1, 'budget is required'),
  travelers: z.number().int().min(1).max(50).optional(),
  pace: z.enum(['relaxed', 'balanced', 'packed']),
  interests: z.array(z.string()).min(1, 'at least one interest is required'),
  accommodation: z.string().min(1, 'accommodation is required'),
});

export const ZodItineraryDay = z.object({
  day: z.number().int().min(1),
  morning: z.string(),
  afternoon: z.string(),
  evening: z.string(),
  optionalNotes: z.string().optional(),
  mapQuery: z.string().optional(),
});

export const ZodItinerary = z.object({
  tripTitle: z.string(),
  summary: z.string(),
  days: z.array(ZodItineraryDay).min(1),
});

export const ZodGenerateRequest = z.object({
  tripInputs: z.object({
    destination: z.string().min(1, 'destination is required'),
    dates: z.string().optional(),
    tripLength: z.number().int().min(1).max(30).optional(),
    budget: z.string().min(1, 'budget is required'),
    travelers: z.number().int().min(1).max(50).optional(),
    pace: z.enum(['relaxed', 'balanced', 'packed', '']),
    interests: z.array(z.string()),
    accommodation: z.string().min(1, 'accommodation is required'),
  }),
});

export type ValidatedGenerateRequest = z.infer<typeof ZodGenerateRequest>;
