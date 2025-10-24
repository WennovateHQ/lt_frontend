'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/contexts/auth-context'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | React.ReactNode>('')
  const [success, setSuccess] = useState('')
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError('')
      setSuccess('')
      
      console.log('🚀 Starting login...')
      const result = await login(data.email, data.password)
      
      if (!result.success) {
        // Check if it's an email verification issue
        if (result.requiresEmailVerification) {
          setError(
            <div>
              <p>{result.message}</p>
              <p className="mt-2 text-sm">
                <a 
                  href="/verify-email-sent" 
                  className="font-medium text-blue-600 hover:text-blue-500"
                  onClick={() => localStorage.setItem('pendingVerificationEmail', data.email)}
                >
                  Resend verification email
                </a>
              </p>
            </div>
          )
        } else {
          setError(result.message || 'Invalid email or password')
        }
        return
      }
      
      console.log('✅ Login successful! Redirecting...')
      setSuccess('Login successful! Redirecting to your dashboard...')
      
      // Wait for auth state to be fully set, then redirect based on user type
      setTimeout(() => {
        try {
          // Convert userType to lowercase for routing
          const userType = result.user?.userType?.toLowerCase()
          const targetUrl = userType === 'business' ? '/business' : 
                           userType === 'admin' ? '/admin' : '/talent'
          console.log(`User type: ${result.user?.userType}, redirecting to ${targetUrl}`)
          
          // Use window.location for more reliable redirect
          window.location.href = targetUrl
        } catch (redirectError) {
          console.error('Redirect error:', redirectError)
          // Fallback: redirect to home page
          console.log('Fallback: redirecting to home')
          window.location.href = '/'
        }
      }, 2000)
      
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up for free
          </Link>
        </p>
      </div>

      {/* Demo Credentials 
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white rounded p-2">
            <p className="font-medium text-gray-700">Business Account</p>
            <p className="text-gray-600">business@demo.com</p>
            <p className="text-gray-600">demo123</p>
          </div>
          <div className="bg-white rounded p-2">
            <p className="font-medium text-gray-700">Talent Account</p>
            <p className="text-gray-600">talent@demo.com</p>
            <p className="text-gray-600">demo123</p>
          </div>
        </div>
      </div>*/}

      <div className="mt-8">
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <Input
                {...form.register('email')}
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className={form.formState.errors.email ? 'border-red-300' : ''}
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <Input
                {...form.register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                className={form.formState.errors.password ? 'border-red-300 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to LocalTalents?</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <Link href="/register?type=business">
              <Button variant="outline" className="w-full" size="lg">
                Sign up as Business
              </Button>
            </Link>
            <Link href="/register?type=talent">
              <Button variant="outline" className="w-full" size="lg">
                Sign up as Talent
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
