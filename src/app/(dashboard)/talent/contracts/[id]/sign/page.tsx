'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { apiClient } from '@/lib/api/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ContractSigningPage() {
  return (
    <AuthGuard requiredUserType="talent">
      <ContractSigningContent />
    </AuthGuard>
  )
}

function ContractSigningContent() {
  const params = useParams()
  const router = useRouter()
  const [contract, setContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigning, setIsSigning] = useState(false)
  const [agreementConfirmed, setAgreementConfirmed] = useState(false)
  const [signature, setSignature] = useState('')
  const [addressRequired, setAddressRequired] = useState(false)
  const [address, setAddress] = useState({
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Canada'
  })
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching contract for signing:', params.id)
        
        const contractData = await apiClient.get(`/contracts/${params.id}`) as any
        console.log('Contract data loaded:', contractData)
        console.log('Contract title:', contractData.title)
        console.log('Contract description:', contractData.description)
        console.log('Contract terms:', contractData.terms)
        console.log('Project title:', contractData.project?.title)
        console.log('Project description:', contractData.project?.description)
        
        setContract(contractData)
        
        // Fetch user profile to check address
        const profileData = await apiClient.get('/users/profile') as any
        setUserProfile(profileData)
        
        // Check if address is complete
        const location = profileData.location
        if (!location || !location.street || !location.city || !location.province || !location.postalCode) {
          setAddressRequired(true)
          // Pre-fill with existing data if available
          if (location) {
            setAddress({
              street: location.street || '',
              city: location.city || '',
              province: location.province || '',
              postalCode: location.postalCode || '',
              country: location.country || 'Canada'
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch contract:', error)
        alert('Failed to load contract. Please try again.')
        router.push('/talent/contracts')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchContract()
    }
  }, [params.id, router])

  const handleSignContract = async () => {
    if (!agreementConfirmed) {
      alert('Please confirm that you agree to the contract terms.')
      return
    }

    if (!signature.trim()) {
      alert('Please provide your digital signature.')
      return
    }

    // Validate address if required
    if (addressRequired) {
      if (!address.street.trim() || !address.city.trim() || !address.province.trim() || !address.postalCode.trim()) {
        alert('Please complete your address information before signing the contract.')
        return
      }
    }

    try {
      setIsSigning(true)
      
      // Save address if required
      if (addressRequired) {
        console.log('Saving address before signing contract...', {
          street: address.street,
          city: address.city,
          province: address.province,
          country: address.country,
          postalCode: address.postalCode
        })
        await apiClient.put('/users/location', {
          street: address.street,
          city: address.city,
          province: address.province,
          country: address.country,
          postalCode: address.postalCode
        })
        console.log('Address saved successfully')
      }
      
      const response = await apiClient.post(`/contracts/${contract.id}/sign`, {
        signature: signature.trim(),
        agreementConfirmed: true,
        ipAddress: window.location.hostname
      })

      console.log('Contract signed successfully:', response)
      
      alert('Contract signed successfully!')
      
      // Navigate back to the contract detail page
      router.push(`/talent/contracts/${contract.id}`)
      
    } catch (error: any) {
      console.error('Failed to sign contract:', error)
      
      // Handle specific error cases
      if (error.response?.data?.requiresAddress) {
        alert('Please complete your address information in your profile before signing.')
        return
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to sign contract. Please try again.'
      alert(errorMessage)
    } finally {
      setIsSigning(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading contract...</div>
  }

  if (!contract) {
    return <div className="text-center py-8">Contract not found</div>
  }

  // Check if contract is already signed by talent
  if (contract.talentSignedAt) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href={`/talent/contracts/${contract.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Contract
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contract Already Signed</h1>
            <p className="text-gray-600">This contract has already been signed.</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Signed</h3>
              <p className="text-gray-600 mb-4">
                You signed this contract on {formatDate(contract.talentSignedAt)}
              </p>
              <Link href={`/talent/contracts/${contract.id}`}>
                <Button>View Contract Details</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/talent/contracts/${contract.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Contract
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sign Contract</h1>
          <p className="text-gray-600">
            {contract.title || contract.project?.title || 'Contract Details'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Contract Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contract Title and Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Contract: {contract.title || contract.project?.title}
                </h3>
                {contract.project?.title && contract.title !== contract.project.title && (
                  <p className="text-sm text-gray-500 mb-2">Project: {contract.project.title}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {contract.hourlyRate && (
                    <>
                      <div>
                        <span className="text-gray-500">Hourly Rate:</span>
                        <span className="font-medium ml-2">${contract.hourlyRate}/hr</span>
                      </div>
                      {(contract.estimatedHours || contract.application?.estimatedHours) && (
                        <div>
                          <span className="text-gray-500">Estimated Hours:</span>
                          <span className="font-medium ml-2">{contract.estimatedHours || contract.application?.estimatedHours} hours</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Estimated Total:</span>
                        <span className="font-medium ml-2">
                          {(() => {
                            const estimatedHrs = contract.estimatedHours || contract.application?.estimatedHours
                            return estimatedHrs 
                              ? formatCurrency(Number(contract.hourlyRate) * Number(estimatedHrs))
                              : formatCurrency(contract.totalAmount)
                          })()}
                        </span>
                      </div>
                    </>
                  )}
                  {!contract.hourlyRate && (
                    <div>
                      <span className="text-gray-500">Total Amount:</span>
                      <span className="font-medium ml-2">{formatCurrency(contract.totalAmount)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Start Date:</span>
                    <span className="font-medium ml-2">{formatDate(contract.startDate)}</span>
                  </div>
                  {contract.endDate && (
                    <div>
                      <span className="text-gray-500">End Date:</span>
                      <span className="font-medium ml-2">{formatDate(contract.endDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contract Description - from contract table, not project */}
              {contract.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contract Description</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.description}</p>
                </div>
              )}

              {/* Project Description - separate from contract description */}
              {contract.project?.description && contract.project.description !== contract.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Project Background</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{contract.project.description}</p>
                </div>
              )}

              {/* Contract Terms - specific to this contract */}
              {contract.terms && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.terms}</p>
                </div>
              )}

              {/* Milestones if available */}
              {contract.milestones && contract.milestones.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Project Milestones</h4>
                  <div className="space-y-2">
                    {contract.milestones.map((milestone: any, index: number) => (
                      <div key={milestone.id} className="border-l-2 border-blue-200 pl-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {index + 1}. {milestone.title}
                            </p>
                            {milestone.description && (
                              <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {formatCurrency(milestone.amount)}
                          </span>
                        </div>
                        {milestone.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {formatDate(milestone.dueDate)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Section - Required before signing */}
          {addressRequired && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-500" />
                  Address Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Address Required:</strong> You must provide your complete address before signing this contract. 
                    This information is required for legal and tax purposes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
                      placeholder="123 Main Street"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Toronto"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <select
                      value={address.province}
                      onChange={(e) => setAddress(prev => ({ ...prev, province: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Province</option>
                      <option value="AB">Alberta</option>
                      <option value="BC">British Columbia</option>
                      <option value="MB">Manitoba</option>
                      <option value="NB">New Brunswick</option>
                      <option value="NL">Newfoundland and Labrador</option>
                      <option value="NS">Nova Scotia</option>
                      <option value="ON">Ontario</option>
                      <option value="PE">Prince Edward Island</option>
                      <option value="QC">Quebec</option>
                      <option value="SK">Saskatchewan</option>
                      <option value="NT">Northwest Territories</option>
                      <option value="NU">Nunavut</option>
                      <option value="YT">Yukon</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={address.postalCode}
                      onChange={(e) => setAddress(prev => ({ ...prev, postalCode: e.target.value.toUpperCase() }))}
                      placeholder="M5V 3A8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      pattern="[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={address.country}
                      onChange={(e) => setAddress(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      disabled
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  * Required fields. This address will be saved to your profile and used for contract purposes.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Signature Section */}
          <Card>
            <CardHeader>
              <CardTitle>Digital Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Digital Signature
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Type your full name as your digital signature"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  By typing your name, you are providing a legally binding digital signature.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreement"
                  checked={agreementConfirmed}
                  onCheckedChange={(checked) => setAgreementConfirmed(checked === true)}
                />
                <label htmlFor="agreement" className="text-sm text-gray-700">
                  I have read and agree to the terms and conditions of this contract. 
                  I understand that this digital signature is legally binding and equivalent to a handwritten signature.
                </label>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleSignContract}
                  disabled={
                    !agreementConfirmed || 
                    !signature.trim() || 
                    isSigning ||
                    (addressRequired && (!address.street.trim() || !address.city.trim() || !address.province.trim() || !address.postalCode.trim()))
                  }
                  className="flex-1"
                >
                  {isSigning ? 'Signing...' : 'Sign Contract'}
                </Button>
                <Link href={`/talent/contracts/${contract.id}`}>
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Signing Status */}
          <Card>
            <CardHeader>
              <CardTitle>Signing Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Business</span>
                  {contract.businessSignedAt ? (
                    <span className="text-sm text-green-600 flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Signed
                    </span>
                  ) : (
                    <span className="text-sm text-yellow-600">Pending</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Talent (You)</span>
                  <span className="text-sm text-yellow-600">Pending Signature</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Important</p>
                    <p>Please review all contract terms carefully before signing. This signature is legally binding.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          {contract.business?.profile && (
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {contract.business.profile.companyName || 'Client'}
                  </h4>
                  {contract.business.profile.industry && (
                    <p className="text-sm text-gray-600">{contract.business.profile.industry}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
