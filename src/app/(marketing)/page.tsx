import { BusinessHeroSection } from '@/components/landing/business-hero-section'
import { BusinessFeaturesSection } from '@/components/landing/business-features-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
//import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { CTASection } from '@/components/landing/cta-section'

export default function BusinessLandingPage() {
  return (
    <main className="min-h-screen">
      <BusinessHeroSection />
      <BusinessFeaturesSection />
      <HowItWorksSection />
      {/* <TestimonialsSection /> */}
      <PricingSection />
      <CTASection />
    </main>
  )
}
