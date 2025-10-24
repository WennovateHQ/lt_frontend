'use client'

import { Suspense } from 'react'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <RegisterFormContent />
    </Suspense>
  )
}

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/contexts/auth-context'
import { EyeIcon, EyeSlashIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  userType: z.enum(['business', 'talent']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

function RegisterFormContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { register: registerUser } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const userTypeParam = searchParams.get('type') as 'business' | 'talent' | null

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      userType: userTypeParam || 'business',
      firstName: '',
      lastName: '',
      companyName: '',
      phone: '',
    },
  })

  const watchUserType = form.watch('userType')

  useEffect(() => {
    if (userTypeParam) {
      form.setValue('userType', userTypeParam)
    }
  }, [userTypeParam, form])

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      const { confirmPassword, ...registerData } = data
      const result = await registerUser(registerData)

      if (result?.requiresEmailVerification) {
        setSuccess(result.message || 'Registration successful! Please check your email to verify your account.')
        localStorage.setItem('pendingVerificationEmail', registerData.email)
        setTimeout(() => {
          window.location.href = '/verify-email-sent'
        }, 3000)
        return
      }

      setSuccess('Registration successful! Redirecting to your dashboard...')
      setTimeout(() => {
        const targetUrl = registerData.userType === 'business' ? '/business' : '/talent'
        window.location.href = targetUrl
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed. Please try again.'
      setError(`Registration failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                watchUserType === 'business' ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-300'
              }`}>
                <input
                  {...form.register('userType')}
                  type="radio"
                  value="business"
                  className="sr-only"
                />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <BuildingOfficeIcon className="h-6 w-6 text-blue-600 mb-2" />
                    <span className="block text-sm font-medium text-gray-900">Hire talent</span>
                    <span className="block text-sm text-gray-500">Post projects and find specialists</span>
                  </span>
                </span>
              </label>

              <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                watchUserType === 'talent' ? 'border-green-600 ring-2 ring-green-600' : 'border-gray-300'
              }`}>
                <input
                  {...form.register('userType')}
                  type="radio"
                  value="talent"
                  className="sr-only"
                />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <UserIcon className="h-6 w-6 text-green-600 mb-2" />
                    <span className="block text-sm font-medium text-gray-900">Find work</span>
                    <span className="block text-sm text-gray-500">Apply to local projects</span>
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <div className="mt-1">
                <Input
                  {...form.register('firstName')}
                  placeholder="John"
                  className={form.formState.errors.firstName ? 'border-red-300' : ''}
                />
                {form.formState.errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last name
              </label>
              <div className="mt-1">
                <Input
                  {...form.register('lastName')}
                  placeholder="Doe"
                  className={form.formState.errors.lastName ? 'border-red-300' : ''}
                />
                {form.formState.errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {watchUserType === 'business' && (
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company name
              </label>
              <div className="mt-1">
                <Input
                  {...form.register('companyName')}
                  placeholder="Acme Inc."
                />
              </div>
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
                placeholder="john@example.com"
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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone number (optional)
            </label>
            <div className="mt-1">
              <Input
                {...form.register('phone')}
                type="tel"
                placeholder="+1 (555) 123-4567"
              />
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
                autoComplete="new-password"
                placeholder="Create a strong password"
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <div className="mt-1 relative">
              <Input
                {...form.register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm your password"
                className={form.formState.errors.confirmPassword ? 'border-red-300 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {form.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </label>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                watchUserType === 'business' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
              }`}
              size="lg"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
