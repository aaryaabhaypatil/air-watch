import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.OPENAQ_API_KEY

  if (apiKey) {
    try {
      const res = await fetch(
        'https://api.openaq.org/v3/measurements?countries_id=14&parameters_id=2&limit=200&order_by=datetime&sort_order=desc',
        {
          headers: { 'X-API-Key': apiKey, 'Accept': 'application/json' },
          next: { revalidate: 600 },
        }
      )
      if (res.ok) {
        const data = await res.json()
        const seen = new Set<number>()
        const stations = []
        for (const m of data.results ?? []) {
          if (seen.has(m.locationsId)) continue
          seen.add(m.locationsId)
          const pm25 = m.value
          if (pm25 == null || pm25 < 0) continue
          stations.push({
            id: m.locationsId,
            name: m.locationName ?? `Station ${m.locationsId}`,
            lat: m.coordinates?.latitude,
            lng: m.coordinates?.longitude,
            pm25,
            aqi: pm25ToAqi(pm25),
            city: m.city ?? 'Australia',
            lastUpdated: m.date?.utc ?? null,
          })
        }
        const valid = stations.filter(s => s.lat && s.lng && s.aqi !== null)
        if (valid.length > 0) return NextResponse.json({ stations: valid, source: 'live' })
      }
    } catch (e) {
      console.error('OpenAQ error:', e)
    }
  }

  return NextResponse.json({ stations: FALLBACK_STATIONS, source: 'demo' })
}

function pm25ToAqi(pm25: number): number {
  const bp = [
    [0, 12, 0, 50], [12.1, 35.4, 51, 100], [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200], [150.5, 250.4, 201, 300], [250.5, 500.4, 301, 500],
  ]
  for (const [clo, chi, ilo, ihi] of bp) {
    if (pm25 >= clo && pm25 <= chi)
      return Math.round(((ihi - ilo) / (chi - clo)) * (pm25 - clo) + ilo)
  }
  return 0
}

