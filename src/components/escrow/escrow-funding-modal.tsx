'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CreditCardIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import { useFundEscrowAccount } from '@/lib/hooks/use-escrow'
import { EscrowAccount, calculateEscrowSummary } from '@/lib/payments/escrow-manager'
import { calculatePlatformFee, calculateStripeFee } from '@/lib/payments/stripe-connect'
import { formatCurrency } from '@/lib/utils'

const fundingSchema = z.object({
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  cardNumber: z.string().regex(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'Invalid card number format'),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Invalid expiry date format (MM/YY)'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
  cardholderName: z.string().min(1, 'Cardholder name is required'),
  billingAddress: z.object({
    line1: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'Province is required'),
    postalCode: z.string().regex(/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/, 'Invalid Canadian postal code'),
    country: z.literal('CA')
  }),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
})

type FundingFormData = z.infer<typeof fundingSchema>

interface EscrowFundingModalProps {
  escrowAccount: EscrowAccount
  onClose: () => void
}

export function EscrowFundingModal({ escrowAccount, onClose }: EscrowFundingModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)
  const fundMutation = useFundEscrowAccount()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FundingFormData>({
    resolver: zodResolver(fundingSchema),
    defaultValues: {
      billingAddress: {
        country: 'CA'
      },
      acceptTerms: false
    }
  })

  // Calculate fees and totals
  const platformFee = calculatePlatformFee(escrowAccount.totalAmount)
  const stripeFee = calculateStripeFee(escrowAccount.totalAmount)
  const totalFees = platformFee + stripeFee
  const totalCharge = escrowAccount.totalAmount + totalFees
  const netToTalent = escrowAccount.totalAmount - totalFees

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const onSubmit = async (data: FundingFormData) => {
    setIsProcessing(true)
    try {
      // In real implementation, create payment method with Stripe
      const paymentMethodId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await fundMutation.mutateAsync({
        escrowId: escrowAccount.id,
        paymentMethodId
      })
      
      onClose()
    } catch (error) {
      console.error('Failed to fund escrow:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5" />
            Fund Escrow Account
          </DialogTitle>
          <DialogDescription>
            Secure your project by funding the escrow account. Funds will be held safely and released to the talent upon milestone completion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Escrow Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Project Value</Label>
                  <p className="text-lg font-semibold">{formatCurrency(escrowAccount.totalAmount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Milestones</Label>
                  <p className="text-lg font-semibold">{escrowAccount.milestones.length}</p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Project Amount</span>
                  <span>{formatCurrency(escrowAccount.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee (5%)</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Processing Fee</span>
                  <span>{formatCurrency(stripeFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total Charge</span>
                  <span>{formatCurrency(totalCharge)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Net to Talent</span>
                  <span>{formatCurrency(netToTalent)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert className="border-blue-200 bg-blue-50">
            <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Your payment is secured by Stripe and protected by our escrow system. Funds are only released when you approve completed milestones.
            </AlertDescription>
          </Alert>

          {/* Payment Method Selection */}
          {!showCardForm ? (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Payment Method</Label>
              
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setShowCardForm(true)}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <CreditCardIcon className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="font-medium">Credit or Debit Card</p>
                      <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Select
                  </Button>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Card Information */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Card Information</Label>
                
                <div>
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    {...register('cardNumber')}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value)
                      setValue('cardNumber', formatted)
                    }}
                  />
                  {errors.cardNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.cardNumber.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      {...register('expiryDate')}
                      placeholder="MM/YY"
                      maxLength={5}
                      onChange={(e) => {
                        const formatted = formatExpiryDate(e.target.value)
                        setValue('expiryDate', formatted)
                      }}
                    />
                    {errors.expiryDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.expiryDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      {...register('cvv')}
                      placeholder="123"
                      maxLength={4}
                      type="password"
                    />
                    {errors.cvv && (
                      <p className="text-sm text-red-600 mt-1">{errors.cvv.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardholderName">Cardholder Name *</Label>
                  <Input
                    {...register('cardholderName')}
                    placeholder="John Doe"
                  />
                  {errors.cardholderName && (
                    <p className="text-sm text-red-600 mt-1">{errors.cardholderName.message}</p>
                  )}
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Billing Address</Label>
                
                <div>
                  <Label htmlFor="billingAddress.line1">Address *</Label>
                  <Input
                    {...register('billingAddress.line1')}
                    placeholder="123 Main Street"
                  />
                  {errors.billingAddress?.line1 && (
                    <p className="text-sm text-red-600 mt-1">{errors.billingAddress.line1.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billingAddress.city">City *</Label>
                    <Input
                      {...register('billingAddress.city')}
                      placeholder="Toronto"
                    />
                    {errors.billingAddress?.city && (
                      <p className="text-sm text-red-600 mt-1">{errors.billingAddress.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="billingAddress.state">Province *</Label>
                    <Input
                      {...register('billingAddress.state')}
                      placeholder="ON"
                    />
                    {errors.billingAddress?.state && (
                      <p className="text-sm text-red-600 mt-1">{errors.billingAddress.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billingAddress.postalCode">Postal Code *</Label>
                    <Input
                      {...register('billingAddress.postalCode')}
                      placeholder="K1A 0A6"
                    />
                    {errors.billingAddress?.postalCode && (
                      <p className="text-sm text-red-600 mt-1">{errors.billingAddress.postalCode.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="billingAddress.country">Country</Label>
                    <Input
                      value="Canada"
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="acceptTerms"
                  checked={watch('acceptTerms')}
                  onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)}
                />
                <div className="text-sm">
                  <Label htmlFor="acceptTerms" className="cursor-pointer">
                    I accept the{' '}
                    <a href="/terms" className="text-blue-600 hover:underline">
                      Terms and Conditions
                    </a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                  {errors.acceptTerms && (
                    <p className="text-red-600 mt-1">{errors.acceptTerms.message}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCardForm(false)}
                >
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Charge</p>
                    <p className="text-lg font-semibold">{formatCurrency(totalCharge)}</p>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isProcessing || fundMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {isProcessing || fundMutation.isPending ? (
                      'Processing...'
                    ) : (
                      <>
                        <BanknotesIcon className="w-4 h-4 mr-2" />
                        Fund Escrow
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
