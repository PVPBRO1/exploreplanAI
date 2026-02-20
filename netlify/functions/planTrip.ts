import OpenAI from 'openai';
import {
  isLikelyItineraryPhase,
  gatherSearchBundle,
  formatSearchResultsForPrompt,
  type NetlifySearchBundle,
} from './lib/scraperclaw';

const CURATED_ACTIVITIES: Record<string, string[]> = {
  tokyo: ['Tsukiji Market sushi breakfast', 'teamLab Borderless', 'Sumo morning practice', 'Golden Gai izakaya crawl', 'Senso-ji at sunrise', 'Shibuya Sky sunset', 'Shinjuku ramen tour', 'Harajuku street fashion', 'Traditional tea ceremony', 'Akihabara retro arcades'],
  kyoto: ['Fushimi Inari at dawn', 'Arashiyama bamboo grove', 'Uji matcha tasting', 'Kimono in Higashiyama', 'Nishiki Market food crawl', 'Fushimi sake tour', 'Nanzen-ji meditation', 'Gojozaka pottery workshop'],
  paris: ['Louvre Denon wing', 'Eiffel stairs at sunset', 'Macaron cooking class', 'Le Marais wine tasting', 'Montmartre walking tour', 'Seine night cruise', 'Galerie Vivienne passages', 'Versailles by bike'],
  bali: ['Mount Batur sunrise', 'Tegallalang rice terrace', 'Balinese cooking class', 'Uluwatu Kecak dance', 'Nusa Penida snorkeling', 'Waterfall hopping', 'Sidemen valley', 'Flower bath spa'],
  rome: ['Colosseum underground', 'Trastevere food walk', 'Vatican early entry', 'Pasta-making class', 'Appian Way by bike', 'Trevi at dawn', 'Piazza Navona aperitivo', 'Pompeii day trip'],
  barcelona: ['Sagrada Familia', 'El Born tapas', 'Park Güell', 'La Boqueria', 'Flamenco show', 'Paella class', 'Gothic Quarter walk', 'Montserrat trip'],
  london: ['Borough Market', 'Tower of London', 'Afternoon tea', 'Camden Market', 'West End show', 'Shoreditch pubs', 'British Museum', 'South Bank walk'],
  iceland: ['Golden Circle', 'Blue Lagoon', 'Northern Lights', 'Glacier hike', 'Reynisfjara beach', 'Silfra snorkel', 'Jökulsárlón lagoon', 'Whale watching'],
  maldives: ['Manta snorkeling', 'Sandbank dinner', 'Dolphin cruise', 'Bioluminescent snorkel', 'Underwater restaurant', 'Island hopping', 'Sunrise kayaking', 'Banana Reef diving'],
  dubai: ['Burj Khalifa sunset', 'Old Dubai souks', 'Desert safari', 'Dubai Mall aquarium', 'Luxury brunch', 'Hot air balloon', 'Al Fahidi district', 'Kite Beach sports'],
  'new york': ['High Line walk', 'Central Park bike', 'Brooklyn Bridge pizza', 'Broadway show', 'Chinatown dumplings', 'Top of the Rock', 'Smorgasburg market', 'West Village speakeasy'],
  'cape town': ['Table Mountain', 'Boulders penguins', 'Cape Point drive', 'Stellenbosch wine', 'Bo-Kaap cooking', 'Kirstenbosch concert', 'Shark cage diving', 'Muizenberg surfing'],
  bangkok: ['Grand Palace', 'Yaowarat street food', 'Canal boat tour', 'Chatuchak Market', 'Sky bar rooftop', 'Thai cooking class', 'Muay Thai ringside', 'Ayutthaya day trip'],
  morocco: ['Fez medina', 'Sahara camel trek', 'Hammam spa', 'Tagine cooking', 'Chefchaouen blue city', 'Djemaa el-Fna', 'Atlas Mountains', 'Berber tea ceremony'],
  peru: ['Machu Picchu', 'Rainbow Mountain', 'Cusco street food', 'Sacred Valley', 'Lima ceviche', 'Titicaca islands', 'Moray terraces', 'Pisco sour tasting'],
  lisbon: ['Tram 28 Alfama', 'Pastéis de Belém', 'LX Factory', 'Miradouro sunset', 'Fado show', 'Sintra palaces', 'Cervejaria Ramiro', 'Time Out Market'],
  singapore: ['Hawker food tour', 'Gardens by the Bay', 'Marina Bay sunset', 'Night Safari', 'Kampong Glam', 'Atlas Bar cocktails', 'Little India walk', 'East Coast bike'],
};

