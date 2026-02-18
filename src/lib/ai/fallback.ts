import type { TripPlanInputs, Itinerary } from './types';

export function generateFallbackItinerary(inputs: TripPlanInputs): Itinerary {
  const days = inputs.tripLength || 3;
  const dest = inputs.destination || 'your destination';

  const dayPlans = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    morning:
      i === 0
        ? `Arrive in ${dest} and check into your ${inputs.accommodation || 'accommodation'}. Grab a local breakfast and orient yourself with the neighborhood.`
        : `Start your morning exploring a popular local attraction in ${dest}. Fuel up with a great local café.`,
    afternoon:
      inputs.interests.length > 0
        ? `Spend the afternoon enjoying ${inputs.interests[i % inputs.interests.length] || inputs.interests[0]} experiences the area is known for.`
        : `Explore the city center, visit notable landmarks, and grab lunch at a well-reviewed restaurant.`,
    evening:
      i === days - 1
        ? `Enjoy a farewell dinner at a top-rated restaurant. Reflect on an incredible trip!`
        : `Unwind with an evening stroll and dinner. Try the local cuisine for an authentic experience.`,
    optionalNotes:
      i === 0
        ? `Budget tip: consider a multi-day transit pass if available.`
        : undefined,
    mapQuery: `${dest} day ${i + 1} attractions`,
  }));

  return {
    tripTitle: `${days}-Day ${inputs.pace === 'packed' ? 'Action-Packed' : inputs.pace === 'relaxed' ? 'Relaxing' : 'Balanced'} Trip to ${dest}`,
    summary: `A curated ${days}-day ${inputs.pace || 'balanced'} itinerary for ${dest}${inputs.budget ? ` within a ${inputs.budget} budget` : ''}${inputs.travelers ? ` for ${inputs.travelers} traveler${inputs.travelers > 1 ? 's' : ''}` : ''}. ${inputs.interests.length > 0 ? `Focused on ${inputs.interests.join(', ')}.` : ''}`,
    days: dayPlans,
  };
}
