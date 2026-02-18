# ExplorePlan Server

Production-ready Fastify backend for the ExplorePlan AI travel itinerary app. Uses OpenAI Structured Outputs to guarantee valid itinerary JSON.

## Prerequisites

- Node.js 20+
- An OpenAI API key with access to `gpt-4o-mini` (or your chosen model)

## Environment Variables

Create a `.env` file in this directory:

```env
OPENAI_API_KEY=sk-your-key-here

# Optional overrides (defaults shown)
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT_MS=30000
OPENAI_STORE=false
PORT=8787
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
RATE_LIMIT_MAX=60
RATE_LIMIT_WINDOW=1 minute
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Yes | — | Your OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Model supporting structured outputs |
| `OPENAI_TIMEOUT_MS` | No | `30000` | Request timeout in ms |
| `OPENAI_STORE` | No | `false` | Whether OpenAI stores responses |
| `PORT` | No | `8787` | Server port |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed origin (dev only) |
| `LOG_LEVEL` | No | `info` | Pino log level |
| `RATE_LIMIT_MAX` | No | `60` | Max requests per time window per IP |
| `RATE_LIMIT_WINDOW` | No | `1 minute` | Rate limit time window |

## Local Development

### 1. Install and start the server

```bash
cd server
npm install
npm run dev
```

The server starts on `http://localhost:8787` with hot-reload via tsx.

### 2. Start the frontend (separate terminal)

```bash
# From project root
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://localhost:8787` automatically.

### 3. Test with curl

```bash
curl -X POST http://localhost:8787/api/generate-itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "tripInputs": {
      "destination": "Tokyo",
      "tripLength": 3,
      "budget": "moderate",
      "pace": "balanced",
      "interests": ["food", "temples", "shopping"],
      "accommodation": "hotel"
    }
  }'
```

### 4. Health check

```bash
curl http://localhost:8787/health
```

## Production (Docker)

Build and run the single container that serves both frontend and API:

```bash
# From project root
docker build -t exploreplan .
docker run -p 8787:8787 -e OPENAI_API_KEY=sk-your-key -e NODE_ENV=production exploreplan
```

Then visit `http://localhost:8787` — the frontend is served at `/` and the API at `/api/*`.

## Deploying to Render / Fly / Railway

1. Set the Docker build context to the repo root.
2. Set environment variables:
   - `OPENAI_API_KEY` (required)
   - `NODE_ENV=production`
   - `PORT` (use the platform's default if needed)
3. Expose the port matching `PORT`.

## Data & Privacy Notes

- `OPENAI_STORE` defaults to `false`. When false, OpenAI does not retain your API inputs/outputs for training.
- OpenAI may still retain data briefly for abuse monitoring per their data usage policy. Do not promise zero retention to end users.
- The server redacts email addresses, phone numbers, and long digit sequences from logs.
- Raw user input is never logged — only destination, trip length, pace, and request ID.

## Architecture

```
server/
├── src/
│   ├── index.ts              # Fastify app entry point
│   ├── config.ts             # Environment variable loader
│   ├── types.ts              # TypeScript interfaces
│   ├── validators.ts         # Zod schemas for validation
│   ├── errors.ts             # Typed error classes
│   ├── redact.ts             # PII redaction for logs
│   ├── prompt.ts             # System + user prompt builder
│   ├── routes/
│   │   └── generate-itinerary.ts  # POST /api/generate-itinerary
│   └── services/
│       ├── openai.ts         # OpenAI client + structured output call
│       └── itinerary.ts      # Normalize inputs, ensure map queries
├── package.json
├── tsconfig.json
└── README.md
```
