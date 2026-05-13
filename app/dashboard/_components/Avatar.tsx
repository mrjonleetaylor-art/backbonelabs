const PALETTE = ['#6366F1', '#06B6D4', '#F59E0B', '#10B981', '#F43F5E', '#8B5CF6']

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
