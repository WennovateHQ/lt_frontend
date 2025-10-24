'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api/client'

interface HealthCheck {
  timestamp: string
  status: string
  version: string
  environment: string
  checks: {
    database: string
    redis: string
    memory: string
  }
}

export default function TestBackendPage() {
  const [healthStatus, setHealthStatus] = useState<HealthCheck | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Test basic connection to backend
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000')
      const data = await response.json()
      console.log('Backend root response:', data)
      
      // Test health endpoint
      const healthResponse = await fetch((process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000') + '/health')
      const healthData = await healthResponse.json()
      setHealthStatus(healthData)
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend')
      console.error('Backend connection test failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const testAuthEndpoint = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.get('/auth/check')
      console.log('Auth check response:', response)
    } catch (err: any) {
      console.log('Auth check failed (expected):', err.response?.status)
      if (err.response?.status === 401) {
        setError('Auth endpoint working (401 expected for unauthenticated request)')
      } else {
        setError(err.message || 'Auth endpoint test failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Backend Connection Test</h1>
        <p className="text-gray-600">Test the connection between frontend and backend</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Backend URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}
              </p>
              <Button onClick={testConnection} disabled={loading} className="w-full">
                {loading ? 'Testing...' : 'Test Backend Connection'}
              </Button>
            </div>
            
            <div>
              <Button onClick={testAuthEndpoint} disabled={loading} variant="outline" className="w-full">
                {loading ? 'Testing...' : 'Test Auth Endpoint'}
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            {healthStatus ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={healthStatus.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {healthStatus.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Environment:</span>
                  <span className="text-sm">{healthStatus.environment}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Version:</span>
                  <span className="text-sm">{healthStatus.version}</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">System Checks:</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Database:</span>
                      <Badge variant="outline" className={`text-xs ${
                        healthStatus.checks.database === 'healthy' ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'
                      }`}>
                        {healthStatus.checks.database}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Redis:</span>
                      <Badge variant="outline" className={`text-xs ${
                        healthStatus.checks.redis === 'healthy' ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'
                      }`}>
                        {healthStatus.checks.redis}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Memory:</span>
                      <Badge variant="outline" className={`text-xs ${
                        healthStatus.checks.memory === 'healthy' ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'
                      }`}>
                        {healthStatus.checks.memory}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Last checked: {new Date(healthStatus.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Click "Test Backend Connection" to check health status</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Client Configuration</span>
              <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Authentication Service</span>
              <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Projects Service</span>
              <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Users Service</span>
              <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Token Refresh Handling</span>
              <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
