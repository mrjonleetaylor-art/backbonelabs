import type { Metadata } from "next"
import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import DemoCall from "@/components/DemoCall"
import Problem from "@/components/Problem"
import DashboardPreview from "@/components/DashboardPreview"
import HowItWorks from "@/components/HowItWorks"
import WhatThomas from "@/components/WhatThomas"
// import SampleCalls from "@/components/SampleCalls" — hidden until real recordings available
import ROICalculator from "@/components/ROICalculator"
import Pricing from "@/components/Pricing"
import FAQ from "@/components/FAQ"
import FinalCTA from "@/components/FinalCTA"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
  title: "AI Phone Answering for Australian Businesses | RelayDesk",
  description: "24/7 AI phone agent for Australian small businesses. Answers calls, takes orders, handles questions, and emails you the details. No missed calls. From $99/month.",
  alternates: {
    canonical: "https://www.relaydesk.com.au",
  },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "What happens when someone calls?", "acceptedAnswer": { "@type": "Answer", "text": "RelayDesk answers in two rings, greets the caller using your shop name, and handles the conversation from there. It takes orders, answers common questions, collects contact details, and sends you a summary after every call." } },
              { "@type": "Question", "name": "Can you handle multiple calls at the same time?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. There is no queue and no engaged tone. RelayDesk handles concurrent calls, so every caller gets answered even during your busiest periods." } },
              { "@type": "Question", "name": "What happens if you don't know the answer?", "acceptedAnswer": { "@type": "Answer", "text": "During setup, we configure RelayDesk with everything specific to your business — products, hours, pricing, delivery areas, and your most common questions. For anything outside that, it takes a clear message and flags it for you to follow up." } },
              { "@type": "Question", "name": "Can I keep my existing phone number?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. We set up call forwarding on your existing number, so callers dial the same number they always have. Nothing changes on their end." } },
              { "@type": "Question", "name": "Can RelayDesk take payment?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. RelayDesk sends a secure SMS payment link to the caller's phone, processed with 3D Secure authentication. You can take full payment, a deposit, or split payments." } },
              { "@type": "Question", "name": "Can calls be transferred to my mobile?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. You set the rules — VIP customers, large orders, whatever you decide gets routed straight through to you." } },
              { "@type": "Question", "name": "Is my customer data secure?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Call recordings and customer details are stored on encrypted servers in Australia. Only you have access to your data through the dashboard. We do not share it with third parties." } },
              { "@type": "Question", "name": "How does pricing work?", "acceptedAnswer": { "@type": "Answer", "text": "Plans start at $99/month and scale with your call volume. Each plan includes a set number of calls, and extra calls beyond that are charged at $1 per call. No lock-in — cancel any month." } },
              { "@type": "Question", "name": "What happens if I want to cancel?", "acceptedAnswer": { "@type": "Answer", "text": "No lock-in. Cancel any time with 30 days notice. We'll help you transition and make sure nothing falls through the cracks." } }
            ]
          })
        }}
      />
      <Nav />
      <main>
        <Hero />
        <DemoCall />
        <Problem />
        <HowItWorks />
        <DashboardPreview />
        <WhatThomas />
        {/* <SampleCalls /> — hidden until real call recordings are available */}
        <ROICalculator />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