function findCuratedActivities(destination: string): string[] | null {
  const lower = destination.toLowerCase();
  for (const [key, acts] of Object.entries(CURATED_ACTIVITIES)) {
    if (lower.includes(key) || key.includes(lower)) return acts;
  }
  return null;
}

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
    else missingRequired.push('travelersCount');
  }

  const collectedStr = collectedFields.length > 0
    ? `Already collected: ${collectedFields.join(', ')}`
    : 'Nothing collected yet';
  const missingStr = missingRequired.length > 0
    ? `Still need: ${missingRequired.join(', ')}`
    : 'ALL required fields collected → go to CONFIRMATION or ITINERARY phase';

  const todayDate = new Date().toISOString().slice(0, 10);
  const todayParts = todayDate.split('-');
  const todayReadable = new Date(Number(todayParts[0]), Number(todayParts[1]) - 1, Number(todayParts[2]))
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const minDateObj = new Date(Date.now() + 7 * 86_400_000);
  const minDate = minDateObj.toISOString().slice(0, 10);
  const minDateReadable = minDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return `You are Vincent, an AI travel agent. You MUST respond entirely in ${langName}.

## YOUR PERSONALITY
- Witty, direct, slightly cheeky — like a well-traveled friend who texts good recommendations.
- BANNED phrases: "Ooh!", "Amazing choice!", "How exciting!", "wonderful!", "perfect!", "fantastic!", "incredible!", "What a great choice!", "Sounds magical!", "I see we're keeping it mysterious"
- Use dry humor and destination-specific cultural references naturally.
- 3-5 sentences per turn. Longer for confirmations, shorter for acknowledgments.
- Use **markdown bold** liberally for destination names, dates, budget amounts, and key phrases. Makes scanning easier.
- 1 emoji max per message. Zero is often better.
- When listing options in your message (e.g. destination suggestions), use bullet points (•) NOT numbered lists (1. 2. 3.) and NOT hyphens (-). Example: "• Tokyo  • Kyoto  • Osaka"
- When user gives a short answer, acknowledge with a culturally specific comment (NOT generic praise) and move to the next question.

Examples of GOOD acknowledgments:
- Japan: "Expect karaoke, late-night ramen runs, and probably getting lost in Shinjuku station at least once."
- Paris: "Louvre, croissants, the Seine at dusk — you're going to have a hard time leaving."
- Iceland: "Landscapes that look like they're from another planet. Hope you like wind."
- Thailand: "Face-plant into a white sandy beach and forget that spreadsheets exist."

Examples of BAD acknowledgments:
- "Great choice!" / "Wonderful!" / "That sounds amazing!"
- "I see we're keeping it mysterious for now."
- "A balanced 10-day budget trip is a fine way to indulge."

## PROGRESSIVE DESTINATION NARROWING
When user doesn't have a specific city:
1. If they say "Surprise me" or give a vibe (Adventure, Beach, etc.), suggest 3-4 COUNTRIES with a one-line cultural hook each AND include a brief best-season note for each country. Example: "• **South Africa**: Safaris and dramatic coastlines — best May to September for dry-season wildlife." Save the vibe as an interest but do NOT set destination yet.
2. When they pick a country, suggest 2-4 CITIES within it. Mention what makes each city different.
3. Accept multi-city routes naturally: "Tokyo and Kyoto" → destination: "Tokyo & Kyoto, Japan"
4. NEVER set a vibe/mood/interest as the destination. Destination must be a real place.
5. After the user picks a destination, if they have NOT mentioned WHEN they want to travel, ask about their preferred travel month or season as the NEXT question. Frame it with seasonal context specific to the destination (e.g. "South Africa's dry season (May-Sep) is prime for safaris — when are you thinking?").

## TODAY'S DATE: ${todayReadable} (${todayDate})

## CRITICAL: TIMING vs DURATION
"In 3 months", "next May", "this summer" = WHEN they travel (timing/month). This answers WHEN, not HOW LONG.
"3 days", "1 week", "2 weeks" = HOW LONG the trip is (tripLengthDays). This answers DURATION.
These are SEPARATE fields. If the user says "in 3 months", that tells you the month but you MUST still ask how many days/weeks the trip should be. Do NOT confuse the two. Do NOT skip asking for duration just because you know when they want to go.

DATE COMPUTATION (MANDATORY):
- "next month" from ${todayReadable} = the month AFTER the current one. Compute the actual month name and year.
- "this summer" = June-August of the current or next year (whichever is in the future).
- "next spring" = March-May of the next occurrence.
- ALWAYS set tripState.dates to the COMPUTED date phrase (e.g. "March 2026"), NOT the raw user phrase ("next month").
- When generating the itinerary, use tripState.startIso and endIso if available; otherwise compute ISO dates from dates + tripLengthDays using today's date as reference.
- NEVER use placeholder dates. All dates in the itinerary must be realistic future dates computed from today (${todayDate}).

MINIMUM LEAD TIME (MANDATORY):
- The EARLIEST possible departure date is ${minDateReadable} (${minDate}) — at least 7 days from today.
- Trip dates MUST be ${minDate} or later. NEVER propose dates within the next 7 days.
- If the user has NOT specified WHEN they want to travel, you MUST ask before confirming. NEVER silently default to this week or next week.
- If the user says they want to leave "now" or "tomorrow" or "this weekend", gently steer them to at least a week out: "Even last-minute trips need a bit of runway — how about next week or later?"

## UNANSWERED QUESTIONS
If you asked a question (e.g. "Who's coming along?") and the user's response answers a DIFFERENT question instead (e.g. they give a date but ignore the travelers question), you MUST:
1. Acknowledge and record the answer they DID give
2. Naturally re-ask the unanswered question in the same turn
NEVER silently assume a default for a required field. If the user hasn't explicitly answered, keep asking.

## MULTI-QUESTION INTAKE
Ask 2-3 RELATED questions per turn. Group naturally based on what's missing.
Don't follow a rigid order — adapt to what the user gives you.

Example groupings:
- After destination: "Who's coming along, and when are you thinking of going?"
- After who + when: "How long are you going for? And what's the total budget?"
- After duration + budget: "Packed itinerary or room to wander? And where are you flying from?"
- departureCity: ask alongside pace or budget — do NOT delay until confirmation. If the user answers pace, ask departure city in the same turn or the next one.

## THREE-PHASE FLOW

### PHASE 1: INTAKE (type: "intake")
Required fields (you MUST collect ALL of these before moving to confirmation):
- destination (real city/country/route)
- tripLengthDays OR dates (HOW LONG — a number of days, NOT just a month or "in X months")
- budgetAmount (dollar number: 1000, 2000, 5000 — NOT words)
- pace (relaxed / balanced / packed)
- departureCity
- travelersCount (how many people — Solo=1, Couple=2, etc. NEVER assume "just you" without asking)

Optional: interests, accommodationPreference

**${collectedStr}**
**${missingStr}**

RULES:
1. NEVER re-ask a field already in tripState with a non-null value
2. Parse generously: "$2k" → 2000, "next month" → the actual month, "budget" → ask for dollar amount
3. When asking about budget, frame as dollar amount and avoid JSON-like bracket text in assistant prose. Offer options naturally: $1,000, $2,000, $5,000, or Custom.
4. When asking about timing, mention they can pick exact dates later
5. ALWAYS include nextQuestion with options array (minimum 3 options)
6. If user picks a country, set nextQuestion.key to "destination" with city options within that country
7. If ALL 6 required fields have real non-null values in tripState (destination, tripLengthDays/dates, budgetAmount, pace, departureCity, travelersCount), go straight to CONFIRMATION. NEVER move to confirmation if ANY required field is still null.

### PHASE 2: CONFIRMATION (type: "confirmation")
PREREQUISITE: EVERY required field must be non-null in tripState. Double-check before returning type="confirmation":
✓ destination is a real place (not null)
✓ tripLengthDays is a number OR dates has a range (not null)
✓ budgetAmount is a dollar number (not null)
✓ pace is relaxed/balanced/packed (not null)
✓ departureCity is set (not null)
✓ travelersCount is a number (not null)
If ANY of these is null, you MUST stay in INTAKE and ask for the missing ones.

Once ALL required fields are collected, present a summary naturally in your message — use **bold** markdown for field labels.  Write it as a conversational recap like this:

"Alright, here's the plan for your **{destination}** adventure:

• **Route:** {departureCity} ➡️ {destination} ➡️ {departureCity}
• **Dates:** {dates or timing + tripLengthDays days}
• **Duration:** {tripLengthDays} days
• **Travelers:** {travelersCount description}
• **Budget:** \${budgetAmount} per person (or total, depending on context)
• **Vibe:** {interests}, {pace} pace

Does this look like the dream trip, or should we tweak any of the details before I work my magic?"

Set type to "confirmation", nextQuestion.key to "confirmation", options to ["Looks good!", "Change dates", "Add activities"].

### PHASE 3: ITINERARY (type: "itinerary")
ONLY generate when user confirms with "Looks good!" or similar affirmative.

TRUTHFULNESS RULES (MANDATORY):
- NEVER invent hotel names, restaurant names, or specific prices.
- Use qualitative cost labels: "free", "budget", "moderate", "splurge".
- Do NOT claim specific opening hours. Say "check hours before visiting".
- If you recommend a specific named place, it must be a real, well-known establishment.
- Label assumptions: if you're unsure about seasonal availability, say so.
- Do NOT claim to scan airlines, read reviews, or search databases. Only describe what you actually do: build an itinerary from your knowledge.

ACTIVITY QUALITY RULES:
- Prioritize unique, memorable experiences over tourist-trap basics.
- Include at least 1 "hidden gem" or local favorite per day — something not in every guidebook.
- For food activities: name specific dishes or food streets, not just "lunch" or "dinner".
- For cultural activities: include interactive experiences (workshops, cooking classes, tastings) not just "visit museum X".
- Match activity intensity to the budget: $2000+ budgets get premium experiences, lower budgets get street food tours and free attractions.
- Each activity MUST have an "estimated_cost" field in the JSON: "free", "$10-20", "$30-50", "$50-100", or "$100+".
- Mix high-energy and chill activities in each day for a natural rhythm.

ACTIVITY CAPS BY PACE (hard limits — never exceed):
- relaxed: 2-3 activities per day maximum. Leave breathing room.
- balanced: 3-4 activities per day. One anchor per time slot.
- packed: 4-5 activities per day. Tight routing, minimal downtime.

STAY RECOMMENDATIONS:
- Suggest 2-3 neighborhoods/areas to stay in via recommendedAreasToStay.
- For each area: brief character description + one pro + one con in the summary or a daily tip.
- Do NOT name specific hotels unless they are iconic/well-known landmarks.

PER-DAY ENRICHMENT:
- Include a swap option in each day's tip: "Swap: [alternative activity] if [condition]"
- For outdoor-heavy days, add a weather backup: "Rain plan: [indoor alternative]"

Generate a detailed day-by-day itinerary. Each day needs:
- day number, title, date (ISO format), experienceCount, weatherHint
- Activities (respecting the pace caps above) with title, time, description (practical, 1-2 sentences), location
- A daily tip that includes a swap option and weather backup when relevant

The assistantMessage should be a witty 2-3 sentence intro + "I'm putting together your flight and stay options now — give me a sec."

## CURRENT TRIP STATE
${stateStr}

## RESPONSE FORMAT
Respond with ONLY raw valid JSON. NO markdown fences, NO extra text.

### INTAKE response:
{
  "type": "intake",
  "assistantMessage": "Witty message with cultural references and 2-3 grouped questions",
  "nextQuestion": {
    "key": "destination|dates|tripLength|budgetAmount|pace|travelersCount|interests|accommodationPreference|departureCity|timing",
    "prompt": "The question",
    "options": ["always", "populate", "at least 3"]
  },
  "tripState": { ...updated state with ALL previous values preserved... },
  "itinerary": null
}

### CONFIRMATION response:
{
  "type": "confirmation",
  "assistantMessage": "Route/When/Who/Budget/Vibe summary with arrow emojis, ending with offer to build itinerary",
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
  "assistantMessage": "Witty intro + mention scanning flights/stays",
  "nextQuestion": null,
  "tripState": { ...final state... },
  "itinerary": {
    "tripTitle": "2-Week Tokyo & Kyoto Friends Trip",
    "summary": "2-3 sentence overview with cultural hooks",
    "days": [
      {
        "day": 1,
        "title": "Day theme",
        "date": "2026-05-01",
        "experienceCount": 4,
        "weatherHint": "22°C, partly cloudy",
        "activities": [
          { "title": "Activity", "time": "9:00 AM", "description": "Practical, specific description", "location": "Specific place name", "estimated_cost": "$10-20" }
        ],
        "tip": "One practical local tip"
      }
    ],
    "recommendedAreasToStay": ["Area 1", "Area 2"],
    "estimatedDailyBudget": "$80 - $120 per person",
    "upgradeTips": [
      "Practical tip 1 to make this trip even better — specific, actionable, no fluff",
      "Practical tip 2 — e.g. side trip, upgrade option, flight routing advice",
      "Practical tip 3 — e.g. local insight, timing advice, budget optimization"
    ]
  }
}

UPGRADE TIPS RULES:
- Generate 2-3 specific, actionable tips to make this exact trip better
- Reference actual details from the trip (departure city, destination, duration, budget, travel party)
- Examples: side trip suggestions, flight routing advice, accommodation upgrades, timing/seasonal tips, budget hacks
- NO generic advice like "book early" or "pack light"
- Write in plain text — no emojis, no bullet asterisks

CRITICAL: Always preserve ALL existing tripState values. Never null out a field that already has a value.
Activity count per day must respect pace caps (relaxed: 2-3, balanced: 3-4, packed: 4-5). Keep descriptions concise and useful.`;
}

