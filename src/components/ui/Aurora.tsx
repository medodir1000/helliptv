interface AuroraProps {
  className?: string
}

/**
 * Ambient animated background: slow-drifting neon blobs + blueprint grid.
 * Purely decorative — pointer-events disabled, hidden from AT.
 */
export function Aurora({ className = '' }: AuroraProps) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-neon/12 blur-[150px] animate-aurora" />
      <div
        className="absolute -right-28 top-24 h-[26rem] w-[26rem] rounded-full bg-volt/8 blur-[150px] animate-float-slow"
        style={{ animationDelay: '1.2s' }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-neon-2/10 blur-[160px] animate-aurora"
        style={{ animationDelay: '2.4s' }}
      />
    </div>
  )
}
