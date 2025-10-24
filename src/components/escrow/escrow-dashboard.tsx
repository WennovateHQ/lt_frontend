'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import {
  useEscrowAccount,
  useMilestoneProgress,
  useEscrowStatus,
  useEscrowSummary
} from '@/lib/hooks/use-escrow'
import { EscrowAccount, EscrowMilestone } from '@/lib/payments/escrow-manager'
import { MilestoneCard } from './milestone-card'
import { EscrowFundingModal } from './escrow-funding-modal'
import { DisputeModal } from './dispute-modal'
import { formatCurrency, formatDate } from '@/lib/utils'

interface EscrowDashboardProps {
  escrowId: string
  userRole: 'business' | 'talent' | 'admin'
  userId: string
}

export function EscrowDashboard({ escrowId, userRole, userId }: EscrowDashboardProps) {
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<EscrowMilestone | null>(null)

  const { data: escrowAccount, isLoading, error } = useEscrowAccount(escrowId)
  const progress = useMilestoneProgress(escrowAccount?.milestones || [])
  const escrowStatus = useEscrowStatus(escrowAccount)
  const escrowSummary = useEscrowSummary(escrowAccount)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading escrow details...</span>
      </div>
    )
  }

  if (error || !escrowAccount) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Failed to load escrow account. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-gray-100 text-gray-800'
      case 'funded': return 'bg-blue-100 text-blue-800'
      case 'partially_released': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'disputed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created': return <ClockIcon className="w-4 h-4" />
      case 'funded': return <CreditCardIcon className="w-4 h-4" />
      case 'partially_released': return <BanknotesIcon className="w-4 h-4" />
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />
      case 'disputed': return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'cancelled': return <ExclamationTriangleIcon className="w-4 h-4" />
      default: return <ClockIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Escrow Account</h1>
          <p className="text-gray-600">Contract ID: {escrowAccount.contractId}</p>
        </div>
        <Badge className={`${getStatusColor(escrowAccount.status)} flex items-center gap-1`}>
          {getStatusIcon(escrowAccount.status)}
          {escrowAccount.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Status Alerts */}
      {escrowStatus?.hasDisputes && (
        <Alert className="border-red-200 bg-red-50">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            This escrow account has active disputes that require attention.
          </AlertDescription>
        </Alert>
      )}

      {escrowAccount.status === 'created' && userRole === 'business' && (
        <Alert className="border-blue-200 bg-blue-50">
          <CreditCardIcon className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Please fund this escrow account to activate milestone payments.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2 text-blue-600"
              onClick={() => setShowFundingModal(true)}
            >
              Fund Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(escrowAccount.totalAmount)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {escrowAccount.currency.toUpperCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Released</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(progress.amountReleased)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {progress.completed} of {progress.total} milestones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {progress.completionPercentage}%
            </div>
            <Progress value={progress.completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net to Talent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {escrowSummary ? formatCurrency(escrowSummary.netToTalent) : '--'}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              After fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="milestones" className="space-y-6">
        <TabsList>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          {escrowStatus?.hasDisputes && (
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="milestones" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Project Milestones</h2>
            {userRole === 'business' && escrowStatus?.canFund && (
              <Button onClick={() => setShowFundingModal(true)}>
                <CreditCardIcon className="w-4 h-4 mr-2" />
                Fund Escrow
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {escrowAccount.milestones.map((milestone, index) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                milestoneNumber={index + 1}
                userRole={userRole}
                userId={userId}
                escrowId={escrowId}
                onDispute={(milestone) => {
                  setSelectedMilestone(milestone)
                  setShowDisputeModal(true)
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Transaction history will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Escrow Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Escrow ID</label>
                  <p className="text-gray-900">{escrowAccount.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Contract ID</label>
                  <p className="text-gray-900">{escrowAccount.contractId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-gray-900">{formatDate(escrowAccount.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-gray-900">{formatDate(escrowAccount.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {escrowSummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Fee Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Amount</span>
                    <span className="font-medium">{formatCurrency(escrowSummary.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="font-medium">-{formatCurrency(escrowSummary.platformFees)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stripe Fee</span>
                    <span className="font-medium">-{formatCurrency(escrowSummary.stripeFees)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Net to Talent</span>
                      <span>{formatCurrency(escrowSummary.netToTalent)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {escrowStatus?.hasDisputes && (
          <TabsContent value="disputes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                  Active Disputes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Dispute management interface will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Modals */}
      {showFundingModal && (
        <EscrowFundingModal
          escrowAccount={escrowAccount}
          onClose={() => setShowFundingModal(false)}
        />
      )}

      {showDisputeModal && selectedMilestone && (
        <DisputeModal
          escrowId={escrowId}
          milestone={selectedMilestone}
          userRole={userRole}
          onClose={() => {
            setShowDisputeModal(false)
            setSelectedMilestone(null)
          }}
        />
      )}
    </div>
  )
}
