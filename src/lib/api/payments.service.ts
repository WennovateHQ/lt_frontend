import { apiClient } from './client'

export interface Payment {
  id: string
  // Note: 'type' and 'description' fields don't exist in current database schema
  // They are kept here as optional for backward compatibility with existing code
  type?: 'ESCROW_FUNDING' | 'MILESTONE_PAYMENT' | 'BIWEEKLY_PAYMENT' | 'WITHDRAWAL' | 'REFUND' | 'FEE' | 'escrow_funding' | 'milestone_release' | 'withdrawal' | 'refund' | 'fee'
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  amount: number
  netAmount?: number
  platformFee?: number
  currency: string
  description?: string
  
  // Related entities
  projectId?: string
  contractId?: string
  milestoneId?: string
  escrowAccountId?: string
  
  // Stripe data
  stripePaymentIntentId?: string
  stripeTransferId?: string
  stripeChargeId?: string
  
  // Participants
  payerId?: string
  payeeId?: string
  
  // Metadata
  metadata?: Record<string, any>
  
  // Timestamps
  createdAt: string
  updatedAt: string
  processedAt?: string
  
  // Populated fields
  project?: {
    id: string
    title: string
  }
  payer?: {
    id: string
    firstName: string
    lastName: string
    companyName?: string
  }
  payee?: {
    id: string
    firstName: string
    lastName: string
  }
  milestone?: {
    id: string
    title: string
    description: string
  }
}

export interface Receipt {
  id: string
  paymentId: string
  receiptNumber: string
  type: 'payment' | 'refund' | 'withdrawal'
  
  // Amount details
  subtotal: number
  platformFee: number
  processingFee: number
  taxes: Array<{
    type: 'GST' | 'PST' | 'HST'
    rate: number
    amount: number
  }>
  total: number
  currency: string
  
  // Business details
  businessInfo: {
    name: string
    address: string
    taxNumber?: string
    email: string
  }
  
  customerInfo: {
    name: string
    email: string
    address?: string
    taxNumber?: string
  }
  
  // Line items
  lineItems: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  
  // Metadata
  notes?: string
  dueDate?: string
  paidDate?: string
  
  createdAt: string
  updatedAt: string
}

export interface PaymentSearchParams {
  type?: Payment['type']
  status?: Payment['status']
  projectId?: string
  contractId?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'amount' | 'processedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface PaymentSearchResponse {
  payments: Payment[]
  pagination: {
    total: number
    limit: number
    offset: number
    pages: number
  }
}

export interface PaymentStats {
  totalVolume: number
  totalTransactions: number
  averageTransaction: number
  successRate: number
  
  byType: Array<{
    type: string
    count: number
    volume: number
  }>
  
  byStatus: Array<{
    status: string
    count: number
    volume: number
  }>
  
  monthlyTrends: Array<{
    month: string
    volume: number
    transactions: number
  }>
  
  topProjects: Array<{
    projectId: string
    projectTitle: string
    volume: number
    transactions: number
  }>
}

export interface TaxDocument {
  id: string
  year: number
  type: 'T4A' | 'T5018' | '1099-NEC'
  status: 'draft' | 'finalized' | 'sent' | 'filed'
  
  recipientInfo: {
    userId: string
    name: string
    address: string
    sin?: string
    businessNumber?: string
  }
  
  payerInfo: {
    name: string
    address: string
    businessNumber: string
  }
  
  amounts: {
    totalEarnings: number
    incomeTax: number
    cpp?: number
    ei?: number
    other?: number
  }
  
  summary?: {
    totalGrossIncome: number
    totalPlatformFeesWithTax: number
    gstHstOnPlatformFees: number
    netIncome: number
  }
  
  gstHstInfo?: {
    province: string
    hasGstHstNumber: boolean
    totalTaxRate?: number
  }
  
  documentUrl?: string
  sentAt?: string
  filedAt?: string
  
  createdAt: string
  updatedAt: string
}

