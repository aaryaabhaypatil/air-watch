import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AirWatch — Live Air Quality Map',
  description: 'Hyperlocal real-time air quality, UV index and pollen for Australian suburbs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