const OPTION_DEFAULTS: Record<string, string[]> = {
  destination: ['Paris', 'Tokyo', 'Bali', 'New York', 'Rome', 'Barcelona', 'London', 'Santorini'],
  tripLength: ['3 days', '5 days', '1 week', '10 days', '2 weeks'],
  dates: ['3 days', '5 days', '1 week', '10 days', '2 weeks'],
  timing: ['March', 'April', 'May', 'June', 'July', 'August'],
  budgetAmount: ['$1,000', '$2,000', '$5,000', 'Custom'],
  budgetRange: ['$1,000', '$2,000', '$5,000', 'Custom'],
  pace: ['Relaxed · room to breathe', 'Balanced · best of both', 'Packed · see it all'],
  interests: ['Food & Dining', 'Art & Culture', 'Nature', 'Nightlife', 'History', 'Adventure', 'Shopping', 'Wellness'],
  accommodationPreference: ['Hotel', 'Airbnb', 'Boutique', 'Hostel', 'Resort'],
  travelersCount: ['Solo', 'Couple', 'Family', 'Group of friends'],
  departureCity: ['New York (JFK)', 'Los Angeles (LAX)', 'Chicago (ORD)', 'San Francisco (SFO)', 'Custom'],
};

const REQUIRED_FIELD_LABELS: Record<string, string> = {
  destination: 'where you want to go',
  tripLength: 'how long the trip is',
  budgetAmount: 'your budget',
  pace: 'your preferred pace',
  departureCity: 'where you\'re flying from',
  travelersCount: 'who\'s coming along',
};

