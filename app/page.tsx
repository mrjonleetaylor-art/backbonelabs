import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import SocialProof from "@/components/SocialProof"
import DemoCall from "@/components/DemoCall"
import Problem from "@/components/Problem"
import HowItWorks from "@/components/HowItWorks"
import WhatThomas from "@/components/WhatThomas"
import ROICalculator from "@/components/ROICalculator"
import Pricing from "@/components/Pricing"
import FAQ from "@/components/FAQ"
import FinalCTA from "@/components/FinalCTA"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SocialProof />
        <DemoCall />
        <Problem />
        <HowItWorks />
        <WhatThomas />
        <ROICalculator />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
