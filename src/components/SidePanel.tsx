'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Station, UVData, aqiCategory } from '@/lib/utils'

interface PanelProps {
  selectedStation: Station | null
  userCoords: { lat: number; lng: number } | null
}

function uvHex(uv: number) {
  if (uv < 3)  return '#34d399'
  if (uv < 6)  return '#fbbf24'
  if (uv < 8)  return '#fb923c'
  if (uv < 11) return '#f87171'
  return '#c084fc'
}

function aqiHex(aqi: number) {
  if (aqi <= 50)  return '#34d399'
  if (aqi <= 100) return '#fbbf24'
  if (aqi <= 150) return '#fb923c'
  if (aqi <= 200) return '#f87171'
  if (aqi <= 300) return '#c084fc'
  return '#fb7185'
}

export default function SidePanel({ selectedStation, userCoords }: PanelProps) {
  const [uvData, setUVData] = useState<UVData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const lat = userCoords?.lat ?? -33.8688
    const lng = userCoords?.lng ?? 151.2093
    setLoading(true)
    fetch(`/api/uv?lat=${lat}&lng=${lng}`)
      .then(r => r.json())
      .then(d => { setUVData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userCoords])

  const uvHourly = uvData?.hourlyUV.map((v, i) => ({
    h: `${i}`,
    uv: Math.round(v * 10) / 10,
  })) ?? []

  return (
    <aside style={{
      width: 288,
      height: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'relative',
      zIndex: 2,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(79,158,255,0.4), transparent)',
        pointerEvents: 'none',
      }} />

      <header style={{ padding: '28px 24px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <LiveDot />
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 26,
          color: 'var(--text)',
          letterSpacing: '-0.01em',
          lineHeight: 1,
          marginBottom: 4,
        }}>
          AirWatch
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 300 }}>
          Australia · Real-time air quality
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

        <Section label="Conditions near you">
          {loading ? <Skeleton /> : uvData ? (
            <>
              <div style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
                marginBottom: 8,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 80, height: 80, borderRadius: '50%',
                  background: uvHex(uvData.uvIndex ?? 0),
                  opacity: 0.08, filter: 'blur(20px)',
                  pointerEvents: 'none',
                }} />
                <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>UV Index</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontSize: 48,
                    color: uvHex(uvData.uvIndex ?? 0),
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}>
                    {uvData.uvIndex?.toFixed(1) ?? '—'}
                  </span>
                  <span style={{ fontSize: 13, color: uvHex(uvData.uvIndex ?? 0), fontWeight: 500 }}>
                    {uvData.uvCategory}
                  </span>
                </div>
                {uvHourly.length > 0 && (
                  <div style={{ height: 48, marginTop: 14 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={uvHourly} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="uvG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={uvHex(uvData.uvIndex ?? 0)} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={uvHex(uvData.uvIndex ?? 0)} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="uv" stroke={uvHex(uvData.uvIndex ?? 0)} strokeWidth={1.5} fill="url(#uvG)" dot={false} />
                        <Tooltip
                          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, fontFamily: 'var(--font-mono)' }}
                          labelFormatter={(l: string) => `${l}:00`}
                          itemStyle={{ color: 'var(--text-2)' }}
                          labelStyle={{ color: 'var(--text-3)' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                <Chip label="Temp" value={`${Math.round(uvData.temperature ?? 0)}°`} />
                <Chip label="Humidity" value={`${Math.round(uvData.humidity ?? 0)}%`} />
                <Chip label="Wind" value={`${Math.round(uvData.windSpeed ?? 0)}`} unit="km/h" />
              </div>
            </>
          ) : null}
        </Section>

        {selectedStation && selectedStation.aqi !== null && (
          <Section label="Selected station">
            <StationCard station={selectedStation} />
          </Section>
        )}

        {!selectedStation && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7 }}>
              Tap any marker on the map to see detailed readings for that station.
            </div>
          </div>
        )}

        <Section label="AQI scale">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { r: '0–50',    l: 'Good',             c: '#34d399' },
              { r: '51–100',  l: 'Moderate',          c: '#fbbf24' },
              { r: '101–150', l: 'Sensitive groups',  c: '#fb923c' },
              { r: '151–200', l: 'Unhealthy',         c: '#f87171' },
              { r: '201–300', l: 'Very Unhealthy',    c: '#c084fc' },
              { r: '300+',    l: 'Hazardous',         c: '#fb7185' },
            ].map(item => (
              <div key={item.r} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 3, height: 18, borderRadius: 2, background: item.c, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', width: 48, flexShrink: 0 }}>{item.r}</span>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{item.l}</span>
              </div>
            ))}
          </div>
        </Section>

      </div>

      <footer style={{
        padding: '14px 24px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>OpenAQ · Open-Meteo</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>~10 min cache</span>
      </footer>
    </aside>
  )
}

function LiveDot() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ position: 'relative', width: 7, height: 7 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', position: 'absolute' }} />
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', position: 'absolute', animation: 'breathe 2s ease-in-out infinite', opacity: 0.5 }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em' }}>LIVE</span>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Chip({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
      <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 5 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--text)', letterSpacing: '-0.02em' }}>
        {value}
        {unit && <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  )
}

function StationCard({ station }: { station: Station }) {
  const cat = aqiCategory(station.aqi!)
  const hex = aqiHex(station.aqi!)
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: `1px solid ${hex}33`,
      borderRadius: 'var(--radius-lg)',
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', bottom: -24, right: -24,
        width: 80, height: 80, borderRadius: '50%',
        background: hex, opacity: 0.07, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>{station.city}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 14 }}>{station.name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 52, color: hex, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {station.aqi}
        </span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: hex }}>{cat.label}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
            PM2.5 · {station.pm25?.toFixed(1) ?? '—'} µg/m³
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>{cat.description}</div>
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[88, 56, 40].map(h => (
        <div key={h} style={{ height: h, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }} />
      ))}
    </div>
  )
}