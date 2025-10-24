'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ShieldCheckIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { verificationService } from '@/lib/api/verification.service'
import { useAuth } from '@/lib/contexts/auth-context'

export function VerificationCenter() {
  const { user } = useAuth()
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [emailCode, setEmailCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [processing, setProcessing] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadVerificationOverview()
  }, [])

  const loadVerificationOverview = async () => {
    try {
      const data = await verificationService.getVerificationOverview()
      setOverview(data)
    } catch (error) {
      console.error('Failed to load verification overview:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailVerification = async () => {
    setProcessing(prev => ({ ...prev, email: true }))
    try {
      if (overview?.email?.status === 'pending' && emailCode) {
        await verificationService.verifyEmail(emailCode)
      } else {
        await verificationService.sendEmailVerification()
      }
      await loadVerificationOverview()
      setEmailCode('')
    } catch (error) {
      console.error('Email verification failed:', error)
    } finally {
      setProcessing(prev => ({ ...prev, email: false }))
    }
  }

  const handlePhoneVerification = async () => {
    setProcessing(prev => ({ ...prev, phone: true }))
    try {
      if (overview?.phone?.status === 'pending' && phoneCode) {
        await verificationService.verifyPhone(phoneCode)
      } else if (phoneNumber) {
        await verificationService.sendPhoneVerification(phoneNumber, '+1')
      }
      await loadVerificationOverview()
      setPhoneCode('')
    } catch (error) {
      console.error('Phone verification failed:', error)
    } finally {
      setProcessing(prev => ({ ...prev, phone: false }))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'pending': return <ClockIcon className="w-5 h-5 text-yellow-600" />
      case 'rejected': return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
      default: return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6" />
          Verification Center
        </h1>
        <p className="text-gray-600">Complete your profile verification to build trust and unlock all features</p>
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Verification Progress</span>
            <Badge className={getStatusColor(overview?.overallStatus || 'unverified')}>
              {(overview?.overallStatus || 'unverified').replace('_', ' ')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Completion</span>
                <span>{overview?.completionPercentage || 0}%</span>
              </div>
              <Progress value={overview?.completionPercentage || 0} className="h-3" />
            </div>

            {(overview?.nextSteps?.length || 0) > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                <div className="space-y-2">
                  {(overview?.nextSteps || []).map((step: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <div className={`w-2 h-2 rounded-full ${
                        step.priority === 'high' ? 'bg-red-500' : 
                        step.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm text-blue-900">{step.title}</p>
                        <p className="text-sm text-blue-700">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Tabs */}
      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <EnvelopeIcon className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="phone" className="flex items-center gap-2">
            <DevicePhoneMobileIcon className="w-4 h-4" />
            Phone
          </TabsTrigger>
          <TabsTrigger value="identity" className="flex items-center gap-2">
            <IdentificationIcon className="w-4 h-4" />
            Identity
          </TabsTrigger>
          {user?.userType === 'business' && (
            <TabsTrigger value="business" className="flex items-center gap-2">
              <BuildingOfficeIcon className="w-4 h-4" />
              Business
            </TabsTrigger>
          )}
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <AcademicCapIcon className="w-4 h-4" />
            Skills
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <EnvelopeIcon className="w-5 h-5" />
                  Email Verification
                </span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(overview?.email?.status || 'pending')}
                  <Badge className={getStatusColor(overview?.email?.status || 'pending')}>
                    {overview?.email?.status || 'pending'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overview?.email?.status === 'verified' ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Email Verified!</h3>
                  <p className="text-gray-600">Your email address {overview?.email?.email} has been verified.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 mb-4">
                      We need to verify your email address: <strong>{overview?.email?.email}</strong>
                    </p>
                    
                    {overview?.email?.status === 'pending' ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          Enter the verification code sent to your email:
                        </p>
                        <div className="flex gap-2">
                          <Input
                            value={emailCode}
                            onChange={(e) => setEmailCode(e.target.value)}
                            placeholder="Enter verification code"
                            className="flex-1"
                          />
                          <Button 
                            onClick={handleEmailVerification}
                            disabled={processing.email || !emailCode}
                          >
                            {processing.email ? 'Verifying...' : 'Verify'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={handleEmailVerification}
                        disabled={processing.email}
                      >
                        {processing.email ? 'Sending...' : 'Send Verification Email'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phone">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <DevicePhoneMobileIcon className="w-5 h-5" />
                  Phone Verification
                </span>
                <div className="flex items-center gap-2">
                  {overview?.phone && getStatusIcon(overview?.phone?.status || 'pending')}
                  <Badge className={getStatusColor(overview?.phone?.status || 'pending')}>
                    {overview?.phone?.status || 'not started'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overview?.phone?.status === 'verified' ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Phone Verified!</h3>
                  <p className="text-gray-600">Your phone number has been verified.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {overview?.phone?.status === 'pending' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Enter the verification code sent to your phone:
                      </p>
                      <div className="flex gap-2">
                        <Input
                          value={phoneCode}
                          onChange={(e) => setPhoneCode(e.target.value)}
                          placeholder="Enter verification code"
                          className="flex-1"
                        />
                        <Button 
                          onClick={handlePhoneVerification}
                          disabled={processing.phone || !phoneCode}
                        >
                          {processing.phone ? 'Verifying...' : 'Verify'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-700">
                        Add and verify your phone number for enhanced security:
                      </p>
                      <div className="flex gap-2">
                        <Input
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter phone number"
                          className="flex-1"
                        />
                        <Button 
                          onClick={handlePhoneVerification}
                          disabled={processing.phone || !phoneNumber}
                        >
                          {processing.phone ? 'Sending...' : 'Send Code'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <IdentificationIcon className="w-5 h-5" />
                  Identity Verification
                </span>
                <div className="flex items-center gap-2">
                  {overview?.identity && getStatusIcon(overview?.identity?.status || 'pending')}
                  <Badge className={getStatusColor(overview?.identity?.status || 'pending')}>
                    {overview?.identity?.status || 'not started'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overview?.identity?.status === 'verified' ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Identity Verified!</h3>
                  <p className="text-gray-600">Your identity has been successfully verified.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Required Documents</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Government-issued photo ID (passport, driver's license, or national ID)</li>
                      <li>• Proof of address (utility bill or bank statement, less than 3 months old)</li>
                    </ul>
                  </div>
                  
                  <Button className="w-full">
                    Start Identity Verification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {user?.userType === 'business' && (
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BuildingOfficeIcon className="w-5 h-5" />
                    Business Verification
                  </span>
                  <div className="flex items-center gap-2">
                    {overview?.business && getStatusIcon(overview?.business?.status || 'pending')}
                    <Badge className={getStatusColor(overview?.business?.status || 'pending')}>
                      {overview?.business?.status || 'not started'}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {overview?.business?.status === 'verified' ? (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Business Verified!</h3>
                    <p className="text-gray-600">
                      Your business {overview?.business?.businessName} has been verified.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Required Information</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Business registration certificate</li>
                        <li>• Tax identification number</li>
                        <li>• Proof of business address</li>
                        <li>• Articles of incorporation (if applicable)</li>
                      </ul>
                    </div>
                    
                    <Button className="w-full">
                      Start Business Verification
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AcademicCapIcon className="w-5 h-5" />
                Skill Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(overview?.skills?.length || 0) === 0 ? (
                <div className="text-center py-8">
                  <AcademicCapIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Skills Verified</h3>
                  <p className="text-gray-600 mb-4">
                    Verify your skills to stand out to potential clients and increase your credibility.
                  </p>
                  <Button>
                    Add Skills for Verification
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(overview?.skills || []).map((skill: any) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <AcademicCapIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{skill.skillName}</p>
                          <p className="text-sm text-gray-600">
                            {skill.proficiencyLevel} • {skill.verificationMethod}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(skill.status)}
                        <Badge className={getStatusColor(skill.status)}>
                          {skill.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    Add More Skills
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
