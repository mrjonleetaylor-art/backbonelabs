import type { Metadata } from "next"
import { Lora, DM_Sans } from "next/font/google"
import "./globals.css"

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Backbone Labs - AI Phone Agent for Florists",
  description:
    "Thomas Anderson answers every call to your florist shop - 24/7, so you never miss an order. AI phone agents for Australian small businesses.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${dmSans.variable}`}>
      <body className="antialiased font-sans bg-primary text-cream">{children}</body>
    </html>
  )
}
