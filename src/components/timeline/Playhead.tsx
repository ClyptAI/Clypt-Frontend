interface PlayheadProps {
  position: number
  pixelsPerSecond: number
  scrollX: number
  headerOffset: number
}

export function Playhead({ position, pixelsPerSecond, scrollX, headerOffset }: PlayheadProps) {
  const pixelPosition = position * pixelsPerSecond - scrollX

  if (pixelPosition < 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        zIndex: 50,
        pointerEvents: 'none',
        left: headerOffset,
        transform: `translateX(${pixelPosition}px)`,
        willChange: 'transform',
      }}
    >
      {/* Triangle head */}
      <svg
        width="13"
        height="14"
        viewBox="0 0 13 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]"
        style={{ position: 'absolute', top: 0, left: -6 }}
      >
        <path
          d="M0.5 0H12.5V8L6.5 14L0.5 8V0Z"
          fill="#A78BFA"
        />
      </svg>

      {/* Vertical line */}
      <div
        style={{
          position: 'absolute',
          top: 13,
          bottom: 0,
          left: 0,
          width: 1,
          background: 'var(--color-violet)',
          boxShadow: '0 0 6px rgba(167,139,250,0.5)',
        }}
      />
    </div>
  )
}
