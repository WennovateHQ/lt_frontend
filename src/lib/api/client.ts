import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      // Don't set default Content-Type - let Axios handle it automatically
      // This allows FormData to set multipart/form-data with boundary
      withCredentials: true, // Enable cookies for authentication
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        // Try multiple storage locations for token (matching auth system storage keys)
        let token = localStorage.getItem('token') ||
                   sessionStorage.getItem('token') || 
                   localStorage.getItem('localtalents_token') ||
                   localStorage.getItem('accessToken') ||
                   localStorage.getItem('localtalents_accessToken')
        
        console.log('🔍 API Client: Request interceptor', { 
          url: config.url, 
          hasToken: !!token
        })
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('✅ API Client: Added Authorization header')
        } else {
          console.log('❌ API Client: No token found in any storage location')
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // Try to refresh the token
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
              const response = await axios.post(`${this.client.defaults.baseURL}/auth/refresh`, {
                refreshToken
              })
              
              const { accessToken } = response.data.tokens
              localStorage.setItem('token', accessToken)
              
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            
            // Only redirect if we're on a protected route
            const currentPath = window.location.pathname
            const isProtectedRoute = currentPath.startsWith('/business') || 
                                   currentPath.startsWith('/talent') || 
                                   currentPath.startsWith('/admin')
            
            if (isProtectedRoute) {
              window.location.href = '/login'
            }
            return Promise.reject(refreshError)
          }
        }

        if (error.response?.status === 401) {
          // Only redirect to login if we're on a protected route
          const currentPath = window.location.pathname
          const isProtectedRoute = currentPath.startsWith('/business') || 
                                 currentPath.startsWith('/talent') || 
                                 currentPath.startsWith('/admin')
          
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          
          // Only redirect if we're on a protected route
          if (isProtectedRoute) {
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config)
    return response.data
  }

  async getBlob(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.client.get(url, {
      ...config,
      responseType: 'blob'
    })
    return response.data
  }
}

export const apiClient = new ApiClient()
