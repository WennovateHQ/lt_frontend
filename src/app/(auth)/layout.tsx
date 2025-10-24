import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-12 xl:px-24 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="mx-auto max-w-md">
          <Link href="/" className="flex items-center space-x-3 mb-8">
            <Image
              className="h-16 w-auto"
              src="/logo-1.png"
              alt="LocalTalents.ca"
              width={240}
              height={240}
            />
            {/*<span className="text-2xl font-bold text-white">LocalTalents</span>*/}
          </Link>
          <h1 className="text-3xl font-bold text-white mb-6">
            Connect with Local Specialized Talent
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Join thousands of Canadian businesses and specialists who are building better projects together.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-blue-100">Verified local specialists</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-blue-100">Secure milestone payments</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-blue-100">48-hour matching guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                className="h-8 w-auto"
                src="/logo.png"
                alt="LocalTalents.ca"
                width={32}
                height={32}
              />
              <span className="text-xl font-bold text-gray-900">LocalTalents</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
