import { useEffect, useState } from 'react'

export interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

function diff(target: number): TimeLeft {
  const ms = Math.max(0, target - Date.now())
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  }
}

/** Ticks down to `target` (a timestamp in ms), updating every second. */
export function useCountdown(target: number): TimeLeft {
  const [left, setLeft] = useState<TimeLeft>(() => diff(target))

  useEffect(() => {
    setLeft(diff(target))
    const id = setInterval(() => setLeft(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  return left
}

/**
 * Build a future timestamp `daysFromNow` days ahead at local `hour`.
 * If that moment is already in the past (e.g. today's hour passed), it rolls
 * forward a week so the countdown is always live.
 */
export function fixtureTimestamp(daysFromNow: number, hour: number): number {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, 0, 0, 0)
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 7)
  return d.getTime()
}
