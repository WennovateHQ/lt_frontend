'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CurrencyDollarIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api/client'
import { formatCurrency } from '@/lib/utils'

interface Province {
  code: string
  name: string
  taxType: string
  totalRate: number
}

interface PlatformFeeCalculation {
  baseFee: number
  taxAmount: number
  totalFee: number
  exemptFromTax: boolean
  reason?: string
}

interface PlatformFeeCalculatorProps {
  projectAmount?: number
  hourlyRate?: number
  totalHours?: number
  projectType?: 'fixed' | 'hourly'
  userProvinceCode?: string
  className?: string
  showTitle?: boolean
}

export function PlatformFeeCalculator({
  projectAmount = 0,
  hourlyRate = 0,
  totalHours = 0,
  projectType = 'fixed',
  userProvinceCode,
  className = '',
  showTitle = true
}: PlatformFeeCalculatorProps) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [selectedProvince, setSelectedProvince] = useState(userProvinceCode || '')
  const [platformFee, setPlatformFee] = useState<PlatformFeeCalculation | null>(null)
  const [userTaxStatus, setUserTaxStatus] = useState<{
    hasGstHstNumber: boolean
    taxExempt: boolean
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await apiClient.get('/api/tax/provinces') as any
        setProvinces(response.data.provinces)
      } catch (error) {
        console.error('Failed to load provinces:', error)
      }
    }
    loadProvinces()
  }, [])

  // Calculate platform fee when inputs change
  useEffect(() => {
    const calculateFee = async () => {
      if (!selectedProvince) return
      
      const amount = projectType === 'hourly' ? hourlyRate * totalHours : projectAmount
      if (amount <= 0) {
        setPlatformFee(null)
        return
      }

      setIsLoading(true)
      try {
        const response = await apiClient.post('/api/tax/calculate-platform-fee', {
          projectAmount: projectType === 'fixed' ? amount : undefined,
          hourlyRate: projectType === 'hourly' ? hourlyRate : undefined,
          totalHours: projectType === 'hourly' ? totalHours : undefined,
          projectType,
          provinceCode: selectedProvince
        }) as any
        
        setPlatformFee(response.data.platformFee)
        setUserTaxStatus(response.data.userTaxStatus)
      } catch (error) {
        console.error('Failed to calculate platform fee:', error)
        setPlatformFee(null)
        setUserTaxStatus(null)
      } finally {
        setIsLoading(false)
      }
    }

    calculateFee()
  }, [projectAmount, hourlyRate, totalHours, projectType, selectedProvince])

  const selectedProvinceData = provinces.find(p => p.code === selectedProvince)
  const projectTotal = projectType === 'hourly' ? hourlyRate * totalHours : projectAmount

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5" />
            Platform Fee Calculator
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Province Selection */}
        <div className="space-y-2">
          <Label htmlFor="province">Province/Territory</Label>
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger>
              <SelectValue placeholder="Select province/territory" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.code} value={province.code}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedProvinceData && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {selectedProvinceData.taxType}
              </Badge>
              <span>Tax Rate: {(selectedProvinceData.totalRate * 100).toFixed(selectedProvinceData.totalRate === 0.14975 ? 3 : 0)}%</span>
            </div>
          )}
        </div>

        {/* Project Amount Display */}
        {projectTotal > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {projectType === 'hourly' ? 'Biweekly Amount' : 'Project Amount'}:
              </span>
              <span className="font-bold text-lg">
                {formatCurrency(projectTotal)}
              </span>
            </div>
            {projectType === 'hourly' && (
              <div className="text-sm text-muted-foreground mt-1">
                ${hourlyRate}/hour × {totalHours} hours
              </div>
            )}
          </div>
        )}

        {/* Tax Status Alert */}
        {userTaxStatus && (
          <Alert className={userTaxStatus.hasGstHstNumber || userTaxStatus.taxExempt ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}>
            <CheckCircleIcon className={`h-4 w-4 ${userTaxStatus.hasGstHstNumber || userTaxStatus.taxExempt ? 'text-green-600' : 'text-blue-600'}`} />
            <AlertDescription className={userTaxStatus.hasGstHstNumber || userTaxStatus.taxExempt ? 'text-green-800' : 'text-blue-800'}>
              {userTaxStatus.hasGstHstNumber || userTaxStatus.taxExempt ? (
                'You are exempt from taxes on platform fees due to your GST/HST registration or tax-exempt status.'
              ) : (
                'Taxes will be applied to platform fees. Consider registering for GST/HST to save on fees.'
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Platform Fee Breakdown */}
        {platformFee && projectTotal > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Fee Breakdown</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Platform Fee (8%):</span>
                <span>{formatCurrency(platformFee.baseFee)}</span>
              </div>
              
              {!platformFee.exemptFromTax && platformFee.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax on Platform Fee:</span>
                  <span>{formatCurrency(platformFee.taxAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-medium text-lg border-t pt-2">
                <span>Total Platform Fee:</span>
                <span className={platformFee.exemptFromTax ? 'text-green-600' : ''}>
                  {formatCurrency(platformFee.totalFee)}
                </span>
              </div>
              
              {platformFee.exemptFromTax && (
                <div className="text-xs text-green-600 mt-1">
                  ✓ Tax exempt
                </div>
              )}
            </div>

            {/* Total Cost Summary */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-900">
                  Total Cost to You:
                </span>
                <span className="font-bold text-xl text-blue-900">
                  {formatCurrency(projectTotal + platformFee.totalFee)}
                </span>
              </div>
              <div className="text-sm text-blue-700 mt-1">
                Project: {formatCurrency(projectTotal)} + Platform Fee: {formatCurrency(platformFee.totalFee)}
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-muted-foreground">Calculating fees...</span>
          </div>
        )}

        {/* Information */}
        <Alert>
          <InformationCircleIcon className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Platform fees are charged {projectType === 'hourly' ? 'biweekly based on hours worked' : 'once upon project completion'}. 
            Taxes are calculated based on your province and GST/HST registration status.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
