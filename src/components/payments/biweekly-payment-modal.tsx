'use client'

import { useState, useEffect } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { formatCurrency, formatDate } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'

const paymentSchema = z.object({
  notes: z.string().optional(),
  confirmPayment: z.boolean().refine(val => val === true, 'You must confirm the payment')
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface TimeEntry {
  id: string
  date: string
  hours: number
  description: string
  status: string
  hourlyRate: number
  amount: number
}

interface PaymentPeriod {
  startDate: string
  endDate: string
  totalHours: number
  totalAmount: number
  platformFee: number
  taxAmount: number
  netAmount: number
  hourlyRate: number
  timeEntries: TimeEntry[]
  status: string
}

interface BiweeklyPaymentModalProps {
  contractId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function BiweeklyPaymentModal({ 
  contractId, 
  isOpen, 
  onClose, 
  onSuccess 
}: BiweeklyPaymentModalProps) {
  const [paymentPeriod, setPaymentPeriod] = useState<PaymentPeriod | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema)
  })

  const confirmPayment = watch('confirmPayment')

  useEffect(() => {
    if (isOpen) {
      fetchPaymentPeriod()
    }
  }, [isOpen, contractId])

  const fetchPaymentPeriod = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get(`/contracts/${contractId}/payment-period/current`) as any
      setPaymentPeriod(response.paymentPeriod)
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load payment period data')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: PaymentFormData) => {
    if (!paymentPeriod) return

    try {
      setIsProcessing(true)
      setError(null)

      await apiClient.post(`/contracts/${contractId}/payments/biweekly`, {
        periodStart: paymentPeriod.startDate,
        periodEnd: paymentPeriod.endDate,
        totalHours: paymentPeriod.totalHours,
        totalAmount: paymentPeriod.totalAmount,
        platformFee: paymentPeriod.platformFee,
        taxAmount: paymentPeriod.taxAmount,
        netAmount: paymentPeriod.netAmount,
        timeEntryIds: paymentPeriod.timeEntries.map(entry => entry.id),
        notes: data.notes
      })

      onSuccess?.()
      onClose()
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5" />
            Process Biweekly Payment
          </DialogTitle>
          <DialogDescription>
            Review and process payment for approved time entries in the current period.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !paymentPeriod ? (
          <Alert>
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              No approved time entries found for the current payment period.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Period Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Payment Period Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Period</p>
                    <p className="font-semibold">
                      {formatDate(paymentPeriod.startDate)} - {formatDate(paymentPeriod.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="font-semibold flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {paymentPeriod.totalHours} hours
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600">Gross Amount</p>
                    <p className="text-lg font-bold text-blue-700">
                      {formatCurrency(paymentPeriod.totalAmount)}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-600">Platform Fee</p>
                    <p className="text-lg font-bold text-yellow-700">
                      -{formatCurrency(paymentPeriod.platformFee)}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-600">Tax Amount</p>
                    <p className="text-lg font-bold text-red-700">
                      -{formatCurrency(paymentPeriod.taxAmount)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-600">Net Payment</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(paymentPeriod.netAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5" />
                  Time Entries ({paymentPeriod.timeEntries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentPeriod.timeEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell className="font-mono">
                          {entry.hours}h
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate" title={entry.description}>
                            {entry.description}
                          </p>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(entry.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Payment Notes */}
            <div>
              <Label htmlFor="notes">Payment Notes (Optional)</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Add any notes about this payment..."
                rows={3}
              />
            </div>

            {/* Confirmation */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="confirmPayment"
                {...register('confirmPayment')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="confirmPayment" className="text-sm">
                I confirm that I want to process this payment of{' '}
                <span className="font-semibold">
                  {paymentPeriod && formatCurrency(paymentPeriod.netAmount)}
                </span>{' '}
                to the talent.
              </Label>
            </div>
            {errors.confirmPayment && (
              <p className="text-sm text-red-600">{errors.confirmPayment.message}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                type="submit"
                disabled={isProcessing || !confirmPayment}
                className="flex-1"
              >
                {isProcessing ? 'Processing Payment...' : 'Process Payment'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
