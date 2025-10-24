import { TalentHeroSection } from '@/components/landing/talent-hero-section'
import { TalentFeaturesSection } from '@/components/landing/talent-features-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
//import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { CTASection } from '@/components/landing/cta-section'

export default function TalentLandingPage() {
  return (
    <main className="min-h-screen">
      <TalentHeroSection />
      <TalentFeaturesSection />
      <HowItWorksSection />
      {/* <TestimonialsSection /> */}
      <PricingSection />
      <CTASection />
    </main>
  )
}
