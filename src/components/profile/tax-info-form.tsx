'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'

const taxInfoSchema = z.object({
  gstHstNumber: z.string().optional(),
  taxExempt: z.boolean().default(false),
  province: z.string().optional()
})

type TaxInfoFormData = z.infer<typeof taxInfoSchema>

interface Province {
  code: string
  name: string
  taxType: string
  totalRate: number
}

interface TaxInfoFormProps {
  initialData?: {
    gstHstNumber?: string
    taxExempt?: boolean
    province?: string
  }
  onUpdate?: (data: TaxInfoFormData) => void
}

export function TaxInfoForm({ initialData, onUpdate }: TaxInfoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    formatted?: string
    message: string
  } | null>(null)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [selectedProvinceTax, setSelectedProvinceTax] = useState<Province | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<TaxInfoFormData>({
    resolver: zodResolver(taxInfoSchema),
    defaultValues: {
      gstHstNumber: initialData?.gstHstNumber || '',
      taxExempt: initialData?.taxExempt || false,
      province: initialData?.province || ''
    }
  })

  const watchedGstHst = watch('gstHstNumber')
  const watchedTaxExempt = watch('taxExempt')
  const watchedProvince = watch('province')

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

  // Update selected province tax info
  useEffect(() => {
    if (watchedProvince && provinces.length > 0) {
      const province = provinces.find(p => p.code === watchedProvince)
      setSelectedProvinceTax(province || null)
    }
  }, [watchedProvince, provinces])

  // Validate GST/HST number when it changes
  useEffect(() => {
    const validateGstHst = async () => {
      if (!watchedGstHst || watchedGstHst.length < 10) {
        setValidationResult(null)
        return
      }

      setIsValidating(true)
      try {
        const response = await apiClient.post('/api/tax/validate-gst-hst', {
          gstHstNumber: watchedGstHst
        }) as any
        
        setValidationResult(response.data)
        
        // Auto-format if valid
        if (response.data?.isValid && response.data?.formatted) {
          setValue('gstHstNumber', response.data.formatted)
        }
      } catch (error) {
        console.error('GST/HST validation error:', error)
        setValidationResult({
          isValid: false,
          message: 'Failed to validate GST/HST number'
        })
      } finally {
        setIsValidating(false)
      }
    }

    const timeoutId = setTimeout(validateGstHst, 500) // Debounce validation
    return () => clearTimeout(timeoutId)
  }, [watchedGstHst, setValue])

  const onSubmit = async (data: TaxInfoFormData) => {
    setIsLoading(true)
    try {
      await apiClient.put('/api/users/tax-info', data)
      toast.success('Tax information updated successfully')
      onUpdate?.(data)
    } catch (error: any) {
      console.error('Tax info update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update tax information')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTaxRate = (rate: number) => {
    return `${(rate * 100).toFixed(rate === 0.14975 ? 3 : 0)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <InformationCircleIcon className="h-5 w-5" />
          Tax Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <InformationCircleIcon className="h-4 w-4" />
          <AlertDescription>
            Providing your GST/HST number exempts you from paying taxes on platform fees. 
            The 8% platform fee will still apply, but no additional taxes will be charged.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Province Selection */}
          <div className="space-y-2">
            <Label htmlFor="province">Province/Territory</Label>
            <Select 
              value={watchedProvince} 
              onValueChange={(value) => setValue('province', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your province/territory" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province.code} value={province.code}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedProvinceTax && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {selectedProvinceTax.taxType}
                </Badge>
                <span>Tax Rate: {formatTaxRate(selectedProvinceTax.totalRate)}</span>
              </div>
            )}
          </div>

          {/* GST/HST Number */}
          <div className="space-y-2">
            <Label htmlFor="gstHstNumber">
              GST/HST Registration Number
              <span className="text-sm text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <div className="relative">
              <Input
                id="gstHstNumber"
                placeholder="123456789RT0001"
                {...register('gstHstNumber')}
                className={validationResult ? (
                  validationResult.isValid ? 'border-green-500' : 'border-red-500'
                ) : ''}
              />
              {isValidating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
              {validationResult && !isValidating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validationResult.isValid ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            
            {validationResult && (
              <p className={`text-sm ${
                validationResult.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {validationResult.message}
              </p>
            )}
            
            <p className="text-sm text-muted-foreground">
              Format: 9 digits + RT + 4 digits (e.g., 123456789RT0001)
            </p>
            
            {errors.gstHstNumber && (
              <p className="text-sm text-red-600">{errors.gstHstNumber.message}</p>
            )}
          </div>

          {/* Tax Exempt Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="taxExempt"
              checked={watchedTaxExempt}
              onCheckedChange={(checked) => setValue('taxExempt', Boolean(checked))}
            />
            <Label htmlFor="taxExempt" className="text-sm">
              I am exempt from paying taxes on platform fees
            </Label>
          </div>

          {watchedTaxExempt && (
            <Alert>
              <InformationCircleIcon className="h-4 w-4" />
              <AlertDescription>
                By checking this box, you confirm that you are legally exempt from paying taxes 
                on platform fees. This may require documentation for tax purposes.
              </AlertDescription>
            </Alert>
          )}

          {/* Platform Fee Preview */}
          {selectedProvinceTax && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Platform Fee Structure</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Base Platform Fee:</span>
                  <span>8%</span>
                </div>
                {!watchedGstHst && !watchedTaxExempt && (
                  <>
                    <div className="flex justify-between">
                      <span>Tax on Platform Fee ({selectedProvinceTax.taxType}):</span>
                      <span>{formatTaxRate(selectedProvinceTax.totalRate)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-1">
                      <span>Total Platform Fee:</span>
                      <span>{(8 * (1 + selectedProvinceTax.totalRate)).toFixed(2)}%</span>
                    </div>
                  </>
                )}
                {(watchedGstHst || watchedTaxExempt) && (
                  <div className="flex justify-between font-medium text-green-600">
                    <span>Tax Exempt - Total Platform Fee:</span>
                    <span>8%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading || !isDirty}
            className="w-full"
          >
            {isLoading ? 'Updating...' : 'Update Tax Information'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
