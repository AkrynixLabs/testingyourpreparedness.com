"use client"

import { useEffect, useState } from "react"

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

  return (
    <div className="absolute inset-0 [transform:translateZ(0)]" aria-hidden>
      {images.map((image, i) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          decoding="async"
          style={{ opacity: i === active ? maxOpacity : 0, willChange: "opacity" }}
          className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out [transform:translateZ(0)] [backface-visibility:hidden]"
        />
      ))}

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
