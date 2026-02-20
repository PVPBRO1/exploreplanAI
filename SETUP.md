# Setup (clone on laptop / new machine)

1. **Clone and install**
   ```bash
   git clone <repo-url> && cd travel-help
   npm install
   ```
   Scraper code is in the repo (`netlify/functions/lib/scraperclaw.ts`, `scraperclaw-run.ts`, `server/src/services/scraperclaw.ts`). No extra install.

2. **Env / API key**
   - Copy `cp .env.example .env.local` (or copy the file).
   - Edit `.env.local` and set at least:
     - `OPENAI_API_KEY=` your OpenAI key
   - Optional: `PEXELS_API_KEY`, `VITE_MAPBOX_TOKEN`, `SCRAPERCLAW_URL` (defaults to `http://localhost:8000`).

3. **Run**
   - `npx netlify dev` (Vite + Netlify functions), or
   - `npm run dev` then run Netlify/dev server as needed.

GitHub cannot accept pushes that contain API keys; use `.env.local` only locally and keep it out of git.
