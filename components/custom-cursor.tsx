"use client"

import { useEffect, useRef, useState } from "react"

// Two-part trailing cursor (slow outer ring + tighter inner dot), the same
// mechanism eskooly.com builds with GSAP - reimplemented here with a plain
// requestAnimationFrame lerp loop so the project doesn't need to add GSAP as
// a dependency for one effect. Elements opt into the hover-scale state via
// data-cursor="small" | "big", matching eskooly's cursor-small/cursor-big
// convention (buttons vs. cards/photos).
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (fine && !reduced) setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const ring = ringRef.current
    const dot = dotRef.current
    const marketingRoot = document.querySelector(".marketing")
    if (!ring || !dot) return

    marketingRoot?.classList.add("custom-cursor-active")

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    let dotX = mouseX
    let dotY = mouseY
    let targetScale = 1
    let scale = 1
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      ring.style.opacity = "1"
      dot.style.opacity = "1"
    }
    window.addEventListener("mousemove", onMove)

    const loop = () => {
      ringX += (mouseX - ringX) * 0.14
      ringY += (mouseY - ringY) * 0.14
      dotX += (mouseX - dotX) * 0.35
      dotY += (mouseY - dotY) * 0.35
      scale += (targetScale - scale) * 0.25
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`
      dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%) scale(${scale})`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-cursor]")
      if (!target) return
      targetScale = target.getAttribute("data-cursor") === "big" ? 7 : 4
      ring.style.opacity = "0"
    }
    const onOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-cursor]")
      if (!target) return
      targetScale = 1
      ring.style.opacity = "1"
    }
    document.addEventListener("mouseover", onOver)
    document.addEventListener("mouseout", onOut)

    return () => {
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseover", onOver)
      document.removeEventListener("mouseout", onOut)
      cancelAnimationFrame(raf)
      marketingRoot?.classList.remove("custom-cursor-active")
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-8 w-8 rounded-full border border-primary opacity-0 transition-opacity duration-200"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full bg-primary opacity-0 [mix-blend-mode:difference]"
      />
    </>
  )
}
