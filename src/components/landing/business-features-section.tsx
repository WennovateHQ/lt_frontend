import { 
  ClockIcon, 
  MapPinIcon, 
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

const businessFeatures = [
  {
    name: 'Fast Matching',
    description: 'Get matched with qualified local talent within 48 hours, not weeks.',
    icon: ClockIcon,
  },
  {
    name: 'Local Focus',
    description: 'Find specialists in your city who can work on-site when needed.',
    icon: MapPinIcon,
  },
  {
    name: 'Verified Talent',
    description: 'All specialists are credential-verified with portfolio reviews.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Fair Pricing',
    description: 'No upfront costs. Only 8% platform fee on matched projects.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Quality Matches',
    description: 'Smart algorithm matches skills, location, and availability.',
    icon: UserGroupIcon,
  },
  {
    name: 'Secure Payments',
    description: 'Milestone-based escrow protects your investment.',
    icon: ChatBubbleLeftRightIcon,
  },
]

export function BusinessFeaturesSection() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            Better Way to Hire
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to find and hire local talent
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Skip expensive recruitment fees and lengthy hiring processes. 
            Connect directly with verified specialists in your area.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {businessFeatures.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
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
