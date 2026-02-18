import type { TripPlanInputs, PlannerField } from '../ai/types';

type ParseResult = {
  field: PlannerField;
  value: unknown;
} | null;

export function parseUserResponse(
  userText: string,
  currentInputs: TripPlanInputs
): ParseResult {
  const text = userText.toLowerCase().trim();

  if (!currentInputs.destination) {
    return null;
  }

  if (!currentInputs.dates && !currentInputs.tripLength) {
    const dayMatch = text.match(/(\d+)\s*(?:day|night)/);
    if (dayMatch) {
      return { field: 'tripLength', value: parseInt(dayMatch[1], 10) };
    }
    return { field: 'dates', value: userText.trim() };
  }

  if (!currentInputs.budget) {
    return { field: 'budget', value: userText.trim() };
  }

  if (!currentInputs.pace) {
    if (text.includes('relax')) return { field: 'pace', value: 'relaxed' };
    if (text.includes('pack') || text.includes('max')) return { field: 'pace', value: 'packed' };
    return { field: 'pace', value: 'balanced' };
  }

  if (currentInputs.interests.length === 0) {
    const interestMap: Record<string, string> = {
      food: 'food', dining: 'food', eat: 'food', restaurant: 'food', culinary: 'food',
      culture: 'culture', museum: 'culture', history: 'culture', historical: 'culture',
      nature: 'nature', hik: 'nature', park: 'nature', outdoor: 'nature', wildlife: 'nature',
      nightlife: 'nightlife', bar: 'nightlife', club: 'nightlife', party: 'nightlife',
      shop: 'shopping', market: 'shopping', mall: 'shopping',
      art: 'art', gallery: 'art',
      beach: 'beach', coast: 'beach', ocean: 'beach', swim: 'beach',
      wellness: 'wellness', spa: 'wellness', yoga: 'wellness', meditat: 'wellness',
      adventure: 'adventure', thrill: 'adventure', sport: 'adventure', surf: 'adventure',
      photo: 'photography', instagram: 'photography',
    };

    const found = new Set<string>();
    for (const [keyword, interest] of Object.entries(interestMap)) {
      if (text.includes(keyword)) found.add(interest);
    }

    if (found.size > 0) {
      return { field: 'interests', value: Array.from(found) };
    }
    return {
      field: 'interests',
      value: userText
        .split(/[,·•\n]+/)
        .map((s) => s.trim().replace(/^[^\w]+/, ''))
        .filter(Boolean),
    };
  }

  if (!currentInputs.accommodation) {
    if (text.includes('airbnb') || text.includes('rental')) return { field: 'accommodation', value: 'Airbnb' };
    if (text.includes('boutique')) return { field: 'accommodation', value: 'Boutique hotel' };
    if (text.includes('luxury') || text.includes('5 star') || text.includes('five star')) return { field: 'accommodation', value: 'Luxury hotel' };
    if (text.includes('budget') || text.includes('hostel') || text.includes('cheap')) return { field: 'accommodation', value: 'Budget' };
    return { field: 'accommodation', value: 'Hotel' };
  }

  if (currentInputs.travelers === undefined) {
    const numMatch = text.match(/(\d+)/);
    if (numMatch) {
      return { field: 'travelers', value: parseInt(numMatch[1], 10) };
    }
    if (text.includes('solo') || text.includes('just me') || text.includes('alone')) {
      return { field: 'travelers', value: 1 };
    }
    if (text.includes('couple') || text.includes('two') || text.includes('partner')) {
      return { field: 'travelers', value: 2 };
    }
    return { field: 'travelers', value: 2 };
  }

  return null;
}

export function extractDestinationFromMessage(text: string): string | null {
  const patterns = [
    /(?:trip|travel|go|visit|fly|vacation|holiday)\s+(?:to|in)\s+(.+?)(?:\.|,|!|\?|for|$)/i,
    /(?:plan|planning)\s+(?:a|my)?\s*(?:\d+-?day\s+)?(?:trip|travel|vacation)?\s*(?:to|in)\s+(.+?)(?:\.|,|!|\?|for|$)/i,
    /(?:i\s+want|i'd\s+like|i\s+wanna|thinking\s+(?:of|about))\s+(?:to\s+)?(?:go|visit|travel|fly)\s+(?:to|in)\s+(.+?)(?:\.|,|!|\?|for|$)/i,
    /(?:^|\s)(paris|tokyo|rome|bali|new\s+york|barcelona|sydney|london|berlin|amsterdam|prague|bangkok|dubai|singapore|seoul|istanbul|lisbon|vienna|budapest|morocco|iceland|greece|hawaii|cancun|mexico|canada|australia|japan|italy|france|spain|portugal|thailand|vietnam|india|peru|argentina|brazil|colombia|costa\s+rica|new\s+zealand)(?:\s|$|,|\.|!|\?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim().replace(/\s+/g, ' ');
    }
  }

  return null;
}
