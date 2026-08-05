import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
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

export const metadata: Metadata = {
  title: 'TYP - Testing Your Preparedness | Exam Prep for BECE, WASSCE, Nursing & University',
  description: 'Ghana\'s all-in-one exam prep and digital skills platform — BECE, WASSCE, nursing, university entrance, and job-ready digital skills, with practice tests, analytics, and personalized learning.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <SessionProvider>
          {children}
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  )
}
