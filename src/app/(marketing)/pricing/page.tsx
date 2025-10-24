import { PricingSection } from '@/components/landing/pricing-section'
import { CTASection } from '@/components/landing/cta-section'

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Simple, transparent pricing
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              No hidden fees. No long-term contracts. Pay only when you find the right talent.
            </p>
          </div>
        </div>
      </div>
      <PricingSection />
      <CTASection />
    </main>
  )
}
