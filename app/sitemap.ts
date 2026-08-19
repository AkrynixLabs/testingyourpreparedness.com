import type { MetadataRoute } from "next"
import { stripTrailingSlash } from "@/lib/utils"

const siteUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_APP_URL || "https://testingyourpreparedness.com")

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/signup", priority: 0.9, changeFrequency: "monthly" },
    { path: "/signup/school", priority: 0.8, changeFrequency: "monthly" },
    { path: "/signup/independent", priority: 0.8, changeFrequency: "monthly" },
    { path: "/signup/tutor", priority: 0.6, changeFrequency: "monthly" },
    { path: "/join", priority: 0.5, changeFrequency: "monthly" },
    { path: "/login", priority: 0.4, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
  ]

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
