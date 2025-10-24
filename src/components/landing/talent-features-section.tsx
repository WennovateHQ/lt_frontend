import { 
  CurrencyDollarIcon, 
  MapPinIcon, 
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const talentFeatures = [
  {
    name: 'Premium Rates',
    description: 'Earn fair market rates for your local expertise, not global commodity pricing.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Local Advantage',
    description: 'Your proximity and in-person availability are valued differentiators.',
    icon: MapPinIcon,
  },
  {
    name: 'Secure Payments',
    description: 'Milestone-based escrow ensures you get paid for completed work.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Quick Opportunities',
    description: 'Get matched with projects that need your skills within 48 hours.',
    icon: ClockIcon,
  },
  {
    name: 'Build Relationships',
    description: 'Work repeatedly with local businesses who value your expertise.',
    icon: UserGroupIcon,
  },
  {
    name: 'Build Reputation',
    description: 'Grow your local professional reputation with verified reviews.',
    icon: StarIcon,
  },
]

export function TalentFeaturesSection() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-green-600">
            Better Way to Work
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to build your independent career
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Stop competing on price with global markets. Start building valuable 
            relationships with local businesses who need your expertise.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {talentFeatures.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
