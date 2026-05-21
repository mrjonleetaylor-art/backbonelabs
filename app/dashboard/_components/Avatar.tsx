const PALETTE = ['#1E3A5F', '#F59E0B', '#162D47', '#10B981', '#F43F5E', '#64748B']

function colourFor(initials: string): string {
  const code = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)
  return PALETTE[code % PALETTE.length]
}

export default function Avatar({ initials, size = 32, colour }: { initials: string; size?: number; colour?: string }) {
  const bg = colour ?? colourFor(initials)
  const fontSize = Math.round(size * 0.38)
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: bg, fontSize }}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  )
}

export function initialsFrom(name: string | null, fallback?: string): string {
  const source = name ?? fallback ?? '?'
  return source.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '?'
}
