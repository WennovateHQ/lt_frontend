'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PaymentHistory } from '@/components/payments/payment-history'
import { TaxDocuments } from '@/components/payments/tax-documents'

export default function BusinessPaymentsPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="tax">Tax Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <PaymentHistory />
        </TabsContent>

        <TabsContent value="tax">
          <TaxDocuments />
        </TabsContent>
      </Tabs>
    </div>
  )
}