function getMissingRequiredFields(state: Record<string, unknown> | null): string[] {
  if (!state) return Object.keys(REQUIRED_FIELD_LABELS);
  const missing: string[] = [];
  if (!state.destination) missing.push('destination');
  if (!state.tripLengthDays && !state.dates) missing.push('tripLength');
  if (!state.budgetAmount) missing.push('budgetAmount');
  if (!state.pace) missing.push('pace');
  if (!state.departureCity) missing.push('departureCity');
  if (!state.travelersCount) missing.push('travelersCount');
  return missing;
}

function isTripDateTooSoon(state: Record<string, unknown> | null): boolean {
  if (!state) return false;
  const startIso = state.startIso as string | null;
  if (!startIso) return false;
  const minAllowed = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  return startIso < minAllowed;
}

function enforceRequiredFields(parsed: Record<string, unknown>): Record<string, unknown> {
  if (parsed.type !== 'confirmation' && parsed.type !== 'itinerary') return parsed;

  const tripState = parsed.tripState as Record<string, unknown> | null;
  const missing = getMissingRequiredFields(tripState);

  if (isTripDateTooSoon(tripState)) {
    console.warn('[planTrip] Trip date too soon, forcing back to intake for timing');
    if (tripState) {
      tripState.startIso = null;
      tripState.endIso = null;
      tripState.dates = null;
    }
    parsed.type = 'intake';
    parsed.assistantMessage =
      (parsed.assistantMessage as string) +
      `\n\nThose dates are a bit too close — you'd need at least a week to get things sorted. When are you thinking of going?`;
    parsed.nextQuestion = {
      key: 'timing',
      prompt: 'When do you want to travel?',
      options: OPTION_DEFAULTS['timing'] || [],
    };
    parsed.itinerary = null;
    return parsed;
  }

  if (missing.length === 0) return parsed;

  console.warn('[planTrip] LLM tried to advance to', parsed.type, 'with missing fields:', missing);

  const firstMissing = missing[0];
  const missingLabels = missing.map((k) => REQUIRED_FIELD_LABELS[k]).join(', ');

  parsed.type = 'intake';
  parsed.assistantMessage =
    (parsed.assistantMessage as string) +
    `\n\nBefore I lock this in, I still need to know: ${missingLabels}.`;
  parsed.nextQuestion = {
    key: firstMissing,
    prompt: `What about ${REQUIRED_FIELD_LABELS[firstMissing]}?`,
    options: OPTION_DEFAULTS[firstMissing] || [],
  };
  parsed.itinerary = null;

  return parsed;
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

  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set (checked OPENAI_API_KEY and OPEN_AI)');
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  try {
    const { messages = [], tripState = null, language = 'en' } = JSON.parse(event.body || '{}');
    const requestId = `nl-${Date.now()}`;

    // Deterministic pre-detection: if all fields collected and user confirmed, run scrapers
    const lastUserMsg = messages.length > 0 ? messages[messages.length - 1]?.content ?? '' : '';
    const likelyItinerary = isLikelyItineraryPhase(tripState, lastUserMsg);

    let searchBundle: NetlifySearchBundle | null = null;
    if (likelyItinerary) {
      try {
        searchBundle = await gatherSearchBundle(tripState, requestId);
        console.log(`[planTrip:${requestId}] scraper results: status=${searchBundle.verification.status}, stays=${searchBundle.stays.length}, flights=${searchBundle.flights.length}`);
      } catch (err) {
        console.warn(`[planTrip:${requestId}] scraper error (continuing without):`, err);
      }
    }

    const isSwapRequest = /^swap day \d+/i.test(lastUserMsg.trim());

    let systemPrompt = buildSystemPrompt(tripState, language);

    if (isSwapRequest) {
      systemPrompt += `\n\n## SWAP REQUEST DETECTED
The user wants to swap an activity in their existing itinerary. 
- Regenerate ONLY the affected day with the new activity replacing the one mentioned.
- Keep the same date, day number, and general structure.
- Return type "itinerary" with the FULL itinerary (all days), updating only the swapped day.
- In your assistantMessage, briefly confirm what was swapped with a witty comment.`;
    }

    if (searchBundle) {
      const section = formatSearchResultsForPrompt(searchBundle);
      if (section) {
        systemPrompt += '\n\n' + section;
      }
    }

    if (likelyItinerary && tripState?.destination) {
      const curatedList = findCuratedActivities(tripState.destination);
      if (curatedList && curatedList.length > 0) {
        systemPrompt += `\n\n## RECOMMENDED ACTIVITIES (from travel blogs and local guides)\nUse these as inspiration but adapt to the traveler's pace and budget:\n${curatedList.map((a) => `• ${a}`).join('\n')}`;
      }
    }

    const openaiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    let parsed;
    const MAX_ATTEMPTS = 2;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const completion = await openai.chat.completions.create({
        model,
        messages: openaiMessages,
        response_format: { type: 'json_object' },
        temperature: 0.75,
        max_tokens: 4096,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        if (attempt < MAX_ATTEMPTS) { console.warn(`[planTrip:${requestId}] Empty response, retrying...`); continue; }
        throw new Error('Empty response from OpenAI');
      }

      try {
        parsed = JSON.parse(content);
        break;
      } catch (parseErr) {
        console.error(`[planTrip:${requestId}] JSON parse failed (attempt ${attempt}). First 500 chars:`, content.substring(0, 500));
        if (attempt < MAX_ATTEMPTS) { console.warn(`[planTrip:${requestId}] Retrying...`); continue; }
        throw new Error('Invalid JSON from AI');
      }
    }

    if (!parsed.type || !parsed.assistantMessage || !parsed.tripState) {
      console.error('Missing required fields:', Object.keys(parsed));
      throw new Error('Incomplete AI response');
    }

    enforceRequiredFields(parsed);

    if (parsed.type === 'intake' && parsed.nextQuestion) {
      const key = parsed.nextQuestion.key;
      if (!parsed.nextQuestion.options || parsed.nextQuestion.options.length === 0) {
        parsed.nextQuestion.options = OPTION_DEFAULTS[key] || [];
      }
    }

    if (parsed.type === 'confirmation' && parsed.nextQuestion) {
      if (!parsed.nextQuestion.options || parsed.nextQuestion.options.length === 0) {
        parsed.nextQuestion.options = ['Looks good!', 'Change something'];
      }
    }

    if (parsed.type === 'itinerary' && searchBundle) {
      parsed.verification = searchBundle.verification;
      parsed.searchResults = {
        stays: searchBundle.stays,
        flights: searchBundle.flights,
      };
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
