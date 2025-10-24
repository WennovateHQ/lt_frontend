'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'

interface BankingTabProps {
  profile: any
  onUpdate?: () => void
}

export function BankingTab({ profile, onUpdate }: BankingTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [bankingInfo, setBankingInfo] = useState({
    sin: '',
    bankInstitution: '',
    bankTransit: '',
    bankAccount: '',
    bankAccountHolder: '',
    gstHstNumber: ''
  })
  const [bankingStatus, setBankingStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBankingInfo()
  }, [])

  const loadBankingInfo = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/users/profile/banking') as any
      setBankingStatus(response)
      
      // Pre-fill account holder name from profile
      setBankingInfo(prev => ({
        ...prev,
        bankAccountHolder: response.bankAccountHolder || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
      }))
    } catch (error) {
      console.error('Error loading banking info:', error)
      toast.error('Failed to load banking information')
    } finally {
      setIsLoading(false)
    }
  }

  const formatSIN = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Format as XXX-XXX-XXX
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}`
  }

  const handleSINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSIN(e.target.value)
    setBankingInfo(prev => ({ ...prev, sin: formatted }))
  }

  const validateForm = () => {
    const errors: string[] = []
    
    if (bankingInfo.sin && !/^\d{3}-\d{3}-\d{3}$/.test(bankingInfo.sin)) {
      errors.push('SIN must be in format XXX-XXX-XXX')
    }
    
    if (bankingInfo.bankInstitution && bankingInfo.bankInstitution.length !== 3) {
      errors.push('Bank Institution must be 3 digits')
    }
    
    if (bankingInfo.bankTransit && bankingInfo.bankTransit.length !== 5) {
      errors.push('Bank Transit must be 5 digits')
    }
    
    if (bankingInfo.bankAccount && (bankingInfo.bankAccount.length < 7 || bankingInfo.bankAccount.length > 12)) {
      errors.push('Bank Account must be 7-12 digits')
    }
    
    if (!bankingInfo.bankAccountHolder) {
      errors.push('Account holder name is required')
    }
    
    return errors
  }

  const handleSave = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return
    }
    
    try {
      setIsSaving(true)
      await apiClient.put('/users/profile/banking', bankingInfo)
      toast.success('Banking information updated successfully')
      setIsEditing(false)
      await loadBankingInfo()
      onUpdate?.()
    } catch (error) {
      console.error('Error saving banking info:', error)
      toast.error('Failed to save banking information')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Alert>
        <ShieldCheckIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Your information is secure.</strong> All sensitive data is encrypted and stored securely. 
          We use bank-level security to protect your information.
        </AlertDescription>
      </Alert>

      {/* Banking Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BanknotesIcon className="h-5 w-5" />
                Banking Information
              </CardTitle>
              <CardDescription>
                Required to receive payments from completed milestones
              </CardDescription>
            </div>
            {bankingStatus?.hasBankingInfo && (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bankingStatus?.hasBankingInfo && !isEditing ? (
            // Display Mode
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span className="font-medium">Banking information on file</span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• Account holder: {bankingStatus.bankAccountHolder}</p>
                  <p>• Account ending in: ****{bankingStatus.lastFourDigits}</p>
                  <p>• SIN: {bankingStatus.hasSin ? 'On file' : 'Not provided'}</p>
                  <p>• GST/HST: {bankingStatus.hasGstHst ? 'Registered' : 'Not registered'}</p>
                </div>
              </div>
              
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="w-full"
              >
                Update Banking Information
              </Button>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              <Alert>
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  You must provide banking information to receive payments from completed projects.
                </AlertDescription>
              </Alert>

              {/* SIN */}
              <div>
                <Label htmlFor="sin">
                  Social Insurance Number (SIN) *
                  <LockClosedIcon className="inline h-3 w-3 ml-1" />
                </Label>
                <Input
                  id="sin"
                  type="text"
                  value={bankingInfo.sin}
                  onChange={handleSINChange}
                  placeholder="XXX-XXX-XXX"
                  maxLength={11}
                />
                <p className="text-xs text-gray-500 mt-1">Required for tax reporting (T4A)</p>
              </div>

              {/* Bank Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankInstitution">Bank Institution Number *</Label>
                  <Input
                    id="bankInstitution"
                    type="text"
                    value={bankingInfo.bankInstitution}
                    onChange={(e) => setBankingInfo(prev => ({ 
                      ...prev, 
                      bankInstitution: e.target.value.replace(/\D/g, '').slice(0, 3) 
                    }))}
                    placeholder="001"
                    maxLength={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">3 digits</p>
                </div>
                
                <div>
                  <Label htmlFor="bankTransit">Transit Number *</Label>
                  <Input
                    id="bankTransit"
                    type="text"
                    value={bankingInfo.bankTransit}
                    onChange={(e) => setBankingInfo(prev => ({ 
                      ...prev, 
                      bankTransit: e.target.value.replace(/\D/g, '').slice(0, 5) 
                    }))}
                    placeholder="00002"
                    maxLength={5}
                  />
                  <p className="text-xs text-gray-500 mt-1">5 digits</p>
                </div>
              </div>

              <div>
                <Label htmlFor="bankAccount">Bank Account Number *</Label>
                <Input
                  id="bankAccount"
                  type="text"
                  value={bankingInfo.bankAccount}
                  onChange={(e) => setBankingInfo(prev => ({ 
                    ...prev, 
                    bankAccount: e.target.value.replace(/\D/g, '').slice(0, 12) 
                  }))}
                  placeholder="1234567"
                  maxLength={12}
                />
                <p className="text-xs text-gray-500 mt-1">7-12 digits</p>
              </div>

              <div>
                <Label htmlFor="bankAccountHolder">Account Holder Name *</Label>
                <Input
                  id="bankAccountHolder"
                  type="text"
                  value={bankingInfo.bankAccountHolder}
                  onChange={(e) => setBankingInfo(prev => ({ ...prev, bankAccountHolder: e.target.value }))}
                  placeholder="Full name as it appears on your bank account"
                />
              </div>

              {/* GST/HST (Optional) */}
              <div>
                <Label htmlFor="gstHst">GST/HST Number (Optional)</Label>
                <Input
                  id="gstHst"
                  type="text"
                  value={bankingInfo.gstHstNumber}
                  onChange={(e) => setBankingInfo(prev => ({ ...prev, gstHstNumber: e.target.value }))}
                  placeholder="123456789RT0001"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only required if you're registered for GST/HST
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? 'Saving...' : 'Save Banking Information'}
                </Button>
                {bankingStatus?.hasBankingInfo && (
                  <Button 
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How to find your banking information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p><strong>Institution Number:</strong> 3-digit code identifying your bank (e.g., TD: 004, RBC: 003, Scotiabank: 002)</p>
          <p><strong>Transit Number:</strong> 5-digit code identifying your specific branch</p>
          <p><strong>Account Number:</strong> 7-12 digit account number</p>
          <p className="text-xs italic">You can find these numbers on your void cheque or online banking.</p>
        </CardContent>
      </Card>
    </div>
  )
}
