import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat') ?? '-33.8688'
  const lng = searchParams.get('lng') ?? '151.2093'

  try {
    // Open-Meteo is completely free with no API key
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=uv_index,temperature_2m,relative_humidity_2m,wind_speed_10m` +
      `&hourly=uv_index&timezone=Australia%2FSydney&forecast_days=1`,
      { next: { revalidate: 1800 } }
    )

    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)
    const data = await res.json()

    return NextResponse.json({
      uvIndex: data.current?.uv_index ?? null,
      temperature: data.current?.temperature_2m ?? null,
      humidity: data.current?.relative_humidity_2m ?? null,
      windSpeed: data.current?.wind_speed_10m ?? null,
      uvCategory: categoriseUV(data.current?.uv_index ?? 0),
      hourlyUV: data.hourly?.uv_index?.slice(0, 24) ?? [],
    })
  } catch (err) {
    console.error('UV fetch error:', err)
    return NextResponse.json({
      uvIndex: 6,
      temperature: 22,
      humidity: 58,
      windSpeed: 14,
      uvCategory: 'High',
      hourlyUV: [],
    })
  }
}

function categoriseUV(uv: number): string {
  if (uv < 3) return 'Low'
  if (uv < 6) return 'Moderate'
  if (uv < 8) return 'High'
  if (uv < 11) return 'Very High'
  return 'Extreme'
}
