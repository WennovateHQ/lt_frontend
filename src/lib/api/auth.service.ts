import { apiClient } from './client'

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: 'BUSINESS' | 'TALENT'
  companyName?: string
  phone?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    userType: 'business' | 'talent' | 'admin'
    emailVerified: boolean
    companyName?: string
    phone?: string
    createdAt: string
    updatedAt: string
  }
  tokens?: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
  message?: string
  requiresEmailVerification?: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface VerifyEmailRequest {
  token: string
}

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data)
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', data)
  }

  async logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout')
  }

  async refreshTokens(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh')
  }

  async getProfile(): Promise<AuthResponse['user']> {
    return apiClient.get<AuthResponse['user']>('/auth/profile')
  }

  async checkAuth(): Promise<{ authenticated: boolean; user?: AuthResponse['user'] }> {
    return apiClient.get<{ authenticated: boolean; user?: AuthResponse['user'] }>('/auth/check')
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return apiClient.post<void>('/auth/change-password', data)
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', data)
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', data)
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/verify-email', { token })
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/resend-verification', { email })
  }

  async deleteAccount(): Promise<void> {
    return apiClient.delete<void>('/auth/account')
  }
}

export const authService = new AuthService()
