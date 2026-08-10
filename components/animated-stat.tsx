"use client"

import { useEffect, useRef, useState } from "react"

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export function AnimatedStat({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const match = value.match(/^(\D*)([\d,]+)(.*)$/)
    const node = ref.current
    if (!match || !node) return
    const [, prefix, numStr, suffix] = match
    const target = parseInt(numStr.replace(/,/g, ""), 10)

    let frame: number
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setDisplay(value)
          return
        }

        const duration = 1400
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          const current = Math.round(target * easeOutCubic(progress))
          setDisplay(`${prefix}${current.toLocaleString()}${suffix}`)
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    observer.observe(node)

    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [value])

  return <span ref={ref}>{display}</span>
}