const FALLBACK_STATIONS = [
  { id: 1,  name: 'Sydney CBD',       lat: -33.8688, lng: 151.2093, pm25: 8.2,  aqi: 34, city: 'Sydney',        lastUpdated: new Date().toISOString() },
  { id: 2,  name: 'Parramatta',       lat: -33.8150, lng: 151.0011, pm25: 12.1, aqi: 50, city: 'Sydney',        lastUpdated: new Date().toISOString() },
  { id: 3,  name: 'Liverpool',        lat: -33.9200, lng: 150.9240, pm25: 15.8, aqi: 59, city: 'Sydney',        lastUpdated: new Date().toISOString() },
  { id: 4,  name: 'Chullora',         lat: -33.8747, lng: 151.0614, pm25: 10.4, aqi: 44, city: 'Sydney',        lastUpdated: new Date().toISOString() },
  { id: 5,  name: 'Randwick',         lat: -33.9140, lng: 151.2400, pm25: 6.1,  aqi: 25, city: 'Sydney',        lastUpdated: new Date().toISOString() },
  { id: 6,  name: 'Rozelle',          lat: -33.8600, lng: 151.1731, pm25: 9.8,  aqi: 41, city: 'Sydney',        lastUpdated: new Date().toISOString() },
  { id: 7,  name: 'Prospect',         lat: -33.8072, lng: 150.9130, pm25: 13.2, aqi: 51, city: 'Sydney',        lastUpdated: new Date().toISOString() },
  { id: 8,  name: 'Campbelltown',     lat: -34.0667, lng: 150.8144, pm25: 11.0, aqi: 46, city: 'Sydney',        lastUpdated: new Date().toISOString() },
  { id: 9,  name: 'Bringelly',        lat: -33.9628, lng: 150.7244, pm25: 7.4,  aqi: 31, city: 'Sydney',        lastUpdated: new Date().toISOString() },
  { id: 10, name: 'Newcastle',        lat: -32.9267, lng: 151.7789, pm25: 9.1,  aqi: 38, city: 'Newcastle',     lastUpdated: new Date().toISOString() },
  { id: 11, name: 'Wollongong',       lat: -34.4278, lng: 150.8931, pm25: 7.8,  aqi: 32, city: 'Wollongong',   lastUpdated: new Date().toISOString() },
  { id: 12, name: 'Muswellbrook',     lat: -32.2653, lng: 150.8892, pm25: 22.4, aqi: 76, city: 'Hunter Valley', lastUpdated: new Date().toISOString() },
  { id: 13, name: 'Singleton',        lat: -32.5667, lng: 151.1667, pm25: 18.9, aqi: 65, city: 'Hunter Valley', lastUpdated: new Date().toISOString() },
  { id: 14, name: 'Melbourne CBD',    lat: -37.8136, lng: 144.9631, pm25: 6.8,  aqi: 28, city: 'Melbourne',     lastUpdated: new Date().toISOString() },
  { id: 15, name: 'Richmond VIC',     lat: -37.8182, lng: 145.0013, pm25: 9.3,  aqi: 39, city: 'Melbourne',     lastUpdated: new Date().toISOString() },
  { id: 16, name: 'Alphington',       lat: -37.7767, lng: 145.0289, pm25: 8.1,  aqi: 34, city: 'Melbourne',     lastUpdated: new Date().toISOString() },
  { id: 17, name: 'Dandenong',        lat: -37.9870, lng: 145.2150, pm25: 11.7, aqi: 49, city: 'Melbourne',     lastUpdated: new Date().toISOString() },
  { id: 18, name: 'Geelong',          lat: -38.1499, lng: 144.3617, pm25: 5.9,  aqi: 24, city: 'Geelong',       lastUpdated: new Date().toISOString() },
  { id: 19, name: 'Ballarat',         lat: -37.5622, lng: 143.8503, pm25: 7.2,  aqi: 30, city: 'Ballarat',      lastUpdated: new Date().toISOString() },
  { id: 20, name: 'Brisbane CBD',     lat: -27.4698, lng: 153.0251, pm25: 5.1,  aqi: 21, city: 'Brisbane',      lastUpdated: new Date().toISOString() },
  { id: 21, name: 'Rocklea',          lat: -27.5394, lng: 153.0147, pm25: 8.9,  aqi: 37, city: 'Brisbane',      lastUpdated: new Date().toISOString() },
  { id: 22, name: 'Woolloongabba',    lat: -27.4940, lng: 153.0348, pm25: 6.7,  aqi: 28, city: 'Brisbane',      lastUpdated: new Date().toISOString() },
  { id: 23, name: 'Ipswich',          lat: -27.6167, lng: 152.7667, pm25: 10.3, aqi: 43, city: 'Ipswich',       lastUpdated: new Date().toISOString() },
  { id: 24, name: 'Gold Coast',       lat: -28.0167, lng: 153.4000, pm25: 4.8,  aqi: 20, city: 'Gold Coast',    lastUpdated: new Date().toISOString() },
  { id: 25, name: 'Perth CBD',        lat: -31.9505, lng: 115.8605, pm25: 7.9,  aqi: 33, city: 'Perth',         lastUpdated: new Date().toISOString() },
  { id: 26, name: 'Fremantle',        lat: -32.0569, lng: 115.7439, pm25: 6.3,  aqi: 26, city: 'Perth',         lastUpdated: new Date().toISOString() },
  { id: 27, name: 'Midland',          lat: -31.8900, lng: 116.0050, pm25: 11.4, aqi: 47, city: 'Perth',         lastUpdated: new Date().toISOString() },
  { id: 28, name: 'Kwinana',          lat: -32.2333, lng: 115.7833, pm25: 14.6, aqi: 55, city: 'Perth',         lastUpdated: new Date().toISOString() },
  { id: 29, name: 'Adelaide CBD',     lat: -34.9285, lng: 138.6007, pm25: 10.2, aqi: 43, city: 'Adelaide',      lastUpdated: new Date().toISOString() },
  { id: 30, name: 'Elizabeth',        lat: -34.7167, lng: 138.6667, pm25: 8.6,  aqi: 36, city: 'Adelaide',      lastUpdated: new Date().toISOString() },
  { id: 31, name: 'Christies Beach',  lat: -35.1382, lng: 138.4930, pm25: 7.1,  aqi: 29, city: 'Adelaide',      lastUpdated: new Date().toISOString() },
  { id: 32, name: 'Canberra',         lat: -35.2809, lng: 149.1300, pm25: 5.4,  aqi: 23, city: 'Canberra',      lastUpdated: new Date().toISOString() },
  { id: 33, name: 'Hobart',           lat: -42.8821, lng: 147.3272, pm25: 4.1,  aqi: 17, city: 'Hobart',        lastUpdated: new Date().toISOString() },
  { id: 34, name: 'Darwin',           lat: -12.4634, lng: 130.8456, pm25: 6.9,  aqi: 29, city: 'Darwin',        lastUpdated: new Date().toISOString() },
  { id: 35, name: 'Alice Springs',    lat: -23.6980, lng: 133.8807, pm25: 9.7,  aqi: 41, city: 'Alice Springs', lastUpdated: new Date().toISOString() },
]