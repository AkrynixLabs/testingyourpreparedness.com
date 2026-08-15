import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://testingyourpreparedness.com"

const disallowedPaths = [
  "/api/",
  "/super-admin",
  "/school-admin",
  "/content-admin",
  "/tutor",
  "/student",
  "/reset-password",
  "/forgot-password",
  "/guardian/approve",
  "/invite/accept",
  "/signup/school/checkout",
  "/signup/independent/checkout",
  "/sentry-example-page",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowedPaths,
      },
      // Explicitly allow known AI/answer-engine crawlers rather than leaving
      // them to a default that some site templates block.
      { userAgent: "GPTBot", allow: "/", disallow: disallowedPaths },
      { userAgent: "ChatGPT-User", allow: "/", disallow: disallowedPaths },
      { userAgent: "ClaudeBot", allow: "/", disallow: disallowedPaths },
      { userAgent: "Claude-User", allow: "/", disallow: disallowedPaths },
      { userAgent: "PerplexityBot", allow: "/", disallow: disallowedPaths },
      { userAgent: "Google-Extended", allow: "/", disallow: disallowedPaths },
      { userAgent: "CCBot", allow: "/", disallow: disallowedPaths },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
