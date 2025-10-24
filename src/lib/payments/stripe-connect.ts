import Stripe from 'stripe'

// Lazy-load Stripe client to prevent initialization during build
let stripe: Stripe | null = null

function getStripeClient(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    })
  }
  return stripe
}

export interface ConnectedAccount {
  id: string
  userId: string
  stripeAccountId: string
  accountStatus: 'pending' | 'active' | 'restricted' | 'rejected'
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requirements: {
    currently_due: string[]
    eventually_due: string[]
    past_due: string[]
    pending_verification: string[]
  }
  capabilities: {
    card_payments?: 'active' | 'inactive' | 'pending'
    transfers?: 'active' | 'inactive' | 'pending'
  }
  country: string
  currency: string
  email?: string
  business_type?: 'individual' | 'company'
  created: Date
  updated: Date
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded'
  client_secret: string
  application_fee_amount?: number
  transfer_data?: {
    destination: string
    amount?: number
  }
  metadata: Record<string, string>
}

export interface Transfer {
  id: string
  amount: number
  currency: string
  destination: string
  description?: string
  metadata: Record<string, string>
  status: 'pending' | 'paid' | 'failed' | 'canceled'
  created: Date
}

/**
 * Create a Stripe Connect account for a talent
 */
export async function createConnectedAccount(
  userId: string,
  email: string,
  country: string = 'CA',
  businessType: 'individual' | 'company' = 'individual'
): Promise<ConnectedAccount> {
  try {
    const account = await getStripeClient().accounts.create({
      type: 'express',
      country,
      email,
      business_type: businessType,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        userId,
        platform: 'localtalents',
        created_at: new Date().toISOString(),
      },
    })

    return {
      id: account.id,
      userId,
      stripeAccountId: account.id,
      accountStatus: account.charges_enabled ? 'active' : 'pending',
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        past_due: account.requirements?.past_due || [],
        pending_verification: account.requirements?.pending_verification || [],
      },
      capabilities: {
        card_payments: account.capabilities?.card_payments,
        transfers: account.capabilities?.transfers,
      },
      country: account.country!,
      currency: account.default_currency!,
      email: account.email || undefined,
      business_type: account.business_type as 'individual' | 'company',
      created: new Date((account.created || 0) * 1000),
      updated: new Date(),
    }
  } catch (error) {
    console.error('Error creating connected account:', error)
    throw new Error('Failed to create payment account')
  }
}

/**
 * Create account link for onboarding
 */
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<string> {
  try {
    const accountLink = await getStripeClient().accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return accountLink.url
  } catch (error) {
    console.error('Error creating account link:', error)
    throw new Error('Failed to create onboarding link')
  }
}

/**
 * Get connected account details
 */
export async function getConnectedAccount(accountId: string): Promise<ConnectedAccount> {
  try {
    const account = await getStripeClient().accounts.retrieve(accountId)

    return {
      id: account.id,
      userId: account.metadata?.userId || '',
      stripeAccountId: account.id,
      accountStatus: account.charges_enabled ? 'active' : 'pending',
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        past_due: account.requirements?.past_due || [],
        pending_verification: account.requirements?.pending_verification || [],
      },
      capabilities: {
        card_payments: account.capabilities?.card_payments,
        transfers: account.capabilities?.transfers,
      },
      country: account.country!,
      currency: account.default_currency!,
      email: account.email || undefined,
      business_type: account.business_type as 'individual' | 'company',
      created: new Date((account.created || 0) * 1000),
      updated: new Date(),
    }
  } catch (error) {
    console.error('Error retrieving connected account:', error)
    throw new Error('Failed to retrieve payment account')
  }
}

/**
 * Create payment intent for escrow
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'cad',
  destinationAccountId: string,
  applicationFeeAmount: number,
  metadata: Record<string, string> = {}
): Promise<PaymentIntent> {
  try {
    const paymentIntent = await getStripeClient().paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      application_fee_amount: Math.round(applicationFeeAmount * 100),
      transfer_data: {
        destination: destinationAccountId,
      },
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
        platform: 'localtalents',
      },
      capture_method: 'manual', // Hold funds until milestone completion
    })

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret!,
      application_fee_amount: paymentIntent.application_fee_amount ? paymentIntent.application_fee_amount / 100 : undefined,
      transfer_data: paymentIntent.transfer_data ? {
        destination: typeof paymentIntent.transfer_data.destination === 'string' 
          ? paymentIntent.transfer_data.destination 
          : paymentIntent.transfer_data.destination.id,
        amount: paymentIntent.transfer_data.amount ? paymentIntent.transfer_data.amount / 100 : undefined,
      } : undefined,
      metadata: paymentIntent.metadata,
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw new Error('Failed to create payment intent')
  }
}

/**
 * Capture payment (release from escrow)
 */
