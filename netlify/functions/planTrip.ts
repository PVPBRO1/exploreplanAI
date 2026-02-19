import OpenAI from 'openai';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', it: 'Italian', zh: 'Chinese',
  de: 'German', pt: 'Portuguese', ru: 'Russian', ar: 'Arabic', pl: 'Polish',
};

interface TripState {
  destination: string | null;
  dates: string | null;
  tripLengthDays: number | null;
  budgetRange: string | null;
  pace: 'relaxed' | 'balanced' | 'packed' | null;
  travelersCount: number | null;
  interests: string[];
  accommodationPreference: string | null;
  departureCity: string | null;
  constraints: string[];
}

function buildSystemPrompt(tripState: TripState | null, language: string): string {
  const langName = LANGUAGE_NAMES[language] || 'English';
  const stateStr = tripState ? JSON.stringify(tripState, null, 2) : 'No trip state yet — this is the first message.';

  return `You are ExplorePlan, a friendly, knowledgeable AI travel planning assistant. You MUST respond entirely in ${langName}.

You help users plan their perfect trip through a warm, conversational flow. You work in two phases:

## PHASE 1: INTAKE
Ask ONE question at a time to collect trip details. Be warm, enthusiastic, and helpful. Acknowledge what the user tells you before asking the next question.

Required fields (MUST collect all before generating itinerary):
- destination: Where they want to go
- tripLengthDays OR dates: Trip duration or specific dates
- budgetRange: Budget level (budget / moderate / luxury, or a dollar range)
- pace: relaxed / balanced / packed

Optional fields (ask naturally if the conversation allows):
- travelersCount: Number of travelers
- interests: What they enjoy (food, culture, nature, nightlife, etc.)
- accommodationPreference: hotel / airbnb / boutique / luxury / budget
- departureCity: Where they're traveling from

## PHASE 2: ITINERARY GENERATION
Once ALL four required fields are present in the trip state, generate a detailed day-by-day itinerary. If tripLengthDays is not set, default to 3 days.

## CURRENT TRIP STATE
${stateStr}

## RESPONSE FORMAT
You MUST respond with ONLY valid JSON (no markdown, no code fences, no extra text). Follow this exact schema:

For INTAKE responses (still collecting info):
{
  "type": "intake",
  "assistantMessage": "Your friendly message here",
  "nextQuestion": {
    "key": "destination|dates|tripLength|budgetRange|pace|travelersCount|interests|accommodationPreference|departureCity",
    "prompt": "The question text",
    "options": ["option1", "option2"]
  },
  "tripState": {
    "destination": "string or null",
    "dates": "string or null",
    "tripLengthDays": "number or null",
    "budgetRange": "string or null",
    "pace": "relaxed|balanced|packed or null",
    "travelersCount": "number or null",
    "interests": [],
    "accommodationPreference": "string or null",
    "departureCity": "string or null",
    "constraints": []
  },
  "itinerary": null
}

For ITINERARY responses (all required fields collected):
{
  "type": "itinerary",
  "assistantMessage": "Short friendly intro about the itinerary",
  "nextQuestion": null,
  "tripState": { ...final state with all collected fields },
  "itinerary": {
    "tripTitle": "Descriptive trip title",
    "summary": "2-3 sentence overview of the trip",
    "days": [
      {
        "day": 1,
        "morning": { "title": "Activity name", "details": "2-3 sentence description", "location": "Specific location/address", "duration": "e.g. 2 hours" },
        "afternoon": { "title": "...", "details": "...", "location": "...", "duration": "..." },
        "evening": { "title": "...", "details": "...", "location": "...", "duration": "..." },
        "notes": ["Practical tip or note for this day"],
        "mapQuery": "Google Maps search query for the key location"
      }
    ],
    "recommendedAreasToStay": ["Neighborhood 1", "Neighborhood 2"],
    "estimatedDailyBudget": "$XX - $XX per person"
  }
}

IMPORTANT RULES:
- Update tripState with EVERY piece of information the user provides in their messages
- When all four required fields (destination, tripLengthDays/dates, budgetRange, pace) are filled, generate the itinerary immediately
- Keep assistant messages concise, warm, and conversational
- Provide options arrays for questions where predefined choices make sense (budget, pace, accommodation)
- For interests, suggest several but let the user pick freely
- NEVER include markdown formatting or code fences — respond with raw JSON only`;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler = async (event: { httpMethod: string; body: string | null }) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set');
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Server configuration error: OPENAI_API_KEY not set' }),
    };
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  try {
    const { messages = [], tripState = null, language = 'en' } = JSON.parse(event.body || '{}');

    const systemPrompt = buildSystemPrompt(tripState, language);

    const openaiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model,
      messages: openaiMessages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error('Failed to parse OpenAI response as JSON:', content.substring(0, 500));
      throw new Error('Invalid JSON response from AI');
    }

    if (!parsed.type || !parsed.assistantMessage || !parsed.tripState) {
      console.error('Missing required fields in AI response:', Object.keys(parsed));
      throw new Error('Incomplete response from AI');
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(parsed),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('planTrip function error:', message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to generate response',
        details: message,
      }),
    };
  }
};
