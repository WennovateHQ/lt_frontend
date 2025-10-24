'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/api/auth.service'
import { User, TalentProfile, BusinessProfile } from '@/lib/types/user'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, options?: LoginOptions) => Promise<{ success: boolean; user?: User; requiresEmailVerification?: boolean; message?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; requiresEmailVerification?: boolean; message?: string; user?: User }>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  refreshAuth: () => Promise<void>
  verifyEmail: (token: string) => Promise<{ success: boolean; user?: User; message?: string }>
  resendVerification: (email: string) => Promise<{ success: boolean; message?: string }>
}

interface LoginOptions {
  userType?: 'business' | 'talent' | 'admin'
  adminCode?: string
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: 'business' | 'talent' | 'BUSINESS' | 'TALENT'
  companyName?: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Auth check: Starting auth status check')
      
      // Check if localStorage is available
      if (typeof Storage === 'undefined') {
      }
      
      console.log('🔍 Auth check: Checking stored tokens...')
      const token = localStorage.getItem('token')
      const refreshToken = localStorage.getItem('refreshToken')
      
      // Check for stored tokens
      
      const response = await authService.checkAuth()
      console.log('✅ Auth check: Success', response.user)
      setUser(response.user || null)
      setLoading(false)
    } catch (error) {
      console.error('❌ Auth check failed:', error)
      console.log('🔍 Auth check: Clearing user state and invalid tokens')
      
      // Clear all potentially invalid tokens
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('token')
      localStorage.removeItem('localtalents_accessToken')
      localStorage.removeItem('localtalents_refreshToken')
      sessionStorage.removeItem('token')
      
      setUser(null)
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, options?: LoginOptions) => {
    try {
      // For admin login, include additional verification
      const loginData = {
        email,
        password,
        ...(options?.userType === 'admin' && {
          userType: 'admin',
          adminCode: options.adminCode
        })
      }

      const response = await authService.login(loginData)
      
      // Additional validation for admin users
      if (options?.userType === 'admin' && response.user.userType !== 'admin') {
        throw new Error('Invalid admin credentials')
      }
      
      // Store tokens with multiple storage mechanisms (same as registration)
      if (response.tokens) {
        try {
          console.log('💾 Login: Storing tokens in multiple storage locations...')
          
          // Store in localStorage
          localStorage.setItem('token', response.tokens.accessToken)
          localStorage.setItem('refreshToken', response.tokens.refreshToken)
          
          // Also store in sessionStorage as backup
          sessionStorage.setItem('token', response.tokens.accessToken)
          sessionStorage.setItem('refreshToken', response.tokens.refreshToken)
          
          // Store with prefixed keys to avoid conflicts
          localStorage.setItem('localtalents_token', response.tokens.accessToken)
          localStorage.setItem('localtalents_refresh', response.tokens.refreshToken)
          
          console.log('✅ Login: Tokens successfully stored')
        } catch (storageError) {
          console.error('❌ Login: Failed to store tokens:', storageError)
        }
      }
      
      setUser(response.user)
      return { success: true, user: response.user }
    } catch (error: any) {
      // Check if error is due to email not verified
      if (error.response?.status === 403 && error.response?.data?.requiresEmailVerification) {
        return { 
          success: false, 
          requiresEmailVerification: true,
          message: error.response.data.message || 'Please verify your email address before logging in.'
        }
      }
      
      return { 
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed'
      }
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      console.log('🔐 Auth context: register called with:', userData)
      
      // Convert userType to uppercase if needed
      const normalizedData = {
        ...userData,
        userType: userData.userType.toUpperCase() as 'BUSINESS' | 'TALENT'
      }
      
      console.log('🔄 Auth context: calling authService.register with:', normalizedData)
      const response = await authService.register(normalizedData)
      
      console.log('Auth service registration response:', response)
      
      // Check if email verification is required
      if (response.requiresEmailVerification) {
        console.log('📧 Registration requires email verification')
        // Don't store tokens, just return success with verification message
        return {
          success: true,
          requiresEmailVerification: true,
          message: response.message || 'Registration successful! Please check your email to verify your account.',
          user: response.user
        }
      }
      
      // Legacy flow - if tokens are provided (for immediate login)
      if (!response || !response.tokens || !response.tokens.accessToken) {
        throw new Error('Invalid registration response: missing tokens')
      }
      
      if (!response.user) {
        throw new Error('Invalid registration response: missing user data')
      }
      
      // Store tokens with multiple storage mechanisms for reliability
      try {
        console.log('💾 Storing tokens in multiple storage locations...')
        
        // Store in localStorage
        localStorage.setItem('token', response.tokens.accessToken)
        localStorage.setItem('refreshToken', response.tokens.refreshToken)
        
        // Also store in sessionStorage as backup
        sessionStorage.setItem('token', response.tokens.accessToken)
        sessionStorage.setItem('refreshToken', response.tokens.refreshToken)
        
        // Store with prefixed keys to avoid conflicts
        localStorage.setItem('localtalents_token', response.tokens.accessToken)
        localStorage.setItem('localtalents_refresh', response.tokens.refreshToken)
        
        // Immediately verify storage worked
        const storedToken = localStorage.getItem('token')
        const storedRefresh = localStorage.getItem('refreshToken')
        const backupToken = sessionStorage.getItem('token')
        const prefixedToken = localStorage.getItem('localtalents_token')
        
        console.log('🔍 Token storage verification:', {
          localStorage: storedToken ? 'SUCCESS' : 'FAILED',
          sessionStorage: backupToken ? 'SUCCESS' : 'FAILED',
          prefixed: prefixedToken ? 'SUCCESS' : 'FAILED'
        })
        
        if (!storedToken && !backupToken && !prefixedToken) {
          throw new Error('Failed to store tokens in any storage mechanism')
        }
        
        console.log('✅ Tokens successfully stored and verified')
      } catch (storageError) {
        console.error('❌ Failed to store tokens:', storageError)
        throw new Error('Failed to store authentication tokens')
      }
      
      console.log('✅ Auth context: Tokens stored, setting user:', response.user)
      
      // Verify tokens are actually stored
      const storedToken = localStorage.getItem('token')
      const storedRefreshToken = localStorage.getItem('refreshToken')
      console.log('🔍 Stored tokens verification:', { 
        accessToken: storedToken ? 'EXISTS' : 'MISSING',
        refreshToken: storedRefreshToken ? 'EXISTS' : 'MISSING'
      })
      
      setUser(response.user)
      
      console.log('✅ Auth context: User set successfully:', response.user)
      console.log('🔍 Auth context state after registration:', { user: response.user, hasTokens: !!storedToken })
      
      return {
        success: true,
        user: response.user,
        message: 'Registration successful!'
      }
    } catch (error: any) {
      console.error('Auth context registration error:', error)
      console.error('Auth error response:', error.response?.data)
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Registration failed'
      
      throw new Error(errorMessage)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Always clear local state and tokens
      console.log('🚪 Logout: Clearing all tokens and user state')
      
      // Clear all possible token storage locations
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('token')
      localStorage.removeItem('localtalents_accessToken')
      localStorage.removeItem('localtalents_refreshToken')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('refreshToken')
      
      setUser(null)
      console.log('✅ Logout: All tokens cleared, user state reset')
      
      // Redirect to login page
      console.log('🔄 Logout: Redirecting to login page')
      router.push('/login')
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
    }
  }

  const refreshAuth = async () => {
    try {
      const response = await authService.refreshTokens()
      
      // Update tokens
      if (response.tokens) {
        localStorage.setItem('token', response.tokens.accessToken)
        localStorage.setItem('refreshToken', response.tokens.refreshToken)
      }
      
      setUser(response.user)
    } catch (error) {
      console.error('Token refresh failed:', error)
      // If refresh fails, logout user
      await logout()
      throw error
    }
  }

  const verifyEmail = async (token: string) => {
    try {
      const response = await authService.verifyEmail(token)
      
      if (response.tokens) {
        // Store tokens after successful verification
        localStorage.setItem('token', response.tokens.accessToken)
        localStorage.setItem('refreshToken', response.tokens.refreshToken)
        localStorage.setItem('localtalents_token', response.tokens.accessToken)
        localStorage.setItem('localtalents_refresh', response.tokens.refreshToken)
        sessionStorage.setItem('token', response.tokens.accessToken)
        
        setUser(response.user)
      }
      
      return {
        success: true,
        user: response.user,
        message: response.message || 'Email verified successfully!'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Email verification failed'
      }
    }
  }

  const resendVerification = async (email: string) => {
    try {
      const response = await authService.resendVerification(email)
      return {
        success: true,
        message: response.message || 'Verification email sent successfully!'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to resend verification email'
      }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      refreshAuth,
      verifyEmail,
      resendVerification,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
