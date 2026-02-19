export const HERO_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    alt: 'Paris, France',
  },
  {
    src: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
    alt: 'Himalayas, Nepal',
  },
  {
    src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80',
    alt: 'Yosemite National Park',
  },
  {
    src: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
    alt: 'Great Wall of China',
  },
] as const;

export const DESTINATIONS = [
  { name: 'Paris, France', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80' },
  { name: '4-Days in Rome', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80' },
  { name: "Foodie's Tokyo", image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80' },
  { name: 'Bali, Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80' },
  { name: 'New York City', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80' },
  { name: 'Barcelona, Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80' },
  { name: 'Sydney, Australia', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80' },
  { name: 'Santorini, Greece', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&q=80' },
] as const;

export const FEATURE_IMAGES = {
  fineDining: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  historical: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  markets: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
} as const;

export const CHAT_BG_IMAGE = '/hero-bg.jpg';

export const HERO_BG_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80';

export const QUICK_ACTIONS = [
  { id: 'new-trip', label: 'Create a new trip', icon: 'Compass', message: "I'd like to plan a new trip!" },
  { id: 'inspire', label: 'Inspire me where to go', icon: 'Sparkles', message: "Inspire me — where should I travel next?" },
  { id: 'road-trip', label: 'Plan a road trip', icon: 'Route', message: "Help me plan an epic road trip!" },
  { id: 'last-minute', label: 'Plan a last-minute escape', icon: 'Zap', message: "I need a last-minute getaway — what do you suggest?" },
  { id: 'quiz', label: 'Take a quiz', icon: 'HelpCircle', message: "Give me a quick travel quiz to figure out my ideal destination!" },
] as const;
