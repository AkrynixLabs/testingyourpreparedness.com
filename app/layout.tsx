import type { Metadata } from 'next'
import { Inter, Geist_Mono, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SessionProvider } from '@/components/session-provider'
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter'
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono'
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  weight: ['500', '600', '700'],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://testingyourpreparedness.com'
const siteName = 'TYP - Testing Your Preparedness'
const siteDescription = 'Ghana\'s all-in-one exam prep and digital skills platform — BECE, WASSCE, nursing, university entrance, and job-ready digital skills, with practice tests, analytics, and personalized learning.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: '%s | TYP',
  },
  description: siteDescription,
  keywords: [
    'TYP',
    'Testing Your Preparedness',
    'BECE past questions',
    'WASSCE past questions',
    'Ghana exam prep',
    'BECE mock exams',
    'nursing entrance exam Ghana',
    'university entrance exam Ghana',
    'digital skills training Ghana',
  ],
  generator: 'v0.app',
  applicationName: 'TYP',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    locale: 'en_GH',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  icons: {
    icon: [
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TYP',
  alternateName: 'Testing Your Preparedness',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description: siteDescription,
  areaServed: 'GH',
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TYP - Testing Your Preparedness',
  alternateName: 'TYP',
  url: siteUrl,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} ${spaceGrotesk.variable} font-sans antialiased`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <SessionProvider>
          {children}
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  )
}
