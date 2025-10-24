import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LocalTalents.ca - Find Local Niche Talent in 48 Hours',
  description: 'Connect with verified specialists in your city. No more expensive recruitment fees or global competition. Get quality work done by local experts who can collaborate in-person.',
  keywords: 'local talent, niche specialists, Canadian freelancers, local hiring, remote work',
  authors: [{ name: 'LocalTalents.ca' }],
  creator: 'LocalTalents.ca',
  publisher: 'LocalTalents.ca',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://localtalents.ca'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LocalTalents.ca - Find Local Niche Talent in 48 Hours',
    description: 'Connect with verified specialists in your city. Get quality work done by local experts.',
    url: 'https://localtalents.ca',
    siteName: 'LocalTalents.ca',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LocalTalents.ca - Local Niche Talent Platform',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LocalTalents.ca - Find Local Niche Talent in 48 Hours',
    description: 'Connect with verified specialists in your city.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
