'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import SidePanel from '@/components/SidePanel'
import TopBar from '@/components/TopBar'
import { Station } from '@/lib/utils'

// Map must be client-only (uses browser APIs)
const Map = dynamic(() => import('@/components/Map'), { ssr: false })

export default function Home() {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchStations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/air-quality')
      const data = await res.json()
      setStations(data.stations ?? [])
      setLastRefresh(new Date())
    } catch (e) {
      console.error('Failed to fetch stations', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => { fetchStations() }, [fetchStations])

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(fetchStations, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchStations])

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {} // silently fail — defaults to Sydney
    )
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <SidePanel selectedStation={selectedStation} userCoords={userCoords} />

      <div style={{ flex: 1, position: 'relative' }}>
        <TopBar
          stationCount={stations.length}
          loading={loading}
          onRefresh={fetchStations}
          lastRefresh={lastRefresh}
        />
        <Map
          stations={stations}
          onStationClick={setSelectedStation}
          selectedId={selectedStation?.id ?? null}
        />
      </div>
    </div>
  )
}
