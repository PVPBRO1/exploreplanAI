/**
 * ExplorePlan – AI Itinerary Server Stub
 *
 * This is a minimal Express server that proxies requests to OpenAI.
 * Deploy this separately (e.g., Vercel serverless, Railway, Render, etc.)
 * or run locally alongside the Vite dev server.
 *
 * SETUP:
 *   1. npm install express cors openai dotenv
 *   2. Create a .env file in the server/ directory:
 *        OPENAI_API_KEY=sk-your-key-here
 *        PORT=3001
 *   3. Run: npx tsx server/index.ts
 *
 * Then set VITE_AI_API_URL=http://localhost:3001/api/generate-itinerary
 * in your .env (root of the Vite project).
 */

import express from 'express';
import cors from 'cors';

// import OpenAI from 'openai';
// import dotenv from 'dotenv';
// dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ------------------------------------------------------------------
// POST /api/generate-itinerary
// Accepts: { tripInputs: TripPlanInputs }
// Returns: { itinerary: Itinerary }
// ------------------------------------------------------------------
app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const { tripInputs } = req.body;

    if (!tripInputs || !tripInputs.destination) {
      res.status(400).json({ error: 'Missing required field: destination' });
      return;
    }

    // ----------------------------------------------------------------
    // UNCOMMENT BELOW to use the real OpenAI API.
    // Make sure OPENAI_API_KEY is set in your server/.env file.
    // ----------------------------------------------------------------

    /*
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `You are an expert travel planner. Given the trip details below, generate a structured JSON itinerary.

    Return ONLY valid JSON with this exact shape:
    {
      "tripTitle": "string",
      "summary": "string (2-3 sentences)",
      "days": [
        {
          "day": number,
          "morning": "string (activity description)",
          "afternoon": "string (activity description)",
          "evening": "string (activity description)",
          "optionalNotes": "string or null",
          "mapQuery": "string (search query for Google Maps)"
        }
      ]
    }`;

    const userPrompt = `Plan a trip with these details:
    - Destination: ${tripInputs.destination}
    - Dates/Length: ${tripInputs.dates || `${tripInputs.tripLength} days`}
    - Budget: ${tripInputs.budget}
    - Travelers: ${tripInputs.travelers || 'not specified'}
    - Pace: ${tripInputs.pace || 'balanced'}
    - Interests: ${tripInputs.interests?.join(', ') || 'general sightseeing'}
    - Accommodation: ${tripInputs.accommodation || 'hotel'}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      res.status(500).json({ error: 'No response from OpenAI' });
      return;
    }

    const itinerary = JSON.parse(raw);
    res.json({ itinerary });
    */

    // ----------------------------------------------------------------
    // STUB: Return a mock itinerary for development without an API key.
    // Remove this block once you enable the OpenAI code above.
    // ----------------------------------------------------------------
    const days = tripInputs.tripLength || 3;
    const dest = tripInputs.destination;

    const itinerary = {
      tripTitle: `${days}-Day Trip to ${dest}`,
      summary: `A curated ${days}-day itinerary for ${dest}. Budget: ${tripInputs.budget}. Pace: ${tripInputs.pace || 'balanced'}. Interests: ${tripInputs.interests?.join(', ') || 'general'}.`,
      days: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        morning:
          i === 0
            ? `Arrive in ${dest}. Check into your ${tripInputs.accommodation || 'hotel'} and explore the neighborhood.`
            : `Morning exploration of ${dest}'s top attractions.`,
        afternoon: `Afternoon dedicated to ${tripInputs.interests?.[i % (tripInputs.interests.length || 1)] || 'sightseeing'} experiences.`,
        evening:
          i === days - 1
            ? `Farewell dinner at a top-rated local restaurant.`
            : `Evening stroll and dinner at a highly recommended spot.`,
        optionalNotes: i === 0 ? 'Tip: Consider getting a multi-day transit pass.' : null,
        mapQuery: `${dest} day ${i + 1} things to do`,
      })),
    };

    // Simulate slight delay like real API
    await new Promise((r) => setTimeout(r, 800));
    res.json({ itinerary });
  } catch (err) {
    console.error('Error generating itinerary:', err);
    res.status(500).json({ error: 'Failed to generate itinerary. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`ExplorePlan API server running on http://localhost:${PORT}`);
});
