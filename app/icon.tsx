import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
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
            fontSize: 13,
            letterSpacing: '-0.5px',
            lineHeight: 1,
            display: 'flex',
          }}
        >
          <span style={{ color: '#06B6D4' }}>R</span>
          <span style={{ color: '#0F172A' }}>d</span>
        </span>
      </div>
    ),
    { ...size }
  )
}
