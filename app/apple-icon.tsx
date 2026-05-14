import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#FAF9F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: 64,
            letterSpacing: '-2px',
            lineHeight: 1,
            display: 'flex',
          }}
        >
          <span style={{ color: '#06B6D4' }}>Relay</span>
          <span style={{ color: '#0F172A' }}>Desk</span>
        </span>
      </div>
    ),
    { ...size }
  )
}
