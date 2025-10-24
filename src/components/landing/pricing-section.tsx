import { Button } from '@/components/ui/button'
import { CheckIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

const tiers = [
  {
    name: 'For Businesses',
    id: 'tier-business',
    href: '/register?type=business',
    priceMonthly: 'Free to start',
    description: 'Post projects and find local talent with no upfront costs.',
    features: [
      'Unlimited project postings',
      'Access to verified local talent',
      'Secure milestone-based payments',
      'In-app messaging and collaboration',
      'Project management tools',
      '8% platform fee on matched projects only',
    ],
    mostPopular: true,
    cta: 'Post Your First Project',
    color: 'blue',
  },
  {
    name: 'For Talent',
    id: 'tier-talent',
    href: '/register?type=talent',
    priceMonthly: 'Free to join',
    description: 'Build your local career and earn premium rates.',
    features: [
      'Create professional profile',
      'Apply to local projects',
      'Secure payment protection',
      'Build local reputation',
      'Direct client communication',
      'Keep 92% of project value',
    ],
    mostPopular: false,
    cta: 'Start Earning Today',
    color: 'green',
  },
]

export function PricingSection() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple, transparent pricing for everyone
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          No hidden fees, no monthly subscriptions. Pay only when you succeed.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ${
                tier.mostPopular
                  ? 'ring-2 ring-blue-600 bg-blue-50'
                  : 'ring-gray-200 bg-white'
              } xl:p-10`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.id}
                  className={`text-lg font-semibold leading-8 ${
                    tier.mostPopular ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {tier.name}
                </h3>
                {tier.mostPopular ? (
                  <p className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-600">
                    Most popular
                  </p>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  {tier.priceMonthly}
                </span>
              </p>
              <Link href={tier.href}>
                <Button
                  className={`mt-8 w-full ${
                    tier.color === 'blue'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  size="lg"
                >
                  {tier.cta}
                </Button>
              </Link>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
