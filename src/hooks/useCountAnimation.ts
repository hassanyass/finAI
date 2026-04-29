import { useEffect, useRef, useState } from 'react'

export function useCountAnimation(target: number, duration = 550) {
  const [displayed, setDisplayed] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    const prev = prevRef.current
    if (prev === target) return

    const diff = target - prev
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(prev + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
      else prevRef.current = target
    }

    requestAnimationFrame(tick)
  }, [target, duration])

  return displayed
}
