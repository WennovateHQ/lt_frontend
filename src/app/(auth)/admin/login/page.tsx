'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/contexts/auth-context'

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  adminCode: z.string().min(6, 'Admin verification code is required')
})

type AdminLoginForm = z.infer<typeof adminLoginSchema>

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  const form = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
      adminCode: ''
    }
  })

  const onSubmit = async (data: AdminLoginForm) => {
    try {
      setIsLoading(true)
      setError(null)

      // Admin-specific login with additional verification
      const result = await login(data.email, data.password, {
        userType: 'admin',
        adminCode: data.adminCode
      })

      if (result.success && result.user?.userType === 'admin') {
        router.push('/admin')
      } else {
        setError('Invalid admin credentials or verification code')
      }
    } catch (err) {
      setError('Login failed. Please check your credentials and admin code.')
      console.error('Admin login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-600 p-4 rounded-full">
              <ShieldCheckIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Admin Portal</h2>
          <p className="mt-2 text-slate-300">
            Secure access to LocalTalents.ca administration
          </p>
        </div>

        {/* Security Notice */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800">Restricted Access</p>
                <p className="text-red-700 mt-1">
                  This portal is for authorized administrators only. All access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card className="bg-white shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Administrator Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Administrator Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@localtalents.ca"
                  className="h-12"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your secure password"
                    className="h-12 pr-12"
                    {...form.register('password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Admin Verification Code */}
              <div>
                <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Verification Code
                </label>
                <div className="relative">
                  <Input
                    id="adminCode"
                    type="password"
                    placeholder="Enter 6-digit admin code"
                    className="h-12 pl-12"
                    maxLength={6}
                    {...form.register('adminCode')}
                  />
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {form.formState.errors.adminCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.adminCode.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Contact system administrator if you don't have the verification code
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>Access Admin Portal</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Additional Security Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Having trouble accessing the admin portal?
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Contact IT Support: <span className="font-medium">support@localtalents.ca</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <Link 
            href="/login" 
            className="text-slate-300 hover:text-white text-sm transition-colors"
          >
            ← Back to Regular Login
          </Link>
          <div className="text-xs text-slate-400">
            © 2025 LocalTalents.ca - Secure Admin Access
          </div>
        </div>
      </div>
    </div>
  )
}
