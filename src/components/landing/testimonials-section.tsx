import Image from 'next/image'

const testimonials = [
  {
    body: 'LocalTalents helped us find an amazing developer right here in Vancouver. The quality of work was exceptional and having someone local made collaboration so much easier.',
    author: {
      name: 'Sarah Chen',
      handle: 'sarahchen',
      role: 'CEO, TechStart Vancouver',
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    },
  },
  {
    body: 'As a business owner in Calgary, I was tired of competing with global rates. LocalTalents connected me with local businesses who value my expertise and pay fairly.',
    author: {
      name: 'Marcus Thompson',
      handle: 'marcust',
      role: 'Full-Stack Developer',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    },
  },
  {
    body: 'The platform made it incredibly easy to find a UX designer in Toronto. The milestone-based payment system gave us confidence throughout the project.',
    author: {
      name: 'Emily Rodriguez',
      handle: 'emilyrod',
      role: 'Product Manager, FinTech Solutions',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    },
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-blue-600">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by businesses and talent across Canada
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, testimonialIdx) => (
              <div
                key={testimonialIdx}
                className="rounded-2xl bg-gray-50 p-8 text-sm leading-6"
              >
                <blockquote className="text-gray-900">
                  <p>"{testimonial.body}"</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-x-4">
                  <Image
                    className="h-10 w-10 rounded-full bg-gray-50"
                    src={testimonial.author.imageUrl}
                    alt={testimonial.author.name}
                    width={40}
                    height={40}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author.name}</div>
                    <div className="text-gray-600">{testimonial.author.role}</div>
                  </div>
                </figcaption>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
