import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Providers from "@/components/Providers"
import CookieBanner from "@/components/CookieBanner"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.relaydesk.com.au'),
  title: {
    default: 'RelayDesk',
    template: '%s · RelayDesk',
  },
  description: 'RelayDesk is an AI phone agent for Australian local businesses. Run your business, not your phone.',
  openGraph: {
    title: 'RelayDesk',
    description: 'Run your business, not your phone. Meet your AI phone agent.',
    url: 'https://www.relaydesk.com.au',
    siteName: 'RelayDesk',
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RelayDesk',
    description: 'Run your business, not your phone. Meet your AI phone agent.',
  },
  alternates: {
    canonical: 'https://www.relaydesk.com.au',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "RelayDesk",
              "description": "Phone answering service for local Australian businesses. Answer every inbound call, capture orders, handle common questions.",
              "url": "https://relaydesk.com.au",
              "telephone": "+61253023030",
              "email": "hello@relaydesk.com.au",
              "areaServed": {
                "@type": "Country",
                "name": "AU"
              },
              "serviceType": "Phone Answering Service",
              "priceRange": "$199-$999",
              "knowsAbout": [
                "Phone answering",
                "Call handling",
                "Order capture",
                "Customer communication"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Phone Answering for Local Business",
              "provider": {
                "@type": "LocalBusiness",
                "name": "RelayDesk"
              },
              "areaServed": {
                "@type": "Country",
                "name": "AU"
              },
              "description": "24/7 phone answering for local businesses. Handles calls, captures details, answers FAQs, transfers when needed."
            })
          }}
        />
      </head>
      <body className="antialiased font-sans bg-white text-slate-900">
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  )
}
