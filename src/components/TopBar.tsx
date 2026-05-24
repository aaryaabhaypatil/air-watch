'use client'

interface TopBarProps {
  stationCount: number
  loading: boolean
  onRefresh: () => void
  lastRefresh: Date | null
}

export default function TopBar({ stationCount, loading, onRefresh, lastRefresh }: TopBarProps) {
  const timeStr = lastRefresh
    ? lastRefresh.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <div style={{
      position: 'absolute',
      top: 20, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(10,12,18,0.82)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 100,
      padding: '0 6px',
      height: 38,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.03)',
    }}>
      <Pill>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: loading ? '#fbbf24' : '#34d399',
          boxShadow: `0 0 8px ${loading ? '#fbbf24' : '#34d399'}`,
          transition: 'all 0.4s',
        }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          {loading ? 'Updating…' : `${stationCount} stations`}
        </span>
      </Pill>
      <Divider />
      <Pill>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
          {timeStr}
        </span>
      </Pill>
      <Divider />
      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          height: 28, padding: '0 12px',
          background: loading ? 'transparent' : 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 100,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: loading ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)',
          transition: 'all 0.15s',
          margin: '0 2px',
        }}
        onMouseEnter={e => { if (!loading) (e.currentTarget.style.color = 'rgba(255,255,255,0.8)') }}
        onMouseLeave={e => { e.currentTarget.style.color = loading ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)' }}
      >
        ↻ Refresh
      </button>
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 12px' }}>{children}</div>
}

function Divider() {
  return <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.06)' }} />
}