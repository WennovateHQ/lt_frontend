'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  UserIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  FolderIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'

const businessNavigation = [
  { name: 'Dashboard', href: '/business', icon: HomeIcon },
  { name: 'Projects', href: '/business/projects', icon: BriefcaseIcon },
  { name: 'Applications', href: '/business/applications', icon: DocumentTextIcon },
  { name: 'Messages', href: '/business/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Contracts', href: '/business/contracts', icon: DocumentTextIcon },
  { name: 'Payments', href: '/business/payments', icon: CreditCardIcon },
  // Hidden: Files, Find Talent, Disputes, Verification
  // { name: 'Files', href: '/business/files', icon: FolderIcon },
  // { name: 'Find Talent', href: '/business/talent', icon: UserIcon },
  // { name: 'Disputes', href: '/business/disputes', icon: ExclamationTriangleIcon },
  // { name: 'Verification', href: '/business/verification', icon: ShieldCheckIcon },
]

const talentNavigation = [
  { name: 'Dashboard', href: '/talent', icon: HomeIcon },
  { name: 'Opportunities', href: '/talent/opportunities', icon: BriefcaseIcon },
  { name: 'Applications', href: '/talent/applications', icon: DocumentTextIcon },
  { name: 'Messages', href: '/talent/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Contracts', href: '/talent/contracts', icon: DocumentTextIcon },
  { name: 'Payments', href: '/talent/payments', icon: CreditCardIcon },
  { name: 'Profile', href: '/talent/profile', icon: UserIcon },
  // Hidden: Files, Disputes, Verification
  // { name: 'Files', href: '/talent/files', icon: FolderIcon },
  // { name: 'Disputes', href: '/talent/disputes', icon: ExclamationTriangleIcon },
  // { name: 'Verification', href: '/talent/verification', icon: ShieldCheckIcon },
]

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UserIcon },
  { name: 'Projects', href: '/admin/projects', icon: BriefcaseIcon },
  { name: 'Escrow', href: '/admin/escrow', icon: ShieldCheckIcon },
  { name: 'Disputes', href: '/admin/disputes', icon: ExclamationTriangleIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Payments', href: '/admin/payments', icon: CreditCardIcon },
  { name: 'Files', href: '/admin/files', icon: FolderIcon },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null
  }

  // Convert userType to lowercase for navigation comparison
  const userType = user?.userType?.toLowerCase()
  const navigation = userType === 'business' 
    ? businessNavigation 
    : userType === 'admin' 
    ? adminNavigation 
    : talentNavigation

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                <div className="flex h-16 shrink-0 items-center">
                  <Link href="/" className="flex items-center space-x-2">
                    <Image
                      className="h-16 w-auto"
                      src="/logo.png"
                      alt="LocalTalents.ca"
                      width={240}
                      height={240}
                    />
                   {/* <span className="text-xl font-bold text-gray-900">LocalTalents</span> */}
                  </Link>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className={cn(
                                pathname === item.href
                                  ? 'bg-gray-50 text-blue-600'
                                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                              )}
                            >
                              <item.icon className="h-6 w-6 shrink-0" />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/" className="flex items-center space-x-2">
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
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          pathname === item.href
                            ? 'bg-gray-50 text-blue-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="-mx-6 mt-auto">
                <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                  {user?.profile?.avatar ? (
                    <Image
                      src={user.profile.avatar}
                      alt={`${user.profile.firstName} ${user.profile.lastName}`}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">{user?.profile?.firstName} {user?.profile?.lastName}</span>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Search would go here */}
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
              {/* Notification Dropdown */}
              <NotificationDropdown />

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

              {/* Sign Out Button with Door Icon */}
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Sign out"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
