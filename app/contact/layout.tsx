import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with TYP (Testing Your Preparedness) for questions about BECE, WASSCE, nursing entrance, or university entrance exam prep, school registration, or billing.",
  alternates: {
    canonical: "/contact",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
