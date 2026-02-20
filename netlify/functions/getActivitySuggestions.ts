import type { Handler } from '@netlify/functions';

const CURATED: Record<string, string[]> = {
  tokyo: ['Tsukiji Outer Market sushi breakfast', 'teamLab Borderless digital art', 'Sumo morning practice viewing', 'Golden Gai izakaya crawl', 'Senso-ji Temple at sunrise', 'Shibuya Sky observation deck at sunset', 'Ramen tasting tour in Shinjuku', 'Harajuku street fashion exploration', 'Traditional tea ceremony', 'Akihabara anime and retro arcades'],
  kyoto: ['Fushimi Inari thousand torii gates at dawn', 'Arashiyama bamboo grove walk', 'Uji matcha tasting', 'Kimono rental in Higashiyama', 'Nishiki Market food crawl', 'Sake brewery tour in Fushimi', 'Morning meditation at Nanzen-ji', 'Pottery workshop in Gojozaka'],
  paris: ['Louvre skip-the-line Denon wing', 'Eiffel Tower stairs climb at sunset', 'Cooking class: French macarons', 'Wine tasting in Le Marais', 'Montmartre walking tour', 'Seine night cruise', 'Covered passages of Galerie Vivienne', 'Versailles gardens by bike'],
  bali: ['Mount Batur sunrise trek', 'Tegallalang rice terrace swing', 'Balinese cooking class', 'Uluwatu Kecak fire dance', 'Nusa Penida snorkeling', 'Waterfall hopping tour', 'Sidemen valley off-path', 'Traditional flower bath spa'],
  rome: ['Colosseum underground tour', 'Trastevere food walk', 'Vatican early entry', 'Pasta-making class', 'Appian Way by bike', 'Trevi Fountain at dawn', 'Aperitivo at Piazza Navona', 'Day trip to Pompeii'],
  barcelona: ['Sagrada Familia interior', 'El Born tapas crawl', 'Park Güell mosaics', 'La Boqueria market', 'Flamenco show in Ciutat Vella', 'Paella cooking class', 'Gothic Quarter walking tour', 'Montserrat day trip'],
  london: ['Borough Market food walk', 'Tower of London Crown Jewels', 'Afternoon tea', 'Camden Market vintage', 'West End show', 'Shoreditch pub crawl', 'British Museum', 'South Bank walk'],
  iceland: ['Golden Circle tour', 'Blue Lagoon soak', 'Northern Lights chase', 'Glacier hike Sólheimajökull', 'Reynisfjara black sand beach', 'Silfra snorkel between tectonic plates', 'Jökulsárlón glacier lagoon', 'Whale watching Húsavík'],
  maldives: ['Manta ray snorkeling', 'Private sandbank dinner', 'Dolphin cruise', 'Bioluminescent night snorkel', 'Underwater restaurant', 'Island hopping local villages', 'Sunrise kayaking', 'Scuba at Banana Reef'],
  dubai: ['Burj Khalifa sunset', 'Old Dubai souk walk', 'Desert safari dune bashing', 'Dubai Mall aquarium', 'Luxury brunch', 'Hot air balloon at dawn', 'Al Fahidi historical district', 'Kite Beach water sports'],
  'new york': ['High Line walk', 'Central Park bike ride', 'Brooklyn Bridge + DUMBO pizza', 'Broadway show', 'Chinatown dumpling crawl', 'Top of the Rock sunset', 'Smorgasburg food market', 'Speakeasy in West Village'],
  singapore: ['Hawker center food tour', 'Gardens by the Bay light show', 'Marina Bay Sands sunset', 'Night Safari', 'Kampong Glam exploration', 'Cocktails at Atlas Bar', 'Little India walk', 'East Coast Park bike'],
  'cape town': ['Table Mountain hike', 'Boulders Beach penguins', 'Cape Point drive', 'Stellenbosch wine tasting', 'Bo-Kaap cooking class', 'Kirstenbosch sunset concert', 'Shark cage diving', 'Muizenberg surfing'],
  bangkok: ['Grand Palace', 'Yaowarat street food', 'Canal longtail boat', 'Chatuchak Market', 'Sky bar rooftop', 'Thai cooking class', 'Muay Thai ringside', 'Ayutthaya day trip'],
  morocco: ['Fez medina walk', 'Sahara camel trek', 'Hammam spa', 'Tagine cooking class', 'Chefchaouen blue city', 'Djemaa el-Fna night market', 'Atlas Mountains hike', 'Berber tea ceremony'],
  peru: ['Machu Picchu sunrise', 'Rainbow Mountain hike', 'Cusco street food', 'Sacred Valley tour', 'Lima ceviche tour', 'Lake Titicaca floating islands', 'Moray terraces', 'Pisco sour tasting in Barranco'],
  lisbon: ['Tram 28 through Alfama', 'Pastéis de Belém', 'LX Factory market', 'Miradouro sunset', 'Fado show', 'Sintra day trip', 'Cervejaria Ramiro seafood', 'Time Out Market'],
};

function findCurated(destination: string): string[] | null {
  const lower = destination.toLowerCase();
  for (const [key, acts] of Object.entries(CURATED)) {
    if (lower.includes(key) || key.includes(lower)) return acts;
  }
  return null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const { destination, duration, interests } = JSON.parse(event.body || '{}');
    if (!destination) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing destination' }) };
    }

    const curated = findCurated(destination);
    if (curated) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ activities: curated, source: 'curated' }),
      };
    }

    const pexelsKey = process.env.PEXELS_API_KEY;
    if (pexelsKey) {
      try {
        const query = `best things to do in ${destination} ${new Date().getFullYear()}`;
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10`, {
          headers: { Authorization: pexelsKey },
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const data = await res.json() as { photos?: { alt: string }[] };
          const activityHints = (data.photos || [])
            .map((p) => p.alt)
            .filter((alt) => alt && alt.length > 5);
          if (activityHints.length > 0) {
            return {
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify({
                activities: activityHints.slice(0, 10),
                source: 'pexels-hints',
              }),
            };
          }
        }
      } catch (e) {
        console.warn('[getActivitySuggestions] Pexels hint fetch failed:', e);
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ activities: [], source: 'none' }),
    };
  } catch (err) {
    console.error('[getActivitySuggestions] error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to fetch suggestions' }),
    };
  }
};
