import type { NormalizedTripInputs, ScraperSearchBundle } from './types.js';

export function buildSystemPrompt(): string {
  return `You are ExplorePlan, a world-class AI travel itinerary engine. You produce structured, day-by-day travel itineraries in JSON format.

RULES YOU MUST FOLLOW:

1. PACING & ACTIVITY CAPS
   - "relaxed": Max 2 activities per time slot (morning/afternoon/evening). Include optionalNotes with a swap alternative.
   - "balanced": Max 3 activities per time slot. One anchor activity plus lighter options.
   - "packed": Max 4 activities per time slot with tight routing notes. Keep descriptions readable.
   These caps are hard limits. Never exceed them.

2. GEOGRAPHIC CLUSTERING
   - Group activities by neighborhood or area to minimize transit time.
   - Never bounce across opposite sides of a city within the same half-day.

3. FOOD
   - Include at least one food suggestion per day (breakfast spot, lunch, dinner, or street food) unless the traveler's interests explicitly exclude food.
   - Match food suggestions to the budget level.

4. COSTS
   - Use qualitative cost labels: "free", "cheap", "moderate", or "splurge".
   - Do NOT fabricate exact prices or currency amounts.

5. HOURS & TIMING
   - Do NOT claim exact opening hours. Use phrases like "check hours before visiting" or "typically open mornings".
   - Never promise specific time slots unless the user provided them.

6. MAP QUERIES
   - For each day, provide a mapQuery as a full Google Maps search URL:
     https://www.google.com/maps/search/?api=1&query=<urlencoded string>
   - The query should combine 3–6 key places for that day, prefixed with the destination city/region.

7. DAY NUMBERING
   - Start at day 1. The number of days must exactly match the requested tripLength.

8. TONE
   - Concise but premium. No filler phrases like "Get ready for an amazing adventure!"
   - Write like a knowledgeable local friend, not a brochure.

9. STRUCTURE
   - tripTitle: Short, evocative title (e.g., "3 Days in Kyoto: Temples, Tea & Tradition")
   - summary: 2–3 sentences capturing the trip's essence and highlights.
   - Each day: morning, afternoon, evening descriptions. optionalNotes only when genuinely useful.

10. TRUTHFULNESS
   - NEVER fabricate hotel names, restaurant names, or specific prices.
   - NEVER invent booking URLs, availability claims, or airline routes.
   - Only recommend named places that are real, well-known establishments.
   - If you are uncertain whether a place exists, describe the type of place instead (e.g., "a local ramen shop near the station" rather than a made-up name).

11. REAL DATA INTEGRATION
   - When the user prompt includes a [SEARCH RESULTS] section with real stays or flights, incorporate those results into the response by name and note the data source.
   - Do NOT contradict or override real search results with invented alternatives.

12. ASSUMPTIONS
   - When you make an assumption (e.g., seasonal availability, flight existence), label it explicitly: "Note: assuming..."
   - Do not present assumptions as facts.

13. STAY RECOMMENDATIONS
   - Suggest 2–3 neighborhoods or areas to stay in.
   - For each area provide: a brief character description, one pro, one con, and what type of traveler it suits.
   - If real stay options are provided in [SEARCH RESULTS], present those instead, with source attribution.
   - Do NOT invent specific hotel or listing names when no real data is provided.

14. SWAP OPTIONS & WEATHER BACKUP
   - For each day, include a swap option in optionalNotes: "Swap: [alternative activity] if [condition]".
   - For outdoor-heavy days in destinations with unpredictable weather, add a brief indoor backup: "Rain plan: [indoor alternative]".`;
}

export function buildUserPrompt(
  inputs: NormalizedTripInputs,
  searchBundle?: ScraperSearchBundle,
): string {
  const lines = [
    `Plan a ${inputs.tripLength}-day trip to ${inputs.destination}.`,
    '',
    `Travelers: ${inputs.travelers}`,
    `Budget level: ${inputs.budget}`,
    `Pace: ${inputs.pace}`,
    `Interests: ${inputs.interests.join(', ')}`,
    `Accommodation: ${inputs.accommodation}`,
  ];

  if (inputs.dates) {
    lines.push(`Dates/timing: ${inputs.dates}`);
  }

  if (inputs.origin) {
    lines.push(`Flying from: ${inputs.origin}`);
  }

  if (inputs.currency) {
    lines.push(`Currency: ${inputs.currency}`);
  }

  if (searchBundle) {
    const section = formatSearchResultsSection(searchBundle);
    if (section) {
      lines.push('', section);
    }
  }

  return lines.join('\n');
}

function formatSearchResultsSection(bundle: ScraperSearchBundle): string | null {
  const parts: string[] = [];

  if (bundle.stays.length > 0) {
    parts.push('### Stays (from Airbnb + Priceline)');
    for (const stay of bundle.stays.slice(0, 12)) {
      const name = stay.title ?? stay.hotel_name ?? stay.name ?? 'Unnamed';
      const price = stay.price_per_night ?? stay.pricePerNight ?? '';
      const total = stay.total_price ?? stay.totalPrice ?? '';
      const rating = stay.rating ?? '';
      const source = stay.source ?? (stay.hotel_url ? 'Priceline' : 'Airbnb');
      const link = stay.link ?? stay.hotel_url ?? stay.bookingUrl ?? '';

      let line = `- "${name}"`;
      if (price) line += ` — $${price}/night`;
      if (total) line += ` ($${total} total)`;
      if (rating) line += ` — ${rating} stars`;
      line += ` — ${source}`;
      if (link) line += ` — ${link}`;
      parts.push(line);
    }
  }

  if (bundle.flights.length > 0) {
    parts.push('### Flights (from Skyscanner / Google Flights)');
    for (const f of bundle.flights.slice(0, 8)) {
      const airline = f.airline ?? 'Unknown';
      const dep = f.departure_time ?? '';
      const arr = f.arrival_time ?? '';
      const dur = f.duration ?? '';
      const stops = Number(f.stops ?? 0);
      const price = f.price_total ?? f.price_per_person ?? '';
      const link = f.booking_url ?? '';

      let line = `- ${airline}`;
      if (dep && arr) line += ` ${dep}→${arr}`;
      if (dur) line += ` (${dur})`;
      line += stops === 0 ? ' nonstop' : ` ${stops} stop${stops > 1 ? 's' : ''}`;
      if (price) line += ` — $${price}`;
      if (link) line += ` — ${link}`;
      parts.push(line);
    }
  }

  if (parts.length === 0) return null;

  return [
    '[SEARCH RESULTS]',
    'The following are REAL listings from live scraping. You MUST reference these by name and price.',
    'Do NOT invent alternative property names or prices. If a category has no results,',
    'say "Check [provider] for current availability" instead of fabricating options.',
    '',
    ...parts,
  ].join('\n');
}
