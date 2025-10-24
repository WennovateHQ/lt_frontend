import Image from 'next/image'

const steps = [
  {
    id: '01',
    name: 'Post Your Project',
    description: 'Describe your project needs, budget, and timeline. Our smart matching system gets to work immediately.',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: '02',
    name: 'Review Local Talent',
    description: 'Get matched with verified specialists in your area. Review portfolios, rates, and availability.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: '03',
    name: 'Start Working Together',
    description: 'Choose your specialist and begin your project. Collaborate in-person or remotely with milestone-based payments.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2084&q=80',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">How It Works</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            From project to completion in 3 simple steps
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our streamlined process connects you with the right local talent quickly and efficiently.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-y-16 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col">
                <div className="relative">
                  <Image
                    src={step.image}
                    alt={step.name}
                    width={400}
                    height={300}
                    className="aspect-[4/3] w-full rounded-2xl bg-gray-100 object-cover"
                  />
                  <div className="absolute -top-4 -left-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg shadow-lg">
                    {step.id}
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-xl font-semibold leading-8 text-gray-900">{step.name}</h3>
                  <p className="mt-4 text-base leading-7 text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
