import logoUrl from '../../assets/logo.webp'
import logoBolt from '../../assets/logo-bolt.webp'

interface LogoProps {
  className?: string
  /** false → render only the bolt mark (for tight square slots) */
  withWordmark?: boolean
}

/**
 * HellIPTV brand logo — dark wordmark + green bolt on a transparent background,
 * so it sits cleanly on the light theme without any plate.
 */
export function Logo({ className, withWordmark = true }: LogoProps) {
  return (
    <img
      src={withWordmark ? logoUrl : logoBolt}
      alt="HellIPTV"
      draggable={false}
      width={withWordmark ? 515 : 118}
      height={withWordmark ? 126 : 162}
      className={`select-none ${withWordmark ? `w-auto ${className ?? 'h-9'}` : 'max-h-full w-auto object-contain'}`}
    />
  )
}
