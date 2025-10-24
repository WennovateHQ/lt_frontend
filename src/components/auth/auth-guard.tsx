'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'

interface AuthGuardProps {
  children: React.ReactNode
  requiredUserType?: 'business' | 'talent' | 'admin'
  fallbackPath?: string
}

export function AuthGuard({ 
  children, 
  requiredUserType, 
  fallbackPath = '/login' 
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // If no user is authenticated, redirect to login
      if (!user) {
        console.log('🔒 AuthGuard: No authenticated user, redirecting to login')
        router.push(fallbackPath)
        return
      }

      // If specific user type is required, check it (case-insensitive)
      if (requiredUserType && user.userType.toLowerCase() !== requiredUserType.toLowerCase()) {
        console.log(`🔒 AuthGuard: User type ${user.userType} not authorized for ${requiredUserType} pages`)
        
        // Redirect to appropriate dashboard based on user type
        const dashboardPath = user.userType.toLowerCase() === 'admin' ? '/admin' : 
                             user.userType.toLowerCase() === 'business' ? '/business' : '/talent'
        router.push(dashboardPath)
        return
      }

      console.log('✅ AuthGuard: User authorized', { 
        userType: user.userType, 
        requiredType: requiredUserType 
      })
    }
  }, [user, loading, requiredUserType, router, fallbackPath])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show loading state while redirecting
  if (!user || (requiredUserType && user.userType.toLowerCase() !== requiredUserType.toLowerCase())) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  // User is authenticated and authorized, render children
  return <>{children}</>
}
