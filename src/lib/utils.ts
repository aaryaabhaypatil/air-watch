export interface Station {
  id: number
  name: string
  lat: number
  lng: number
  pm25: number | null
  aqi: number | null
  city: string
  lastUpdated: string | null
}

export interface UVData {
  uvIndex: number | null
  temperature: number | null
  humidity: number | null
  windSpeed: number | null
  uvCategory: string
  hourlyUV: number[]
}

export function aqiCategory(aqi: number): {
  label: string
  color: string
  textColor: string
  bg: string
  description: string
} {
  if (aqi <= 50) return {
    label: 'Good', color: '#22c55e', textColor: '#14532d', bg: '#f0fdf4',
    description: 'Air quality is satisfactory. Enjoy outdoor activities.'
  }
  if (aqi <= 100) return {
    label: 'Moderate', color: '#eab308', textColor: '#713f12', bg: '#fefce8',
    description: 'Acceptable air quality. Sensitive individuals should limit prolonged outdoor exertion.'
  }
  if (aqi <= 150) return {
    label: 'Unhealthy for Sensitive Groups', color: '#f97316', textColor: '#7c2d12', bg: '#fff7ed',
    description: 'Sensitive groups may experience health effects. General public unlikely to be affected.'
  }
  if (aqi <= 200) return {
    label: 'Unhealthy', color: '#ef4444', textColor: '#7f1d1d', bg: '#fef2f2',
    description: 'Everyone may experience health effects. Sensitive groups should avoid outdoor activities.'
  }
  if (aqi <= 300) return {
    label: 'Very Unhealthy', color: '#a855f7', textColor: '#4a1d96', bg: '#faf5ff',
    description: 'Health alert. Everyone should avoid prolonged outdoor exertion.'
  }
  return {
    label: 'Hazardous', color: '#7f1d1d', textColor: '#fef2f2', bg: '#450a0a',
    description: 'Health emergency. Avoid all outdoor activity.'
  }
}

export function uvColor(uv: number): string {
  if (uv < 3) return '#22c55e'
  if (uv < 6) return '#eab308'
  if (uv < 8) return '#f97316'
  if (uv < 11) return '#ef4444'
  return '#a855f7'
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'unknown'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
