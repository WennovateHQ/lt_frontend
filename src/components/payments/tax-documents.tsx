'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { paymentsService, TaxDocument } from '@/lib/api/payments.service'
import { formatCurrency, formatDate } from '@/lib/utils'

export function TaxDocuments() {
  const [documents, setDocuments] = useState<TaxDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    loadTaxDocuments()
  }, [selectedYear])

  const loadTaxDocuments = async () => {
    try {
      const docs = await paymentsService.getTaxDocuments(selectedYear)
      setDocuments(docs)
    } catch (error) {
      console.error('Failed to load tax documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestTaxDocument = async (type: 'T4A' | 'T5018' | '1099-NEC') => {
    setRequesting(true)
    try {
      const newDoc = await paymentsService.requestTaxDocument(selectedYear, type)
      setDocuments(prev => [...prev, newDoc])
    } catch (error) {
      console.error('Failed to request tax document:', error)
    } finally {
      setRequesting(false)
    }
  }

  const downloadDocument = async (documentId: string, fileName: string) => {
    try {
      const blob = await paymentsService.downloadTaxDocument(documentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download document:', error)
    }
  }

  const getStatusColor = (status: TaxDocument['status']) => {
    switch (status) {
      case 'finalized': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'filed': return 'bg-purple-100 text-purple-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6" />
            Tax Documents
          </h2>
          <p className="text-gray-600">Generate and download your Canadian tax forms</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tax Year Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tax Year {selectedYear} Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• T4A forms are required for Canadian tax filing if you earned more than $500</p>
                <p>• Documents are typically available by February 28th of the following year</p>
                <p>• You can request documents once your earnings data is finalized</p>
                <p>• All amounts are reported in Canadian dollars (CAD)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request New Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Request Tax Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-dashed">
              <CardContent className="p-4 text-center">
                <DocumentTextIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <h4 className="font-medium text-gray-900 mb-2">T4A Statement</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Statement of Pension, Retirement, Annuity, and Other Income
                </p>
                <Button
                  onClick={() => requestTaxDocument('T4A')}
                  disabled={requesting}
                  size="sm"
                  className="w-full"
                >
                  Request T4A
                </Button>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardContent className="p-4 text-center">
                <DocumentTextIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <h4 className="font-medium text-gray-900 mb-2">T5018 Statement</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Statement of Contract Payments
                </p>
                <Button
                  onClick={() => requestTaxDocument('T5018')}
                  disabled={requesting}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  Request T5018
                </Button>
              </CardContent>
            </Card>

          </div>
        </CardContent>
      </Card>

      {/* Existing Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tax Documents ({selectedYear})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">
                No tax documents have been generated for {selectedYear} yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map(document => (
                <div key={document.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">
                          Tax Summary - {document.year}
                        </h4>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Available
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Gross Income:</span>
                          <div className="font-medium">
                            {formatCurrency(document.summary?.totalGrossIncome || 0)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Platform Fees:</span>
                          <div className="font-medium">
                            {formatCurrency(document.summary?.totalPlatformFeesWithTax || 0)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">GST/HST on Fees:</span>
                          <div className="font-medium">
                            {formatCurrency(document.summary?.gstHstOnPlatformFees || 0)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Net Income:</span>
                          <div className="font-medium text-green-600">
                            {formatCurrency(document.summary?.netIncome || 0)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Year: {document.year}</span>
                        <span>Province: {document.gstHstInfo?.province || 'ON'}</span>
                        {document.gstHstInfo?.hasGstHstNumber ? (
                          <Badge variant="outline" className="text-green-600">GST/HST Registered - Tax Exempt</Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600">GST/HST Applies ({document.gstHstInfo?.totalTaxRate ? (document.gstHstInfo.totalTaxRate * 100).toFixed(1) : 13}%)</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {document.documentUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(
                            document.id, 
                            `${document.type}-${document.year}.pdf`
                          )}
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                          Download
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
