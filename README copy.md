# AirWatch — Live Air Quality Map

Real-time hyperlocal air quality, UV index, and weather for Australian suburbs.

## Stack
- **Next.js 14** (App Router)
- **Mapbox GL JS** — map with custom AQI markers
- **OpenAQ API** — free, open air quality data (no key needed)
- **Open-Meteo API** — free UV + weather data (no key needed)
- **Recharts** — UV trend chart
- **Tailwind CSS**

## Setup

### 1. Get a free Mapbox token
Sign up at https://account.mapbox.com — the free tier is 50,000 map loads/month, plenty for a portfolio project.

### 2. Add your token
```bash
cp .env.local.example .env.local
# Edit .env.local and paste your Mapbox token
```

### 3. Install & run
```bash
npm install
npm run dev
```

Open http://localhost:3000

## How it works

**`/api/air-quality`** — Fetches Australian PM2.5 readings from OpenAQ v3, converts to AQI using the EPA breakpoint formula, returns station list. Cached for 10 minutes.

**`/api/uv`** — Fetches UV index, temperature, humidity, and wind from Open-Meteo for given coordinates. No API key needed.

**`Map.tsx`** — Renders custom circle markers sized and coloured by AQI. Click any marker for a popup with full detail.

**`SidePanel.tsx`** — Shows your local UV/weather data and the selected station detail with an AQI trend.

## Deploying to Vercel
```bash
npm i -g vercel
vercel
# Add NEXT_PUBLIC_MAPBOX_TOKEN in the Vercel dashboard under Environment Variables
```

## Phase 2 ideas (next steps)
- Supabase auth + personal AQI threshold alerts
- Web Push notifications via service workers
- Historical trend charts per station
- Pollen data layer (AirRater / Tomorrow.io)
- Add suburb-level granularity using BOM weather station grid
