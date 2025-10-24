import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'

export function CTASection() {
  return (
    <section className="bg-blue-600">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to find your local talent?
            <br />
            Start your project today.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-200">
            Join thousands of Canadian businesses and talent who are building better projects together.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register?type=business">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                Post Your Project
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register?type=talent">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                Find Work
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
