'use client'

import React, { useState } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import stripePromise from '@/lib/stripe'
import { apiClient } from '@/lib/api/client'

interface PaymentFormProps {
  paymentIntentId: string
  clientSecret: string
  amount: number
  currency: string
  contractId: string
  onSuccess: () => void
  onError: (error: string) => void
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentIntentId,
  clientSecret,
  amount,
  currency,
  contractId,
  onSuccess,
  onError
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [postalCode, setPostalCode] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    // Validate postal code
    if (!postalCode || postalCode.trim().length < 3) {
      setError('Please enter a valid postal code')
      return
    }

    setIsProcessing(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError('Card element not found')
      setIsProcessing(false)
      return
    }

    try {
      // Confirm the payment with Stripe, including the postal code
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            address: {
              postal_code: postalCode.trim()
            }
          }
        }
      })

      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
        onError(stripeError.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent.id)
        
        // Confirm payment with backend to update escrow status
        try {
          console.log('💳 Confirming payment with backend...')
          const confirmResponse = await apiClient.post(
            `/contracts/${contractId}/escrow/confirm-payment`,
            { paymentIntentId: paymentIntent.id }
          )
          console.log('✅ Backend confirmed payment:', confirmResponse)
          onSuccess()
        } catch (confirmError) {
          console.error('⚠️ Backend confirmation failed, but payment succeeded:', confirmError)
          // Still call onSuccess since payment succeeded on Stripe
          // Backend will eventually update via webhook or manual retry
          onSuccess()
        }
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('An unexpected error occurred')
      onError('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true, // Hide built-in postal code - we'll use our own field
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCardIcon className="h-5 w-5 mr-2" />
          Secure Payment
        </CardTitle>
        <p className="text-sm text-gray-600">
          Amount: {currency.toUpperCase()} ${amount.toFixed(2)}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information
            </label>
            <div className="p-4 border border-gray-300 rounded-md">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code / ZIP Code
            </label>
            <input
              id="postalCode"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
              placeholder="e.g., M5V 3A8 or 12345"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your Canadian postal code (alphanumeric) or US ZIP code
            </p>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex items-center text-xs text-gray-500 mb-4">
            <LockClosedIcon className="h-4 w-4 mr-1" />
            Your payment information is secure and encrypted
          </div>
          
          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              `Pay ${currency.toUpperCase()} $${amount.toFixed(2)}`
            )}
          </Button>
        </form>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>This payment will be held in escrow until project milestones are completed.</p>
          <p>Powered by Stripe • Your data is protected with bank-level security</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface StripePaymentFormProps {
  paymentIntentId: string
  clientSecret: string
  amount: number
  currency: string
  contractId: string
  onSuccess: () => void
  onError: (error: string) => void
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  )
}

export default StripePaymentForm
