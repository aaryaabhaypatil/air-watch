'use client'

import { useEffect, useRef } from 'react'
import { Station, aqiCategory, timeAgo } from '@/lib/utils'

interface MapProps {
  stations: Station[]
  onStationClick: (station: Station) => void
  selectedId: number | null
}

function aqiHex(aqi: number): string {
  if (aqi <= 50)  return '#34d399'
  if (aqi <= 100) return '#fbbf24'
  if (aqi <= 150) return '#fb923c'
  if (aqi <= 200) return '#f87171'
  if (aqi <= 300) return '#c084fc'
  return '#fb7185'
}

export default function Map({ stations, onStationClick, selectedId }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  // Init map once
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return

    // Dynamically import Leaflet (browser only)
    import('leaflet').then(L => {
      // Fix default icon path issue in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '',
        iconUrl: '',
        shadowUrl: '',
      })

      const map = L.map(mapContainer.current!, {
        center: [-25.5, 134.0],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      })

      // OpenStreetMap tiles — free, no token
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      // Custom zoom control bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      mapRef.current = { map, L }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.map.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Place markers whenever stations update
  useEffect(() => {
    if (!stations.length) return

    const tryPlace = () => {
      if (!mapRef.current) {
        // Map not ready yet, retry
        setTimeout(tryPlace, 100)
        return
      }

      const { map, L } = mapRef.current

      // Clear old markers
      markersRef.current.forEach(m => map.removeLayer(m))
      markersRef.current = []

      stations.forEach(station => {
        if (!station.aqi || !station.lat || !station.lng) return

        const hex = aqiHex(station.aqi)
        const cat = aqiCategory(station.aqi)
        const isHigh = station.aqi > 100

        const html = `
          <div style="
            width:44px; height:44px;
            border-radius:50%;
            background:${hex}22;
            border:2px solid ${hex};
            display:flex; align-items:center; justify-content:center;
            cursor:pointer;
            box-shadow:0 0 12px ${hex}55;
            ${isHigh ? 'animation:breathe 2.8s ease-in-out infinite;' : ''}
          ">
            <span style="
              font-family:'Geist Mono',monospace;
              font-size:11px; font-weight:500;
              color:${hex}; line-height:1;
            ">${station.aqi}</span>
          </div>
        `

        const icon = L.divIcon({
          html,
          className: '',
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        })

        const marker = L.marker([station.lat, station.lng], { icon })
          .addTo(map)
          .on('click', () => {
            onStationClick(station)

            // Close any open popups
            map.closePopup()

            const popupHtml = `
              <div style="
                background:rgba(10,12,18,0.97);
                border:1px solid rgba(255,255,255,0.1);
                border-radius:16px; padding:20px; min-width:220px;
                box-shadow:0 24px 48px rgba(0,0,0,0.8);
                font-family:'Geist',sans-serif;
              ">
                <div style="font-family:'Geist Mono',monospace;font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:4px;">${station.city}</div>
                <div style="font-size:15px;font-weight:500;color:#f0f2f5;margin-bottom:14px;">${station.name}</div>
                <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:14px;">
                  <div style="font-family:'Instrument Serif',Georgia,serif;font-size:48px;color:${hex};line-height:1;font-style:italic;">${station.aqi}</div>
                  <div>
                    <div style="font-size:12px;font-weight:500;color:${hex};margin-bottom:2px;">${cat.label}</div>
                    <div style="font-family:'Geist Mono',monospace;font-size:10px;color:rgba(255,255,255,0.3);">PM2.5 · ${station.pm25?.toFixed(1) ?? '—'} µg/m³</div>
                  </div>
                </div>
                <div style="height:1px;background:rgba(255,255,255,0.07);margin-bottom:12px;"></div>
                <div style="font-size:12px;color:rgba(255,255,255,0.4);line-height:1.6;">${cat.description}</div>
                <div style="font-family:'Geist Mono',monospace;font-size:10px;color:rgba(255,255,255,0.2);margin-top:10px;">Updated ${timeAgo(station.lastUpdated)}</div>
              </div>
            `

            L.popup({
              closeButton: false,
              className: 'aw-popup',
              offset: [0, -10],
            })
              .setLatLng([station.lat, station.lng])
              .setContent(popupHtml)
              .openOn(map)
          })

        markersRef.current.push(marker)
      })
    }

    tryPlace()
  }, [stations, onStationClick])

  return (
    <>
      <style>{`
        .leaflet-container { background: #080a0f; }
        .aw-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .aw-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .aw-popup .leaflet-popup-tip-container { display: none !important; }
        .leaflet-control-zoom {
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 10px !important;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
        }
        .leaflet-control-zoom a {
          background: rgba(13,17,23,0.9) !important;
          color: rgba(255,255,255,0.5) !important;
          border: none !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(255,255,255,0.08) !important;
          color: #fff !important;
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.7; box-shadow: 0 0 8px currentColor; }
          50%       { opacity: 1;   box-shadow: 0 0 20px currentColor; }
        }
      `}</style>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
    </>
  )
}