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
  title: "Phone answering for local business | RelayDesk",
  description:
    "RelayDesk answers every inbound call for your local business. No missed orders, no busy signals. Keep your existing number or get a new one.",
  icons: {
    icon: [
      { url: "/relaydesk_logo_assets/favicon/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/relaydesk_logo_assets/favicon/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/relaydesk_logo_assets/favicon/favicon-64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: "/relaydesk_logo_assets/favicon/favicon-64.png",
    shortcut: "/relaydesk_logo_assets/favicon/favicon.ico",
  },
  openGraph: {
    type: "website",
    title: "Phone answering for local business | RelayDesk",
    description:
      "RelayDesk answers every inbound call for your local business. No missed orders, no busy signals.",
    url: "https://relaydesk.com.au",
    images: [{ url: "https://relaydesk.com.au/relaydesk_logo_assets/OG/relaydesk-og-1200x630.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phone answering for local business | RelayDesk",
    description:
      "RelayDesk answers every inbound call for your local business. No missed orders, no busy signals.",
    images: ["https://relaydesk.com.au/relaydesk_logo_assets/OG/relaydesk-og-1200x630.png"],
  },
  alternates: {
    canonical: "https://relaydesk.com.au",
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
