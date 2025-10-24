'use client'

import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'

export function TalentHeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <a href="#" className="inline-flex space-x-6">
              <span className="rounded-full bg-green-600/10 px-3 py-1 text-sm font-semibold leading-6 text-green-600 ring-1 ring-inset ring-green-600/10">
                Join Local Talent Network
              </span>
            </a>
          </div>
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Build Your{' '}
            <span className="text-green-600">Local Career</span>{' '}
            as a Specialist
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Get paid fairly for your expertise. Work with local businesses who value in-person collaboration. 
            No more competing with global pricing - your local knowledge matters here.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link href="/register?type=talent">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Start Earning Today
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="ghost" size="lg">
                See how it works <span aria-hidden="true">→</span>
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-x-6 text-sm text-gray-600">
            <div className="flex items-center gap-x-2">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Premium local rates
            </div>
            <div className="flex items-center gap-x-2">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure payments
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
              alt="Professional developer working on laptop in modern office"
              width={2071}
              height={1380}
              className="w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
