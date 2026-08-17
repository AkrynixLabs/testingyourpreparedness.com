"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function HeroImageSlider({
  images,
  maxOpacity = 0.9,
}: {
  images: { src: string; alt: string }[]
  maxOpacity?: number
}) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const rotate = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(rotate)
  }, [images.length])

  const total = images.length

  return (
    <div
      className="absolute inset-x-0 top-0 h-[420px] overflow-hidden [transform:translateZ(0)] sm:h-[520px] md:inset-0 md:h-auto"
      aria-hidden
    >
      {images.map((image, i) => {
        let offset = i - active
        if (offset > total / 2) offset -= total
        if (offset < -total / 2) offset += total

        return (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            priority={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
            style={{
              opacity: maxOpacity,
              transform: `translate3d(${offset * 100}%, 0, 0)`,
              willChange: "transform",
            }}
            className="object-cover object-center transition-transform duration-1000 ease-in-out [backface-visibility:hidden]"
          />
        )
      })}

      {/* Slide indicators - kept fully opaque and clickable regardless of maxOpacity */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {images.map((image, i) => (
          <button
            key={image.src}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-5 bg-foreground/70" : "w-1.5 bg-foreground/25"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
