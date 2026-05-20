import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#FAF9F5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 176,
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        <span
          style={{
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: 110,
            letterSpacing: '-4px',
            lineHeight: 1,
            display: 'flex',
            marginBottom: 40,
          }}
        >
          <span style={{ color: '#0F172A' }}>Relay</span>
          <span style={{ color: '#F59E0B' }}>Desk</span>
        </span>
        <span
          style={{
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: 56,
            color: '#0F172A',
            lineHeight: 1.2,
            letterSpacing: '-1px',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          Run your business, not your phone.
        </span>
        <span
          style={{
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: 32,
            color: '#475569',
            lineHeight: 1.4,
            textAlign: 'center',
          }}
        >
          Meet your AI phone agent.
        </span>
      </div>
    ),
    { ...size }
  )
}
