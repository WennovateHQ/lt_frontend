'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  ContractTemplate, 
  generateMilestonesFromTemplate,
  type Milestone 
} from '@/lib/data/contract-templates'
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'

interface ContractData {
  // Parties
  businessName: string
  businessAddress: string
  talentName: string
  talentAddress?: string // Optional - can be provided later during contract signing
  
  // Project Details
  projectTitle: string
  projectDescription: string
  scopeOfWork: string
  deliverables: string
  
  // Financial Terms
  totalAmount?: number
  hourlyRate?: number
  estimatedHours?: number
  paymentSchedule: string
  
  // Timeline
  startDate: string
  completionDate?: string
  duration: string
  
  // Additional Terms
  additionalTerms?: string
  cancellationPolicy?: string
  intellectualPropertyRights?: string
  
  // Milestones (for milestone contracts)
  milestones?: Milestone[]
}

interface ContractCreationWizardProps {
  template: ContractTemplate
  onComplete: (contractData: ContractData) => void
  onBack: () => void
  initialData?: Partial<ContractData>
}

export function ContractCreationWizard({ 
  template, 
  onComplete, 
  onBack, 
  initialData = {} 
}: ContractCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [contractData, setContractData] = useState<ContractData>({
    businessName: initialData.businessName || '',
    businessAddress: initialData.businessAddress || '',
    talentName: initialData.talentName || '',
    talentAddress: initialData.talentAddress || '',
    projectTitle: initialData.projectTitle || '',
    projectDescription: initialData.projectDescription || '',
    scopeOfWork: initialData.scopeOfWork || '',
    deliverables: initialData.deliverables || '',
    paymentSchedule: initialData.paymentSchedule || '',
    startDate: initialData.startDate || '',
    duration: initialData.duration || '',
    totalAmount: initialData.totalAmount,
    hourlyRate: initialData.hourlyRate,
    estimatedHours: initialData.estimatedHours,
    completionDate: initialData.completionDate || '',
    additionalTerms: initialData.additionalTerms || '',
    cancellationPolicy: initialData.cancellationPolicy || '',
    intellectualPropertyRights: initialData.intellectualPropertyRights || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const steps = [
    { id: 'parties', title: 'Parties', icon: UserIcon },
    { id: 'project', title: 'Project Details', icon: DocumentTextIcon },
    { id: 'financial', title: 'Financial Terms', icon: CurrencyDollarIcon },
    { id: 'timeline', title: 'Timeline', icon: CalendarIcon },
    ...(template.type === 'fixed' && template.defaultMilestones ? [{ id: 'milestones', title: 'Milestones', icon: CheckIcon }] : []),
    { id: 'review', title: 'Review', icon: CheckIcon }
  ]

  const updateContractData = (updates: Partial<ContractData>) => {
    setContractData(prev => ({ ...prev, ...updates }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0: // Parties
        if (!contractData.businessName) newErrors.businessName = 'Business name is required'
        if (!contractData.businessAddress) newErrors.businessAddress = 'Business address is required'
        if (!contractData.talentName) newErrors.talentName = 'Talent name is required'
        // Talent address is now optional - can be provided later during contract signing
        break
      
      case 1: // Project Details
        if (!contractData.projectTitle) newErrors.projectTitle = 'Project title is required'
        if (!contractData.projectDescription) newErrors.projectDescription = 'Project description is required'
        if (!contractData.scopeOfWork) newErrors.scopeOfWork = 'Scope of work is required'
        if (!contractData.deliverables) newErrors.deliverables = 'Deliverables are required'
        break
      
      case 2: // Financial Terms
        if (template.type === 'hourly') {
          if (!contractData.hourlyRate) newErrors.hourlyRate = 'Hourly rate is required'
          if (!contractData.estimatedHours) newErrors.estimatedHours = 'Estimated hours is required'
        } else {
          if (!contractData.totalAmount) newErrors.totalAmount = 'Total amount is required'
        }
        if (!contractData.paymentSchedule) newErrors.paymentSchedule = 'Payment schedule is required'
        break
      
      case 3: // Timeline
        if (!contractData.startDate) newErrors.startDate = 'Start date is required'
        if (!contractData.duration) newErrors.duration = 'Duration is required'
        if (template.type === 'fixed' && !contractData.completionDate) {
          newErrors.completionDate = 'Completion date is required for fixed contracts'
        }
        break
      
      case 4: // Milestones (only for fixed contracts with milestones)
        if (template.type === 'fixed' && template.defaultMilestones) {
          // Milestone step validation - ensure milestones are properly configured
          if (!contractData.milestones || contractData.milestones.length === 0) {
            newErrors.milestones = 'At least one milestone is required'
          } else {
            // Validate each milestone
            contractData.milestones.forEach((milestone, index) => {
              if (!milestone.name) newErrors[`milestone-${index}-name`] = 'Milestone name is required'
              if (!milestone.value || milestone.value <= 0) newErrors[`milestone-${index}-value`] = 'Milestone amount must be greater than 0'
              if (!milestone.description) newErrors[`milestone-${index}-description`] = 'Milestone description is required'
            })
          }
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        handleComplete()
      }
    }
  }

  const handleComplete = () => {
    // Generate milestones if it's a fixed contract with milestones
    if (template.type === 'fixed' && template.defaultMilestones && contractData.totalAmount) {
      // Ensure we have a valid start date
      const startDate = contractData.startDate ? new Date(contractData.startDate) : new Date();
      const isValidStartDate = startDate instanceof Date && !isNaN(startDate.getTime());
      
      const milestones = generateMilestonesFromTemplate(
        template, 
        contractData.totalAmount, 
        isValidStartDate ? startDate : new Date()
      )
      // Include milestones in the final contract data
      const finalContractData = { ...contractData, milestones }
      onComplete(finalContractData)
    } else {
      onComplete(contractData)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Parties
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Parties</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Business Information</h4>
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={contractData.businessName}
                      onChange={(e) => updateContractData({ businessName: e.target.value })}
                      className={errors.businessName ? 'border-red-500' : ''}
                    />
                    {errors.businessName && <p className="text-sm text-red-600">{errors.businessName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Textarea
                      id="businessAddress"
                      value={contractData.businessAddress}
                      onChange={(e) => updateContractData({ businessAddress: e.target.value })}
                      className={errors.businessAddress ? 'border-red-500' : ''}
                      rows={3}
                    />
                    {errors.businessAddress && <p className="text-sm text-red-600">{errors.businessAddress}</p>}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Talent Information</h4>
                  <div>
                    <Label htmlFor="talentName">Talent Name</Label>
                    <Input
                      id="talentName"
                      value={contractData.talentName}
                      onChange={(e) => updateContractData({ talentName: e.target.value })}
                      className={errors.talentName ? 'border-red-500' : ''}
                    />
                    {errors.talentName && <p className="text-sm text-red-600">{errors.talentName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="talentAddress">Talent Address <span className="text-gray-500 text-sm">(Optional)</span></Label>
                    <Textarea
                      id="talentAddress"
                      value={contractData.talentAddress}
                      onChange={(e) => updateContractData({ talentAddress: e.target.value })}
                      className={errors.talentAddress ? 'border-red-500' : ''}
                      rows={3}
                      placeholder="Address can be provided later during contract signing if not available now"
                    />
                    {errors.talentAddress && <p className="text-sm text-red-600">{errors.talentAddress}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 1: // Project Details
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectTitle">Project Title</Label>
                  <Input
                    id="projectTitle"
                    value={contractData.projectTitle}
                    onChange={(e) => updateContractData({ projectTitle: e.target.value })}
                    className={errors.projectTitle ? 'border-red-500' : ''}
                  />
                  {errors.projectTitle && <p className="text-sm text-red-600">{errors.projectTitle}</p>}
                </div>
                
                <div>
                  <Label htmlFor="projectDescription">Project Description</Label>
                  <Textarea
                    id="projectDescription"
                    value={contractData.projectDescription}
                    onChange={(e) => updateContractData({ projectDescription: e.target.value })}
                    className={errors.projectDescription ? 'border-red-500' : ''}
                    rows={4}
                  />
                  {errors.projectDescription && <p className="text-sm text-red-600">{errors.projectDescription}</p>}
                </div>
                
                <div>
                  <Label htmlFor="scopeOfWork">Scope of Work</Label>
                  <Textarea
                    id="scopeOfWork"
                    value={contractData.scopeOfWork}
                    onChange={(e) => updateContractData({ scopeOfWork: e.target.value })}
                    className={errors.scopeOfWork ? 'border-red-500' : ''}
                    rows={4}
                    placeholder="Detailed description of work to be performed..."
                  />
                  {errors.scopeOfWork && <p className="text-sm text-red-600">{errors.scopeOfWork}</p>}
                </div>
                
                <div>
                  <Label htmlFor="deliverables">Deliverables</Label>
                  <Textarea
                    id="deliverables"
                    value={contractData.deliverables}
                    onChange={(e) => updateContractData({ deliverables: e.target.value })}
                    className={errors.deliverables ? 'border-red-500' : ''}
                    rows={4}
                    placeholder="List of specific deliverables and outcomes..."
                  />
                  {errors.deliverables && <p className="text-sm text-red-600">{errors.deliverables}</p>}
                </div>
              </div>
            </div>
          </div>
        )

      case 2: // Financial Terms
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Terms</h3>
              <div className="space-y-4">
                {template.type === 'hourly' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hourlyRate">Hourly Rate (CAD)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={contractData.hourlyRate || ''}
                          onChange={(e) => updateContractData({ hourlyRate: parseFloat(e.target.value) })}
                          className={errors.hourlyRate ? 'border-red-500' : ''}
                        />
                        {errors.hourlyRate && <p className="text-sm text-red-600">{errors.hourlyRate}</p>}
                      </div>
                      <div>
                        <Label htmlFor="estimatedHours">Estimated Hours</Label>
                        <Input
                          id="estimatedHours"
                          type="number"
                          value={contractData.estimatedHours || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : undefined;
                            console.log('📊 Estimated Hours changed:', value);
                            updateContractData({ estimatedHours: value });
                          }}
                          className={errors.estimatedHours ? 'border-red-500' : ''}
                        />
                        {errors.estimatedHours && <p className="text-sm text-red-600">{errors.estimatedHours}</p>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <Label htmlFor="totalAmount">Total Contract Amount (CAD)</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      value={contractData.totalAmount || ''}
                      onChange={(e) => updateContractData({ totalAmount: parseFloat(e.target.value) })}
                      className={errors.totalAmount ? 'border-red-500' : ''}
                    />
                    {errors.totalAmount && <p className="text-sm text-red-600">{errors.totalAmount}</p>}
                  </div>
                )}
                
                <div>
                  <Label htmlFor="paymentSchedule">Payment Schedule</Label>
                  <Textarea
                    id="paymentSchedule"
                    value={contractData.paymentSchedule}
                    onChange={(e) => updateContractData({ paymentSchedule: e.target.value })}
                    className={errors.paymentSchedule ? 'border-red-500' : ''}
                    rows={3}
                    placeholder="Describe when and how payments will be made..."
                  />
                  {errors.paymentSchedule && <p className="text-sm text-red-600">{errors.paymentSchedule}</p>}
                </div>
              </div>
            </div>
          </div>
        )

      case 3: // Timeline
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={contractData.startDate}
                      onChange={(e) => updateContractData({ startDate: e.target.value })}
                      className={errors.startDate ? 'border-red-500' : ''}
                    />
                    {errors.startDate && <p className="text-sm text-red-600">{errors.startDate}</p>}
                  </div>
                  <div>
                    <Label htmlFor="completionDate">Completion Date</Label>
                    <Input
                      id="completionDate"
                      type="date"
                      value={contractData.completionDate}
                      onChange={(e) => updateContractData({ completionDate: e.target.value })}
                      className={errors.completionDate ? 'border-red-500' : ''}
                    />
                    {errors.completionDate && <p className="text-sm text-red-600">{errors.completionDate}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">Project Duration</Label>
                  <Input
                    id="duration"
                    value={contractData.duration}
                    onChange={(e) => updateContractData({ duration: e.target.value })}
                    className={errors.duration ? 'border-red-500' : ''}
                    placeholder="e.g., 8 weeks, 3 months"
                  />
                  {errors.duration && <p className="text-sm text-red-600">{errors.duration}</p>}
                </div>
                
                {/* Additional Legal Terms */}
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Additional Terms</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cancellationPolicy">Cancellation Policy <span className="text-gray-500 text-sm">(Optional)</span></Label>
                      <Textarea
                        id="cancellationPolicy"
                        value={contractData.cancellationPolicy || ''}
                        onChange={(e) => updateContractData({ cancellationPolicy: e.target.value })}
                        rows={3}
                        placeholder="Terms for contract cancellation, notice periods, and penalties..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="intellectualPropertyRights">Intellectual Property Rights <span className="text-gray-500 text-sm">(Optional)</span></Label>
                      <Textarea
                        id="intellectualPropertyRights"
                        value={contractData.intellectualPropertyRights || ''}
                        onChange={(e) => updateContractData({ intellectualPropertyRights: e.target.value })}
                        rows={3}
                        placeholder="Ownership and usage rights for work created under this contract..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="additionalTerms">Additional Terms <span className="text-gray-500 text-sm">(Optional)</span></Label>
                      <Textarea
                        id="additionalTerms"
                        value={contractData.additionalTerms || ''}
                        onChange={(e) => updateContractData({ additionalTerms: e.target.value })}
                        rows={3}
                        placeholder="Any other terms, conditions, or special requirements..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 4: // Milestones (only for fixed contracts with milestones)
        if (template.type === 'fixed' && template.defaultMilestones && contractData.totalAmount && contractData.startDate) {
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Project Milestones</h3>
                <p className="text-gray-600 mb-6">Review and customize the project milestones. You can edit the amounts, due dates, and deliverables.</p>
                
                <div className="space-y-4">
                  {(() => {
                    // Ensure we have a valid start date
                    const startDate = contractData.startDate ? new Date(contractData.startDate) : new Date();
                    const isValidStartDate = startDate instanceof Date && !isNaN(startDate.getTime());
                    
                    const generatedMilestones = generateMilestonesFromTemplate(
                      template, 
                      contractData.totalAmount, 
                      isValidStartDate ? startDate : new Date()
                    );
                    
                    // Initialize milestones in contract data if not already set
                    if (!contractData.milestones || contractData.milestones.length === 0) {
                      updateContractData({ milestones: generatedMilestones });
                    }
                    
                    const currentMilestones = contractData.milestones || generatedMilestones;
                    
                    return currentMilestones.map((milestone, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor={`milestone-${index}-name`}>Milestone Name</Label>
                            <Input
                              id={`milestone-${index}-name`}
                              value={milestone.name}
                              onChange={(e) => {
                                const updatedMilestones = [...currentMilestones];
                                updatedMilestones[index] = { ...milestone, name: e.target.value };
                                updateContractData({ milestones: updatedMilestones });
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`milestone-${index}-value`}>Amount (CAD)</Label>
                            <Input
                              id={`milestone-${index}-value`}
                              type="number"
                              value={milestone.value}
                              onChange={(e) => {
                                const updatedMilestones = [...currentMilestones];
                                updatedMilestones[index] = { ...milestone, value: parseFloat(e.target.value) || 0 };
                                updateContractData({ milestones: updatedMilestones });
                              }}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {contractData.totalAmount ? Math.round((milestone.value / contractData.totalAmount) * 100) : 0}% of total
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <Label htmlFor={`milestone-${index}-description`}>Description</Label>
                          <Textarea
                            id={`milestone-${index}-description`}
                            value={milestone.description}
                            onChange={(e) => {
                              const updatedMilestones = [...currentMilestones];
                              updatedMilestones[index] = { ...milestone, description: e.target.value };
                              updateContractData({ milestones: updatedMilestones });
                            }}
                            rows={2}
                          />
                        </div>
                        
                        <div className="mb-4">
                          <Label htmlFor={`milestone-${index}-dueDate`}>Due Date</Label>
                          <Input
                            id={`milestone-${index}-dueDate`}
                            type="date"
                            value={milestone.dueDate instanceof Date && !isNaN(milestone.dueDate.getTime()) 
                              ? milestone.dueDate.toISOString().split('T')[0] 
                              : ''}
                            onChange={(e) => {
                              const updatedMilestones = [...currentMilestones];
                              updatedMilestones[index] = { ...milestone, dueDate: new Date(e.target.value) };
                              updateContractData({ milestones: updatedMilestones });
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label>Deliverables</Label>
                          <div className="space-y-2 mt-2">
                            {milestone.deliverables.map((deliverable, deliverableIndex) => (
                              <div key={deliverableIndex} className="flex items-center space-x-2">
                                <Input
                                  value={deliverable}
                                  onChange={(e) => {
                                    const updatedMilestones = [...currentMilestones];
                                    const updatedDeliverables = [...milestone.deliverables];
                                    updatedDeliverables[deliverableIndex] = e.target.value;
                                    updatedMilestones[index] = { ...milestone, deliverables: updatedDeliverables };
                                    updateContractData({ milestones: updatedMilestones });
                                  }}
                                  placeholder="Deliverable description"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updatedMilestones = [...currentMilestones];
                                    const updatedDeliverables = milestone.deliverables.filter((_, i) => i !== deliverableIndex);
                                    updatedMilestones[index] = { ...milestone, deliverables: updatedDeliverables };
                                    updateContractData({ milestones: updatedMilestones });
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedMilestones = [...currentMilestones];
                                const updatedDeliverables = [...milestone.deliverables, ''];
                                updatedMilestones[index] = { ...milestone, deliverables: updatedDeliverables };
                                updateContractData({ milestones: updatedMilestones });
                              }}
                            >
                              Add Deliverable
                            </Button>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )
        }
        // Fall through to next case if not a milestone contract

      case (template.type === 'fixed' && template.defaultMilestones ? 4 : 3): // Timeline
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={contractData.startDate}
                      onChange={(e) => updateContractData({ startDate: e.target.value })}
                      className={errors.startDate ? 'border-red-500' : ''}
                    />
                    {errors.startDate && <p className="text-sm text-red-600">{errors.startDate}</p>}
                  </div>
                  
                  {template.type === 'fixed' && (
                    <div>
                      <Label htmlFor="completionDate">Completion Date</Label>
                      <Input
                        id="completionDate"
                        type="date"
                        value={contractData.completionDate || ''}
                        onChange={(e) => updateContractData({ completionDate: e.target.value })}
                        className={errors.completionDate ? 'border-red-500' : ''}
                      />
                      {errors.completionDate && <p className="text-sm text-red-600">{errors.completionDate}</p>}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="duration">Project Duration</Label>
                  <Input
                    id="duration"
                    value={contractData.duration}
                    onChange={(e) => updateContractData({ duration: e.target.value })}
                    className={errors.duration ? 'border-red-500' : ''}
                    placeholder="e.g., 8 weeks, 3 months"
                  />
                  {errors.duration && <p className="text-sm text-red-600">{errors.duration}</p>}
                </div>
                
                {/* Additional Legal Terms */}
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Additional Terms</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cancellationPolicy">Cancellation Policy <span className="text-gray-500 text-sm">(Optional)</span></Label>
                      <Textarea
                        id="cancellationPolicy"
                        value={contractData.cancellationPolicy || ''}
                        onChange={(e) => updateContractData({ cancellationPolicy: e.target.value })}
                        rows={3}
                        placeholder="Terms for contract cancellation, notice periods, and penalties..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="intellectualPropertyRights">Intellectual Property Rights <span className="text-gray-500 text-sm">(Optional)</span></Label>
                      <Textarea
                        id="intellectualPropertyRights"
                        value={contractData.intellectualPropertyRights || ''}
                        onChange={(e) => updateContractData({ intellectualPropertyRights: e.target.value })}
                        rows={3}
                        placeholder="Ownership and usage rights for work created under this contract..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="additionalTerms">Additional Terms <span className="text-gray-500 text-sm">(Optional)</span></Label>
                      <Textarea
                        id="additionalTerms"
                        value={contractData.additionalTerms || ''}
                        onChange={(e) => updateContractData({ additionalTerms: e.target.value })}
                        rows={3}
                        placeholder="Any other terms, conditions, or special requirements..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case (template.type === 'fixed' && template.defaultMilestones ? 5 : 4): // Review
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Review</h3>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Contract Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Template:</span> {template.name}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> 
                        <Badge className="ml-2">{template.type}</Badge>
                      </div>
                      <div>
                        <span className="font-medium">Business:</span> {contractData.businessName}
                      </div>
                      <div>
                        <span className="font-medium">Talent:</span> {contractData.talentName}
                      </div>
                      <div>
                        <span className="font-medium">Project:</span> {contractData.projectTitle}
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span> {contractData.startDate}
                      </div>
                      {template.type === 'hourly' ? (
                        <>
                          <div>
                            <span className="font-medium">Hourly Rate:</span> ${contractData.hourlyRate}/hour
                          </div>
                          <div>
                            <span className="font-medium">Estimated Hours:</span> {contractData.estimatedHours}
                          </div>
                        </>
                      ) : (
                        <div>
                          <span className="font-medium">Total Amount:</span> ${contractData.totalAmount}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Duration:</span> {contractData.duration}
                      </div>
                    </div>
                    
                    {/* Additional sections for enhanced contract details */}
                    {(contractData.scopeOfWork || contractData.deliverables || contractData.paymentSchedule) && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Project Details</h4>
                        <div className="space-y-2 text-sm">
                          {contractData.scopeOfWork && (
                            <div>
                              <span className="font-medium">Scope of Work:</span>
                              <p className="text-gray-600 mt-1">{contractData.scopeOfWork}</p>
                            </div>
                          )}
                          {contractData.deliverables && (
                            <div>
                              <span className="font-medium">Deliverables:</span>
                              <p className="text-gray-600 mt-1">{contractData.deliverables}</p>
                            </div>
                          )}
                          {contractData.paymentSchedule && (
                            <div>
                              <span className="font-medium">Payment Schedule:</span>
                              <p className="text-gray-600 mt-1">{contractData.paymentSchedule}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Milestones section for fixed contracts */}
                    {template.type === 'fixed' && template.defaultMilestones && contractData.milestones && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Project Milestones</h4>
                        <div className="space-y-3">
                          {contractData.milestones.map((milestone, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-medium text-gray-900">{milestone.name}</h5>
                                  <div className="text-right">
                                    <div className="font-medium text-green-600">${milestone.value.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">
                                      {Math.round((milestone.value / (contractData.totalAmount || 1)) * 100)}% of total
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                                <div className="text-xs text-gray-500">
                                  Due: {milestone.dueDate instanceof Date && !isNaN(milestone.dueDate.getTime()) 
                                    ? milestone.dueDate.toLocaleDateString() 
                                    : 'Not set'}
                                </div>
                                {milestone.deliverables.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-xs font-medium text-gray-700 mb-1">Deliverables:</div>
                                    <ul className="text-xs text-gray-600 list-disc list-inside">
                                      {milestone.deliverables.map((deliverable, idx) => (
                                        <li key={idx}>{deliverable}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Additional legal terms */}
                    {(contractData.cancellationPolicy || contractData.intellectualPropertyRights || contractData.additionalTerms) && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Additional Terms</h4>
                        <div className="space-y-2 text-sm">
                          {contractData.cancellationPolicy && (
                            <div>
                              <span className="font-medium">Cancellation Policy:</span>
                              <p className="text-gray-600 mt-1">{contractData.cancellationPolicy}</p>
                            </div>
                          )}
                          {contractData.intellectualPropertyRights && (
                            <div>
                              <span className="font-medium">Intellectual Property Rights:</span>
                              <p className="text-gray-600 mt-1">{contractData.intellectualPropertyRights}</p>
                            </div>
                          )}
                          {contractData.additionalTerms && (
                            <div>
                              <span className="font-medium">Additional Terms:</span>
                              <p className="text-gray-600 mt-1">{contractData.additionalTerms}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Contract</h2>
          <p className="text-gray-600">Using template: {template.name}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isCompleted 
                  ? 'bg-green-500 border-green-500 text-white'
                  : isActive 
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              Create Contract
            </>
          ) : (
            <>
              Next
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
