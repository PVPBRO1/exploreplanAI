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
  origin: z.union([z.string(), z.array(z.string())]).optional(),
  currency: z.string().optional(),
});

export const ZodStayOption = z.object({
  name: z.string(),
  type: z.string(),
  area: z.string(),
  pricePerNight: z.number().optional(),
  currency: z.string().optional(),
  totalPrice: z.number().optional(),
  rating: z.number().optional(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  bookingUrl: z.string().optional(),
  source: z.string().optional(),
});

export const ZodFlightOption = z.object({
  airline: z.string(),
  route: z.string(),
  departure: z.string().optional(),
  arrival: z.string().optional(),
  duration: z.string().optional(),
  stops: z.number().int(),
  pricePerPerson: z.number().optional(),
  priceTotal: z.number().optional(),
  currency: z.string().optional(),
  bookingUrl: z.string().optional(),
  source: z.string().optional(),
});

export const ZodSearchMeta = z.object({
  searchedAt: z.string().optional(),
  staysSource: z.string().optional(),
  flightsSource: z.string().optional(),
  assumptions: z.array(z.string()).optional(),
  disclaimer: z.string().optional(),
});

export const ZodSearchBundle = z.object({
  stays: z.array(ZodStayOption).optional(),
  flights: z.array(ZodFlightOption).optional(),
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
  options: ZodSearchBundle.optional(),
  verification: ZodSearchMeta.optional(),
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
    origin: z.union([z.string(), z.array(z.string())]).optional(),
    currency: z.string().optional(),
  }),
});

export type ValidatedGenerateRequest = z.infer<typeof ZodGenerateRequest>;
