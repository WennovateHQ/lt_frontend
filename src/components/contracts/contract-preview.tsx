'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ContractTemplate } from '@/lib/data/contract-templates'
import { ContractData } from '@/lib/types/contracts'
import { 
  DocumentTextIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface ContractPreviewProps {
  template: ContractTemplate
  contractData: ContractData
  onEdit: () => void
  onApprove: () => void
  onDownload: () => void
}

export function ContractPreview({ 
  template, 
  contractData, 
  onEdit, 
  onApprove, 
  onDownload 
}: ContractPreviewProps) {
  const [isApproved, setIsApproved] = useState(false)

  // Generate contract content by replacing template placeholders
  const generateContractContent = () => {
    let content = template.template

    // Replace all template variables
    const replacements: Record<string, string> = {
      businessName: contractData.businessName,
      businessAddress: contractData.businessAddress,
      talentName: contractData.talentName,
      talentAddress: contractData.talentAddress || '',
      projectTitle: contractData.projectTitle,
      projectDescription: contractData.projectDescription,
      scopeOfWork: contractData.scopeOfWork,
      deliverables: contractData.deliverables,
      paymentSchedule: contractData.paymentSchedule,
      startDate: new Date(contractData.startDate).toLocaleDateString(),
      completionDate: contractData.completionDate ? new Date(contractData.completionDate).toLocaleDateString() : '',
      duration: contractData.duration,
      totalAmount: contractData.totalAmount?.toString() || '',
      hourlyRate: contractData.hourlyRate?.toString() || '',
      estimatedHours: contractData.estimatedHours?.toString() || '',
      serviceDescription: contractData.scopeOfWork,
      invoicingSchedule: contractData.paymentSchedule,
      invoicingFrequency: 'weekly', // Default
      designScope: contractData.scopeOfWork,
      revisionPolicy: 'Up to 3 rounds of revisions included',
      milestones: contractData.totalAmount ? generateMilestonesText() : ''
    }

    // Replace template variables
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g')
      content = content.replace(regex, value)
    })

    return content
  }

  const generateMilestonesText = () => {
    if (!template.defaultMilestones || !contractData.totalAmount) return ''
    
    return template.defaultMilestones.map((milestone, index) => {
      const amount = (contractData.totalAmount! * milestone.percentage) / 100
      return `${index + 1}. ${milestone.name} - $${amount.toFixed(2)} (${milestone.percentage}%)
Due: ${milestone.dueOffset} days from start
Deliverables: ${milestone.deliverables.join(', ')}`
    }).join('\n\n')
  }

  const contractContent = generateContractContent()

  const handleApprove = () => {
    setIsApproved(true)
    onApprove()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contract Preview</h2>
          <p className="text-gray-600">Review the contract before finalizing</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onEdit}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={onDownload}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline">
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Contract Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <DocumentTextIcon className="h-5 w-5" />
              <span>{template.name}</span>
            </CardTitle>
            <Badge>{template.type} Contract</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Business:</span>
              <p className="text-gray-900">{contractData.businessName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Talent:</span>
              <p className="text-gray-900">{contractData.talentName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Project:</span>
              <p className="text-gray-900">{contractData.projectTitle}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Value:</span>
              <p className="text-gray-900">
                {template.type === 'hourly' 
                  ? `$${contractData.hourlyRate}/hr (${contractData.estimatedHours}h est.)`
                  : `$${contractData.totalAmount}`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Content */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white border rounded-lg p-8 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-gray-800">
              {contractContent}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Approval Section */}
      <Card className={isApproved ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {isApproved ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium ${isApproved ? 'text-green-900' : 'text-amber-900'}`}>
                {isApproved ? 'Contract Approved' : 'Review Required'}
              </h4>
              <p className={`text-sm mt-1 ${isApproved ? 'text-green-800' : 'text-amber-800'}`}>
                {isApproved 
                  ? 'This contract has been approved and is ready for signatures.'
                  : 'Please review the contract carefully before approving. Once approved, it will be sent for signatures.'
                }
              </p>
              {!isApproved && (
                <div className="mt-3">
                  <Button onClick={handleApprove} className="bg-amber-600 hover:bg-amber-700">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Approve Contract
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Legal Notice</h4>
              <p className="text-sm text-blue-800 mt-1">
                This contract template is designed for use in {template.jurisdiction} and includes 
                standard legal clauses. However, it's recommended to have any contract reviewed 
                by a qualified legal professional before execution, especially for high-value 
                or complex projects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isApproved && (
        <div className="flex justify-center space-x-4">
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Send for Signatures
          </Button>
          <Button variant="outline" size="lg">
            Save as Draft
          </Button>
        </div>
      )}
    </div>
  )
}
