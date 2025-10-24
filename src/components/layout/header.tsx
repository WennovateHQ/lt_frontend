'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Bars3Icon, 
  XMarkIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'For Businesses', href: '/' },
  { name: 'For Talent', href: '/for-talent' },
  { name: 'How It Works', href: '/#how-it-works' },
  { name: 'Pricing', href: '/pricing' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
            <Image
              className="h-16 w-auto"
              src="/logo.png"
              alt="LocalTalents.ca"
              width={240}
              height={240}
            />
            {/*<span className="text-xl font-bold text-gray-900">LocalTalents</span>*/}
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-semibold leading-6 transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-gray-900"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <div className="flex gap-x-2">
            <Link href="/register?type=business">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                Post Project
              </Button>
            </Link>
            <Link href="/register?type=talent">
              <Button variant="success" size="sm">
                <UserIcon className="h-4 w-4 mr-1" />
                Find Work
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
                <Image
                  className="h-8 w-auto"
                  src="/logo.png"
                  alt="LocalTalents.ca"
                  width={32}
                  height={32}
                />
                <span className="text-xl font-bold text-gray-900">LocalTalents</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6 space-y-2">
                  <Link
                    href="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link href="/register?type=business" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full mb-2">
                      <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                      Post Project
                    </Button>
                  </Link>
                  <Link href="/register?type=talent" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="success" className="w-full">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Find Work
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
