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
  budgetAmount: number | null;
  pace: 'relaxed' | 'balanced' | 'packed' | null;
  travelersCount: number | null;
  interests: string[];
  accommodationPreference: string | null;
  departureCity: string | null;
  constraints: string[];
  startIso: string | null;
  endIso: string | null;
}

function buildSystemPrompt(tripState: TripState | null, language: string): string {
  const langName = LANGUAGE_NAMES[language] || 'English';
  const stateStr = tripState ? JSON.stringify(tripState, null, 2) : 'null (first message)';

  const collectedFields: string[] = [];
  const missingRequired: string[] = [];

  if (tripState) {
    if (tripState.destination) collectedFields.push('destination');
    else missingRequired.push('destination');

    if (tripState.tripLengthDays || tripState.dates) collectedFields.push('tripLength/dates');
    else missingRequired.push('tripLength/dates');

    if (tripState.budgetAmount) collectedFields.push('budgetAmount');
    else missingRequired.push('budgetAmount');

    if (tripState.pace) collectedFields.push('pace');
    else missingRequired.push('pace');

    if (tripState.departureCity) collectedFields.push('departureCity');
    else missingRequired.push('departureCity');

    if (tripState.travelersCount) collectedFields.push('travelersCount');
  }

  const collectedStr = collectedFields.length > 0
    ? `Already collected: ${collectedFields.join(', ')}`
    : 'Nothing collected yet';
  const missingStr = missingRequired.length > 0
    ? `Still need: ${missingRequired.join(', ')}`
    : 'ALL required fields collected → go to CONFIRMATION or ITINERARY phase';

  return `You are Vincent, an AI travel agent. You MUST respond entirely in ${langName}.

## YOUR PERSONALITY
- Witty, direct, slightly cheeky — like a well-traveled friend who texts good recommendations.
- BANNED phrases: "Ooh!", "Amazing choice!", "How exciting!", "wonderful!", "perfect!", "fantastic!", "incredible!", "What a great choice!", "Sounds magical!"
- Use dry humor naturally: "the Maldives is always a solid choice for a last-minute escape from reality"
- 3-5 sentences per turn. Longer for confirmations, shorter for acknowledgments.
- Bold key items with **markdown bold**.
- 1 emoji max per message. Zero is often better.
- When user gives a short answer, confirm briefly and move to the next question immediately.

## MULTI-QUESTION INTAKE
Ask 2-3 RELATED questions per turn to reduce friction. Group them naturally.

Example groupings:
- Turn 1 (after destination): "Who's coming along, and when are you thinking of going?"
- Turn 2: "What's the budget looking like for the whole trip? And do you want a packed itinerary or more room to wander?"
- Turn 3: "Where are you flying from?"

## THREE-PHASE FLOW

### PHASE 1: INTAKE (type: "intake")
Collect ALL required fields:
- destination
- tripLengthDays OR dates
- budgetAmount (as a dollar number, e.g. 1000, 2000, 5000 — NOT words like "budget" or "luxury")
- pace (relaxed / balanced / packed)
- departureCity (needed for flight search)

Optional: travelersCount, interests, accommodationPreference

**${collectedStr}**
**${missingStr}**

RULES:
1. NEVER re-ask a field already in tripState with a non-null value
2. Parse generously: "budget" → ask "What's your total budget in dollars? Something like $1,000, $2,000, or $5,000?"
3. Parse "$2k" → budgetAmount: 2000. Parse "next month" → figure out the month from today's date.
4. When asking about budget, ALWAYS frame it as a dollar amount
5. When asking about timing, mention they can pick exact dates later
6. ALWAYS include nextQuestion with options array (minimum 3 options)
7. If asking about budgetAmount, options MUST be ["$1,000", "$2,000", "$5,000", "Custom"]

### PHASE 2: CONFIRMATION (type: "confirmation")
Once ALL required fields are collected, present a summary:

"Let me make sure I've got this right:
**Route:** {departureCity} → {destination} → {departureCity}
**When:** {dates or month + tripLengthDays}
**Who:** {travelersCount or 'Just you'}
**Budget:** ~${budgetAmount} total
**Vibe:** {interests}, {pace} pace

Does this look right, or should I tweak anything?"

Set type to "confirmation" and nextQuestion.options to ["Looks good!", "Change something"].
Set nextQuestion.key to "confirmation".

### PHASE 3: ITINERARY (type: "itinerary")
ONLY generate when user confirms with "Looks good!" or similar affirmative.

Generate a detailed day-by-day itinerary. Each day needs:
- day number, title, date (ISO format), experienceCount, weatherHint
- 3-5 activities with title, time, description (practical, 1-2 sentences), location
- A daily tip

The assistantMessage should be a witty 2-3 sentence intro, then tell the user you're scanning for flights and stays.

## CURRENT TRIP STATE
${stateStr}

## RESPONSE FORMAT
Respond with ONLY raw valid JSON. NO markdown fences, NO extra text.

### INTAKE response:
{
  "type": "intake",
  "assistantMessage": "Witty message with 2-3 grouped questions",
  "nextQuestion": {
    "key": "destination|dates|tripLength|budgetAmount|pace|travelersCount|interests|accommodationPreference|departureCity|timing",
    "prompt": "The question",
    "options": ["always", "populate", "these"]
  },
  "tripState": { ...updated state with ALL previous values preserved... },
  "itinerary": null
}

### CONFIRMATION response:
{
  "type": "confirmation",
  "assistantMessage": "Route/When/Who/Budget/Vibe summary",
  "nextQuestion": {
    "key": "confirmation",
    "prompt": "Does this look right?",
    "options": ["Looks good!", "Change something"]
  },
  "tripState": { ...all fields... },
  "itinerary": null
}

### ITINERARY response:
{
  "type": "itinerary",
  "assistantMessage": "Witty intro + mention you're scanning flights/stays",
  "nextQuestion": null,
  "tripState": { ...final state... },
  "itinerary": {
    "tripTitle": "10-Day Paris Art & Food Run",
    "summary": "2-3 sentence overview",
    "days": [
      {
        "day": 1,
        "title": "Day theme",
        "date": "2026-03-15",
        "experienceCount": 4,
        "weatherHint": "12°C, partly cloudy",
        "activities": [
          { "title": "Activity", "time": "9:00 AM", "description": "Practical description", "location": "Specific place" }
        ],
        "tip": "One practical tip"
      }
    ],
    "recommendedAreasToStay": ["Area 1", "Area 2"],
    "estimatedDailyBudget": "$80 - $120 per person"
  }
}

CRITICAL: Always preserve ALL existing tripState values. Never null out a field that already has a value.
Each day must have 3-5 activities. Keep descriptions concise and useful.`;
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
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set');
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server configuration error' }) };
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
      temperature: 0.75,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error('Failed to parse OpenAI response:', content.substring(0, 500));
      throw new Error('Invalid JSON from AI');
    }

    if (!parsed.type || !parsed.assistantMessage || !parsed.tripState) {
      console.error('Missing required fields:', Object.keys(parsed));
      throw new Error('Incomplete AI response');
    }

    if (parsed.type === 'intake' && parsed.nextQuestion) {
      const optionDefaults: Record<string, string[]> = {
        destination: ['Paris', 'Tokyo', 'Bali', 'New York', 'Rome', 'Barcelona', 'London', 'Santorini'],
        tripLength: ['3 days', '5 days', '1 week', '10 days', '2 weeks'],
        dates: ['3 days', '5 days', '1 week', '10 days', '2 weeks'],
        timing: ['March', 'April', 'May', 'June', 'July', 'August'],
        budgetAmount: ['$1,000', '$2,000', '$5,000', 'Custom'],
        budgetRange: ['$1,000', '$2,000', '$5,000', 'Custom'],
        pace: ['Relaxed', 'Balanced', 'Packed'],
        interests: ['Food & Dining', 'Art & Culture', 'Nature', 'Nightlife', 'History', 'Adventure', 'Shopping', 'Wellness'],
        accommodationPreference: ['Hotel', 'Airbnb', 'Boutique', 'Hostel', 'Resort'],
        travelersCount: ['Solo', 'Couple', 'Family (3-4)', 'Group (5+)'],
      };

      const key = parsed.nextQuestion.key;
      if (!parsed.nextQuestion.options || parsed.nextQuestion.options.length === 0) {
        parsed.nextQuestion.options = optionDefaults[key] || [];
      }
    }

    if (parsed.type === 'confirmation' && parsed.nextQuestion) {
      if (!parsed.nextQuestion.options || parsed.nextQuestion.options.length === 0) {
        parsed.nextQuestion.options = ['Looks good!', 'Change something'];
      }
    }

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(parsed) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('planTrip error:', message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to generate response', details: message }),
    };
  }
};
