'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface ContractActionsProps {
  applicationId: string
  projectId: string
}

interface Contract {
  id: string
  status: string
  title: string
  createdAt: string
  businessSignedAt?: string
  talentSignedAt?: string
}

interface ContractCheckResponse {
  hasContract: boolean
  contractId?: string
  contractStatus?: string
  canMessage?: boolean
  needsContract?: boolean
  isFullySigned?: boolean
}

export function ContractActions({ applicationId, projectId }: ContractActionsProps) {
  const [contract, setContract] = useState<Contract | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkForContract()
  }, [applicationId])

  const checkForContract = async () => {
    try {
      setIsLoading(true)
      const { apiClient } = await import('@/lib/api/client')
      const response = await apiClient.get<ContractCheckResponse>(`/applications/${applicationId}/contract`)
      console.log('Contract response:', response)
      
      // Check if contract exists based on backend response format
      if (response.hasContract && response.contractId) {
        // Transform backend response to expected contract format
        setContract({
          id: response.contractId,
          status: response.contractStatus || 'UNKNOWN',
          title: 'Contract', // We'll get this from contract details if needed
          createdAt: new Date().toISOString(), // Placeholder
          businessSignedAt: response.isFullySigned ? new Date().toISOString() : undefined,
          talentSignedAt: response.isFullySigned ? new Date().toISOString() : undefined
        })
      } else {
        setContract(null)
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No contract exists yet - this is normal
        setContract(null)
      } else {
        console.error('Failed to check for contract:', error)
        setError('Failed to check contract status')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusDisplay = (status: string) => {
    if (!status) {
      return { label: 'Unknown', color: 'text-gray-600', icon: DocumentTextIcon }
    }
    
    switch (status.toLowerCase()) {
      case 'draft':
        return { label: 'Draft', color: 'text-gray-600', icon: DocumentTextIcon }
      case 'pending_signatures':
        return { label: 'Waiting for Signatures', color: 'text-yellow-600', icon: ClockIcon }
      case 'active':
        return { label: 'Active', color: 'text-green-600', icon: CheckCircleIcon }
      case 'completed':
        return { label: 'Completed', color: 'text-blue-600', icon: CheckCircleIcon }
      default:
        return { label: status, color: 'text-gray-600', icon: DocumentTextIcon }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={checkForContract} className="mt-2">
          Try Again
        </Button>
      </div>
    )
  }

  if (!contract) {
    // No contract exists - show create contract button
    return (
      <div className="flex flex-col gap-2">
        <Button asChild className="w-full">
          <Link href={`/business/projects/${projectId}/contracts/create?applicationId=${applicationId}`}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Contract
          </Link>
        </Button>
        <p className="text-xs text-gray-500 text-center">
          Create a contract to formalize the agreement
        </p>
      </div>
    )
  }

  // Contract exists - show contract status and actions
  const statusDisplay = getStatusDisplay(contract.status)
  const StatusIcon = statusDisplay.icon

  return (
    <div className="space-y-3">
      {/* Contract Status */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <StatusIcon className={`h-4 w-4 ${statusDisplay.color}`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Contract Created</p>
          <p className={`text-xs ${statusDisplay.color}`}>{statusDisplay.label}</p>
        </div>
      </div>

      {/* Contract Actions */}
      <div className="flex flex-col gap-2">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/business/contracts/${contract.id}`}>
            <EyeIcon className="h-4 w-4 mr-2" />
            View Contract
          </Link>
        </Button>

        {contract.status === 'pending_signatures' && (
          <div className="text-xs text-center text-gray-500 mt-1">
            {contract.businessSignedAt && !contract.talentSignedAt && (
              "Waiting for talent to sign"
            )}
            {!contract.businessSignedAt && (
              "Waiting for signatures"
            )}
          </div>
        )}

        {contract.status === 'active' && (
          <Button variant="outline" size="sm" className="w-full">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Manage Project
          </Button>
        )}
      </div>
    </div>
  )
}
