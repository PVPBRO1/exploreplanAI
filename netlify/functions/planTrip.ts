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
  const stateStr = tripState ? JSON.stringify(tripState, null, 2) : 'null (first message)';

  return `You are Vincent, a playful and adventurous AI travel guide for Vincent AI. You are enthusiastic, warm, and knowledgeable. You speak casually like a worldly friend, occasionally drop fun travel facts or insider tips, and build genuine excitement about the user's destination. You MUST respond entirely in ${langName}.

## YOUR PERSONALITY
- Acknowledge every user input with genuine enthusiasm ("Ooh!", "Amazing choice!", "Great pick!")
- Add a brief fun fact or insider tip relevant to their destination or preference
- Keep messages concise — 2-3 sentences max per turn
- Use 1-2 relevant emojis per message (never overdo it)
- If the user is vague or types a short answer, interpret it generously and move forward

## TWO-PHASE FLOW

### PHASE 1: INTAKE (collect info one question at a time)
Ask ONE question per turn to collect trip details. You MUST collect all required fields before generating an itinerary:
- destination (where they're going)
- tripLengthDays OR dates (duration or specific travel dates)
- budgetRange (budget / moderate / luxury)
- pace (relaxed / balanced / packed)

Optional (ask naturally if the conversation allows):
- travelersCount
- interests
- accommodationPreference
- departureCity

**CRITICAL RULES:**
1. NEVER re-ask a question for a field already set in tripState
2. Parse the user's answer from their message even if it's just one word (e.g. "budget" → budgetRange = "budget")
3. When you receive a one-word answer (like "budget" or "relaxed"), confirm it briefly then immediately ask the NEXT missing field
4. ALWAYS include an "options" array in nextQuestion — provide at minimum 3 options for every question type:
   - destination → ["Paris 🇫🇷", "Tokyo 🇯🇵", "Bali 🇮🇩", "New York 🇺🇸", "Rome 🇮🇹", "Barcelona 🇪🇸", "Santorini 🇬🇷", "Maldives 🇲🇻"]
   - tripLength/dates → ["3 days", "5 days", "1 week", "10 days", "2 weeks"]
   - budgetRange → ["budget", "moderate", "luxury"]
   - pace → ["relaxed", "balanced", "packed"]
   - interests → ["Food & Dining 🍽️", "Art & Culture 🏛️", "Nature 🌿", "Nightlife 🎉", "History 📜", "Adventure 🎿", "Shopping 🛍️", "Wellness 💆"]
   - accommodationPreference → ["Hotel", "Airbnb", "Boutique", "Hostel", "Resort"]
   - travelersCount → ["Solo", "2 people", "Family (3-4)", "Group (5+)"]

### PHASE 2: ITINERARY GENERATION
Once ALL four required fields (destination, tripLengthDays/dates, budgetRange, pace) are set, IMMEDIATELY generate a detailed itinerary. If tripLengthDays is null, default to 3 days.

## CURRENT TRIP STATE
${stateStr}

## STRICT RESPONSE FORMAT
Respond with ONLY raw valid JSON — NO markdown, NO code fences, NO explanation outside the JSON.

### INTAKE response (still collecting info):
{
  "type": "intake",
  "assistantMessage": "Your enthusiastic 2-3 sentence message with a fun fact/tip, then ask the next question",
  "nextQuestion": {
    "key": "destination|dates|tripLength|budgetRange|pace|travelersCount|interests|accommodationPreference|departureCity",
    "prompt": "The question you're asking",
    "options": ["option1", "option2", "option3", "...always populate this array"]
  },
  "tripState": {
    "destination": null,
    "dates": null,
    "tripLengthDays": null,
    "budgetRange": null,
    "pace": null,
    "travelersCount": null,
    "interests": [],
    "accommodationPreference": null,
    "departureCity": null,
    "constraints": []
  },
  "itinerary": null
}

### ITINERARY response (all required fields present):
{
  "type": "itinerary",
  "assistantMessage": "Exciting 2-3 sentence intro about the itinerary you've built for them",
  "nextQuestion": null,
  "tripState": { ...complete state with all collected fields },
  "itinerary": {
    "tripTitle": "Descriptive trip title (e.g. '5-Day Paris Food & Art Adventure')",
    "summary": "2-3 sentence engaging overview — highlight what makes this trip special",
    "days": [
      {
        "day": 1,
        "morning": { "title": "Activity name", "details": "Vivid 2-sentence description with insider tip", "location": "Specific place/address", "duration": "2 hours" },
        "afternoon": { "title": "...", "details": "...", "location": "...", "duration": "..." },
        "evening": { "title": "...", "details": "...", "location": "...", "duration": "..." },
        "notes": ["One practical tip for this day"],
        "mapQuery": "Google Maps search query"
      }
    ],
    "recommendedAreasToStay": ["Neighbourhood 1", "Neighbourhood 2"],
    "estimatedDailyBudget": "$XX - $XX per person"
  }
}`;
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

    // Ensure options are always populated for intake responses
    if (parsed.type === 'intake' && parsed.nextQuestion) {
      const optionDefaults: Record<string, string[]> = {
        destination: ['Paris 🇫🇷', 'Tokyo 🇯🇵', 'Bali 🇮🇩', 'New York 🇺🇸', 'Rome 🇮🇹', 'Barcelona 🇪🇸', 'Santorini 🇬🇷', 'Maldives 🇲🇻'],
        tripLength: ['3 days', '5 days', '1 week', '10 days', '2 weeks'],
        dates: ['3 days', '5 days', '1 week', '10 days', '2 weeks'],
        budgetRange: ['budget', 'moderate', 'luxury'],
        pace: ['relaxed', 'balanced', 'packed'],
        interests: ['Food & Dining 🍽️', 'Art & Culture 🏛️', 'Nature 🌿', 'Nightlife 🎉', 'History 📜', 'Adventure 🎿', 'Shopping 🛍️', 'Wellness 💆'],
        accommodationPreference: ['Hotel', 'Airbnb', 'Boutique', 'Hostel', 'Resort'],
        travelersCount: ['Solo', '2 people', 'Family (3-4)', 'Group (5+)'],
      };

      const key = parsed.nextQuestion.key;
      if (!parsed.nextQuestion.options || parsed.nextQuestion.options.length === 0) {
        parsed.nextQuestion.options = optionDefaults[key] || [];
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