export async function capturePayment(
  paymentIntentId: string,
  amountToCapture?: number
): Promise<PaymentIntent> {
  try {
    const paymentIntent = await getStripeClient().paymentIntents.capture(paymentIntentId, {
      amount_to_capture: amountToCapture ? Math.round(amountToCapture * 100) : undefined,
    })

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret!,
      application_fee_amount: paymentIntent.application_fee_amount ? paymentIntent.application_fee_amount / 100 : undefined,
      metadata: paymentIntent.metadata,
    }
  } catch (error) {
    console.error('Error capturing payment:', error)
    throw new Error('Failed to capture payment')
  }
}

/**
 * Cancel payment intent (refund escrow)
 */
export async function cancelPayment(paymentIntentId: string): Promise<PaymentIntent> {
  try {
    const paymentIntent = await getStripeClient().paymentIntents.cancel(paymentIntentId)

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret!,
      metadata: paymentIntent.metadata,
    }
  } catch (error) {
    console.error('Error canceling payment:', error)
    throw new Error('Failed to cancel payment')
  }
}

/**
 * Create direct transfer (for immediate payments)
 */
export async function createTransfer(
  amount: number,
  destinationAccountId: string,
  currency: string = 'cad',
  description?: string,
  metadata: Record<string, string> = {}
): Promise<Transfer> {
  try {
    const transfer = await getStripeClient().transfers.create({
      amount: Math.round(amount * 100),
      currency,
      destination: destinationAccountId,
      description,
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
        platform: 'localtalents',
      },
    })

    return {
      id: transfer.id,
      amount: transfer.amount / 100,
      currency: transfer.currency,
      destination: transfer.destination as string,
      description: transfer.description || undefined,
      metadata: transfer.metadata,
      status: 'paid', // Transfers are immediate
      created: new Date(transfer.created * 1000),
    }
  } catch (error) {
    console.error('Error creating transfer:', error)
    throw new Error('Failed to create transfer')
  }
}

/**
 * Create refund
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<any> {
  try {
    const refund = await getStripeClient().refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason,
      metadata: {
        created_at: new Date().toISOString(),
        platform: 'localtalents',
      },
    })

    return {
      id: refund.id,
      amount: refund.amount / 100,
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason,
      created: new Date(refund.created * 1000),
    }
  } catch (error) {
    console.error('Error creating refund:', error)
    throw new Error('Failed to create refund')
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance(accountId: string): Promise<any> {
  try {
    const balance = await getStripeClient().balance.retrieve({
      stripeAccount: accountId,
    })

    return {
      available: balance.available.map(b => ({
        amount: b.amount / 100,
        currency: b.currency,
      })),
      pending: balance.pending.map(b => ({
        amount: b.amount / 100,
        currency: b.currency,
      })),
    }
  } catch (error) {
    console.error('Error retrieving account balance:', error)
    throw new Error('Failed to retrieve account balance')
  }
}

/**
 * List transactions for an account
 */
export async function listTransactions(
  accountId: string,
  limit: number = 10,
  startingAfter?: string
): Promise<any[]> {
  try {
    const charges = await getStripeClient().charges.list({
      limit,
      starting_after: startingAfter,
    }, {
      stripeAccount: accountId,
    })

    return charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency,
      status: charge.status,
      description: charge.description,
      created: new Date(charge.created * 1000),
      metadata: charge.metadata,
    }))
  } catch (error) {
    console.error('Error listing transactions:', error)
    throw new Error('Failed to list transactions')
  }
}

/**
 * Calculate platform fee (8% as per business model)
 */
export function calculatePlatformFee(amount: number): number {
  const feePercentage = 0.08 // 8%
  return Math.round(amount * feePercentage * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate Stripe processing fee (2.9% + $0.30 CAD)
 */
export function calculateStripeFee(amount: number): number {
  const feePercentage = 0.029 // 2.9%
  const fixedFee = 0.30 // $0.30 CAD
  return Math.round((amount * feePercentage + fixedFee) * 100) / 100
}

/**
 * Calculate net amount after all fees
 */
export function calculateNetAmount(grossAmount: number): {
  grossAmount: number
  platformFee: number
  stripeFee: number
  netAmount: number
} {
  const platformFee = calculatePlatformFee(grossAmount)
  const stripeFee = calculateStripeFee(grossAmount)
  const netAmount = grossAmount - platformFee - stripeFee

  return {
    grossAmount,
    platformFee,
    stripeFee,
    netAmount: Math.round(netAmount * 100) / 100,
  }
}
