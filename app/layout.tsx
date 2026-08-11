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

export const metadata: Metadata = {
  title: 'TYP - Testing Your Preparedness',
  description: 'Ghana\'s all-in-one exam prep and digital skills platform — BECE, WASSCE, nursing, university entrance, and job-ready digital skills, with practice tests, analytics, and personalized learning.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
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
      <body className={`${inter.variable} ${geistMono.variable} ${spaceGrotesk.variable} font-sans antialiased`} suppressHydrationWarning>
        <SessionProvider>
          {children}
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  )
}
