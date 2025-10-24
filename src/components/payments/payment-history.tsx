'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCardIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { paymentsService, Payment, PaymentStats } from '@/lib/api/payments.service'
import { formatCurrency, formatDate } from '@/lib/utils'

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: ''
  })

  useEffect(() => {
    loadPayments()
    loadStats()
  }, [statusFilter, typeFilter, dateRange])

  const loadPayments = async () => {
    try {
      const params: any = {
        limit: 50,
        offset: 0
      }

      if (statusFilter !== 'all') params.status = statusFilter
      if (typeFilter !== 'all') params.type = typeFilter
      if (dateRange.from) params.dateFrom = dateRange.from
      if (dateRange.to) params.dateTo = dateRange.to

      console.log('Loading payments with params:', params)
      const response = await paymentsService.getPayments(params)
      console.log('Received payments:', response.payments.length, response)
      setPayments(response.payments)
    } catch (error) {
      console.error('Failed to load payments:', error)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await paymentsService.getPaymentStats(
        dateRange.from || undefined,
        dateRange.to || undefined
      )
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load payment stats:', error)
    }
  }

  const downloadReceipt = async (paymentId: string) => {
    try {
      const blob = await paymentsService.downloadReceipt(paymentId, 'pdf')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${paymentId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download receipt:', error)
    }
  }

  const getPaymentStatusColor = (status: Payment['status']) => {
    const statusUpper = status?.toUpperCase()
    switch (statusUpper) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800'
      case 'PENDING': return 'bg-blue-100 text-blue-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentTypeColor = (type: Payment['type']) => {
    switch (type) {
      case 'ESCROW_FUNDING':
      case 'escrow_funding': 
        return 'bg-blue-100 text-blue-800'
      case 'MILESTONE_PAYMENT':
      case 'milestone_release': 
        return 'bg-green-100 text-green-800'
      case 'BIWEEKLY_PAYMENT': 
        return 'bg-indigo-100 text-indigo-800'
      case 'WITHDRAWAL':
      case 'withdrawal': 
        return 'bg-purple-100 text-purple-800'
      case 'REFUND':
      case 'refund': 
        return 'bg-orange-100 text-orange-800'
      case 'FEE':
      case 'fee': 
        return 'bg-gray-100 text-gray-800'
      default: 
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredPayments = (payments || []).filter(payment =>
    payment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCardIcon className="w-6 h-6" />
          Payment History
        </h2>
        <p className="text-gray-600">Track all your payments, receipts, and transactions</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalVolume)}
              </div>
              <p className="text-sm text-gray-600">Total Volume</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalTransactions.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Total Transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.averageTransaction)}
              </div>
              <p className="text-sm text-gray-600">Average Transaction</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">
                {(stats.successRate * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Success Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ESCROW_FUNDING">Escrow Funding</SelectItem>
                <SelectItem value="MILESTONE_PAYMENT">Milestone Payment</SelectItem>
                <SelectItem value="BIWEEKLY_PAYMENT">Biweekly Payment</SelectItem>
                <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                <SelectItem value="REFUND">Refund</SelectItem>
                <SelectItem value="FEE">Fee</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="To date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCardIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">No payments match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map(payment => (
                <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {payment.description || `Payment #${payment.id.slice(-8)}`}
                        </h4>
                        <Badge className={getPaymentStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                        {payment.type && (
                          <Badge className={getPaymentTypeColor(payment.type)}>
                            {payment.type.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>ID: {payment.id}</span>
                        {payment.project && (
                          <span>Project: {payment.project.title}</span>
                        )}
                        <span>{formatDate(payment.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total Amount
                        </div>
                        {payment.netAmount && Number(payment.netAmount) !== Number(payment.amount) && (
                          <div className="text-xs text-gray-500">
                            (Net: {formatCurrency(payment.netAmount, payment.currency)}, Fee: {formatCurrency((Number(payment.amount) - Number(payment.netAmount || 0)), payment.currency)})
                          </div>
                        )}
                        {payment.processedAt && (
                          <div className="text-sm text-gray-600">
                            Processed {formatDate(payment.processedAt)}
                          </div>
                        )}
                      </div>

                      {(payment.status === 'COMPLETED' || payment.status === 'completed') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReceipt(payment.id)}
                        >
                          <DocumentTextIcon className="w-4 h-4 mr-2" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
