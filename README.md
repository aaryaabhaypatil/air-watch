# air-watch

Real-time hyperlocal air quality, UV index and weather for Australian suburbs. Built with Next.js, Leaflet, and free open data APIs — no paid services, no API keys required to get started.

## What it does

Live AQI (Air Quality Index) markers for 35+ Australian monitoring stations
Colour-coded by severity — green to red to purple
Click any station for a detailed popup with PM2.5 readings and health advice
UV index + temperature, humidity and wind for your location
UV trend chart for the current day
Auto-refreshes every 10 minutes
Works offline with demo data if APIs are unavailable

## Getting started
1. Clone or download the project
If you have git:

    ```git clone <your-repo-url>```

    ```cd airwatch```

2. Install dependencies

    ```npm install```

3. Set up environment variables

    ```cp .env.local.example .env.local```

    Open .env.local — for basic usage you don't need to change anything. The app runs with 35 demo stations out of the box.
    Optional: To get live air quality data from real sensors, get a free OpenAQ API key:

    -  Go to explore.openaq.org/register
    - Sign up for free
    -  Go to your profile → API Keys → Generate key
    - Add it to .env.local:

    ```OPENAQ_API_KEY=your_key_here```

4. Run the development server

    ```npm run dev```
    Open http://localhost:3000 — you should see the map with station markers across Australia.

## How the data works

Air quality — fetched from OpenAQ, an open-source platform aggregating data from government monitoring stations worldwide. PM2.5 readings are converted to AQI using the EPA standard breakpoint formula. Data is cached for 10 minutes.

UV + weather — fetched from Open-Meteo, a free weather API with no rate limits or key required. Returns UV index, temperature, humidity and wind speed for any coordinates.

Without an OpenAQ key — the app uses 35 hardcoded real Australian monitoring stations with realistic demo values. The map, popups, UV data and all UI features work exactly the same.