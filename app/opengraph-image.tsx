import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "TYP - Testing Your Preparedness"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0072D5 0%, #003d73 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            letterSpacing: -2,
            display: "flex",
          }}
        >
          TYP
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            marginTop: 12,
            display: "flex",
          }}
        >
          Testing Your Preparedness
        </div>
        <div
          style={{
            fontSize: 26,
            marginTop: 28,
            color: "#cfe4fa",
            display: "flex",
          }}
        >
          BECE · WASSCE · Nursing · University Entrance · Digital Skills
        </div>
      </div>
    ),
    { ...size }
  )
}