export class PaymentsService {
  // Payment history
  async getPayments(params?: PaymentSearchParams): Promise<PaymentSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<PaymentSearchResponse>(`/payments?${searchParams.toString()}`)
  }

  async getPayment(paymentId: string): Promise<Payment> {
    return apiClient.get<Payment>(`/payments/${paymentId}`)
  }

  async getPaymentsByProject(projectId: string): Promise<Payment[]> {
    return apiClient.get<Payment[]>(`/payments/project/${projectId}`)
  }

  async getPaymentsByContract(contractId: string): Promise<Payment[]> {
    return apiClient.get<Payment[]>(`/payments/contract/${contractId}`)
  }

  // Receipts
  async getReceipt(paymentId: string): Promise<Receipt> {
    return apiClient.get<Receipt>(`/payments/${paymentId}/receipt`)
  }

  async downloadReceipt(paymentId: string, format: 'pdf' | 'html' = 'pdf'): Promise<Blob> {
    return apiClient.getBlob(`/payments/${paymentId}/receipt/download`, {
      params: { format }
    })
  }

  async generateReceipt(paymentId: string): Promise<Receipt> {
    return apiClient.post<Receipt>(`/payments/${paymentId}/receipt/generate`)
  }

  async sendReceiptByEmail(paymentId: string, email?: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/payments/${paymentId}/receipt/send`, { email })
  }

  // Escrow operations
  async fundEscrow(contractId: string, amount: number): Promise<Payment> {
    return apiClient.post<Payment>('/payments/escrow/fund', {
      contractId,
      amount
    })
  }

  async releaseMilestonePayment(milestoneId: string): Promise<Payment> {
    return apiClient.post<Payment>(`/payments/milestone/${milestoneId}/release`)
  }

  async requestRefund(paymentId: string, reason: string): Promise<Payment> {
    return apiClient.post<Payment>(`/payments/${paymentId}/refund`, { reason })
  }

  // Withdrawals
  async requestWithdrawal(amount: number, bankAccountId: string): Promise<Payment> {
    return apiClient.post<Payment>('/payments/withdraw', {
      amount,
      bankAccountId
    })
  }

  async getWithdrawalHistory(): Promise<Payment[]> {
    return apiClient.get<Payment[]>('/payments/withdrawals')
  }

  // Bank accounts
  async getBankAccounts(): Promise<Array<{
    id: string
    accountType: 'checking' | 'savings'
    bankName: string
    accountNumber: string // masked
    routingNumber: string
    isDefault: boolean
    isVerified: boolean
    createdAt: string
  }>> {
    return apiClient.get('/payments/bank-accounts')
  }

  async addBankAccount(data: {
    accountType: 'checking' | 'savings'
    bankName: string
    accountNumber: string
    routingNumber: string
    accountHolderName: string
  }): Promise<{ id: string; message: string }> {
    return apiClient.post('/payments/bank-accounts', data)
  }

  async verifyBankAccount(accountId: string, microDeposits: [number, number]): Promise<{ message: string }> {
    return apiClient.post(`/payments/bank-accounts/${accountId}/verify`, { microDeposits })
  }

  async deleteBankAccount(accountId: string): Promise<void> {
    return apiClient.delete(`/payments/bank-accounts/${accountId}`)
  }

  // Tax documents
  async getTaxDocuments(year?: number): Promise<TaxDocument[]> {
    const params = year ? `?year=${year}` : ''
    return apiClient.get<TaxDocument[]>(`/payments/tax-documents${params}`)
  }

  async getTaxDocument(documentId: string): Promise<TaxDocument> {
    return apiClient.get<TaxDocument>(`/payments/tax-documents/${documentId}`)
  }

  async downloadTaxDocument(documentId: string): Promise<Blob> {
    return apiClient.getBlob(`/payments/tax-documents/${documentId}/download`)
  }

  async requestTaxDocument(year: number, type: 'T4A' | 'T5018' | '1099-NEC'): Promise<TaxDocument> {
    return apiClient.post<TaxDocument>('/payments/tax-documents/request', { year, type })
  }

  // Analytics
  async getPaymentStats(dateFrom?: string, dateTo?: string): Promise<PaymentStats> {
    const params = new URLSearchParams()
    if (dateFrom) params.append('dateFrom', dateFrom)
    if (dateTo) params.append('dateTo', dateTo)
    
    return apiClient.get<PaymentStats>(`/payments/stats?${params.toString()}`)
  }

  async getEarningsReport(year: number): Promise<{
    totalEarnings: number
    totalWithdrawn: number
    platformFees: number
    taxableIncome: number
    monthlyBreakdown: Array<{
      month: string
      earnings: number
      withdrawn: number
      fees: number
    }>
    topProjects: Array<{
      projectTitle: string
      earnings: number
      percentage: number
    }>
  }> {
    return apiClient.get(`/payments/earnings-report?year=${year}`)
  }

  // Admin methods
  async getAllPayments(params?: PaymentSearchParams): Promise<PaymentSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<PaymentSearchResponse>(`/payments/admin/all?${searchParams.toString()}`)
  }

  async processPayment(paymentId: string): Promise<Payment> {
    return apiClient.post<Payment>(`/payments/admin/${paymentId}/process`)
  }

  async cancelPayment(paymentId: string, reason: string): Promise<Payment> {
    return apiClient.post<Payment>(`/payments/admin/${paymentId}/cancel`, { reason })
  }

  async generateTaxDocuments(year: number, userIds?: string[]): Promise<{
    generated: number
    failed: number
    errors: Array<{
      userId: string
      error: string
    }>
  }> {
    return apiClient.post('/payments/admin/tax-documents/generate', { year, userIds })
  }
}

export const paymentsService = new PaymentsService()
