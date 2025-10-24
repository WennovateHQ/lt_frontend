export interface ContractTemplate {
  id: string
  name: string
  jurisdiction: 'BC' | 'AB' | 'ON' | 'QC'
  type: 'hourly' | 'fixed'
  description: string
  template: string
  requiredFields: string[]
  optionalFields: string[]
  defaultMilestones?: MilestoneTemplate[]
}

export interface MilestoneTemplate {
  id: string
  name: string
  description: string
  percentage: number // % of total contract value
  deliverables: string[]
  dueOffset?: number // days from start date
}

export interface Contract {
  id: string
  projectId: string
  businessId: string
  talentId: string
  templateId: string
  status: 'draft' | 'pending_signature' | 'active' | 'completed' | 'cancelled' | 'disputed'
  type: 'hourly' | 'fixed'
  
  // Contract Details
  title: string
  description: string
  scope: string
  deliverables: string[]
  
  // Financial Terms
  totalValue: number
  currency: 'CAD'
  paymentTerms: string
  
  // Timeline
  startDate: Date
  endDate?: Date
  duration: string
  
  // Milestones (for milestone contracts)
  milestones?: Milestone[]
  
  // Legal Terms
  jurisdiction: string
  governingLaw: string
  disputeResolution: string
  
  // Signatures
  businessSignature?: {
    signedAt: Date
    signedBy: string
    ipAddress: string
  }
  talentSignature?: {
    signedAt: Date
    signedBy: string
    ipAddress: string
  }
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Milestone {
  id: string
  contractId: string
  name: string
  description: string
  deliverables: string[]
  value: number
  dueDate: Date
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'paid' | 'disputed'
  submittedAt?: Date
  approvedAt?: Date
  paidAt?: Date
  notes?: string
  attachments?: string[]
}

// BC-specific contract templates
export const contractTemplates: ContractTemplate[] = [
  {
    id: 'bc-fixed-web-dev',
    name: 'Fixed Price Web Development Contract (BC)',
    jurisdiction: 'BC',
    type: 'fixed',
    description: 'Standard fixed-price contract for web development projects in British Columbia',
    requiredFields: [
      'projectTitle',
      'projectDescription',
      'deliverables',
      'totalAmount',
      'startDate',
      'completionDate',
      'paymentSchedule'
    ],
    optionalFields: [
      'additionalTerms',
      'cancellationPolicy',
      'intellectualPropertyRights'
    ],
    defaultMilestones: [
      {
        id: 'milestone-1',
        name: 'Project Kickoff & Planning',
        description: 'Initial project setup, requirements finalization, and project plan approval',
        percentage: 25,
        deliverables: [
          'Detailed project specification document',
          'Technical architecture plan',
          'Project timeline and milestones',
          'Development environment setup'
        ],
        dueOffset: 7
      },
      {
        id: 'milestone-2',
        name: 'Development Phase 1',
        description: 'Core functionality development and initial implementation',
        percentage: 40,
        deliverables: [
          'Core application structure',
          'Database design and implementation',
          'Basic user interface',
          'Initial testing results'
        ],
        dueOffset: 28
      },
      {
        id: 'milestone-3',
        name: 'Development Phase 2',
        description: 'Feature completion and integration testing',
        percentage: 25,
        deliverables: [
          'Complete feature implementation',
          'Integration testing',
          'Performance optimization',
          'Security implementation'
        ],
        dueOffset: 49
      },
      {
        id: 'milestone-4',
        name: 'Final Delivery',
        description: 'Final testing, deployment, and project handover',
        percentage: 10,
        deliverables: [
          'Final testing and bug fixes',
          'Production deployment',
          'Documentation and training',
          'Project handover and support setup'
        ],
        dueOffset: 56
      }
    ],
    template: `
INDEPENDENT CONTRACTOR AGREEMENT
(Fixed Price Web Development - British Columbia)

This Agreement is made between:

BUSINESS: \${businessName}
Address: \${businessAddress}
("Client")

CONTRACTOR: \${talentName}
Address: \${talentAddress}
("Contractor")

PROJECT DETAILS:
Title: \${projectTitle}
Description: \${projectDescription}

SCOPE OF WORK:
\${scopeOfWork}

DELIVERABLES:
\${deliverables}

COMPENSATION:
Total Contract Value: $\${totalAmount} CAD
Payment Schedule: \${paymentSchedule}

TIMELINE:
Start Date: \${startDate}
Completion Date: \${completionDate}
Duration: \${duration}

TERMS AND CONDITIONS:

1. INDEPENDENT CONTRACTOR RELATIONSHIP
The Contractor is an independent contractor and not an employee of the Client. The Contractor shall be responsible for all taxes, including but not limited to income tax, CPP, and EI contributions.

2. INTELLECTUAL PROPERTY
Upon full payment, all work product created under this Agreement shall be owned by the Client. The Contractor retains the right to use general knowledge, skills, and experience gained during the project.

3. CONFIDENTIALITY
The Contractor agrees to maintain confidentiality of all Client information and not to disclose any confidential information to third parties.

4. PAYMENT TERMS
- Payments shall be made according to the milestone schedule
- Invoices are due within 30 days of receipt
- Late payments may incur interest charges of 1.5% per month

5. TERMINATION
Either party may terminate this Agreement with 14 days written notice. Upon termination, the Contractor shall be paid for work completed to date.

6. DISPUTE RESOLUTION
Any disputes shall be resolved through mediation in British Columbia. If mediation fails, disputes shall be resolved through binding arbitration under the laws of British Columbia.

7. GOVERNING LAW
This Agreement shall be governed by the laws of British Columbia and Canada.

8. LIMITATION OF LIABILITY
The Contractor's liability shall not exceed the total contract value.

SIGNATURES:
Client: _________________________ Date: _________
Contractor: _________________________ Date: _________

This contract is governed by the laws of British Columbia, Canada.
    `
  },
  {
    id: 'bc-hourly-consulting',
    name: 'Hourly Consulting Contract (BC)',
    jurisdiction: 'BC',
    type: 'hourly',
    description: 'Hourly rate contract for consulting and ongoing services in British Columbia',
    requiredFields: [
      'serviceDescription',
      'hourlyRate',
      'estimatedHours',
      'startDate',
      'invoicingSchedule'
    ],
    optionalFields: [
      'maximumHours',
      'minimumHours',
      'expensePolicy',
      'terminationNotice'
    ],
    template: `
HOURLY CONSULTING AGREEMENT
(British Columbia)

This Agreement is made between:

CLIENT: \${businessName}
Address: \${businessAddress}

CONSULTANT: \${talentName}
Address: \${talentAddress}

SERVICES:
\${serviceDescription}

COMPENSATION:
Hourly Rate: $\${hourlyRate} CAD
Estimated Hours: \${estimatedHours}
Maximum Hours: \${maximumHours}

INVOICING:
\${invoicingSchedule}

TERMS:
- Time tracking required for all billable hours
- Invoices submitted \${invoicingFrequency}
- Payment due within 30 days
- Expenses require pre-approval

This contract is governed by the laws of British Columbia, Canada.

SIGNATURES:
Client: _________________________ Date: _________
Consultant: _________________________ Date: _________
    `
  }
]

// Helper functions
export const getTemplateById = (id: string): ContractTemplate | null => {
  return contractTemplates.find(template => template.id === id) || null
}

export const getTemplatesByJurisdiction = (jurisdiction: 'BC' | 'AB' | 'ON' | 'QC'): ContractTemplate[] => {
  return contractTemplates.filter(template => template.jurisdiction === jurisdiction)
}

export const getTemplatesByType = (type: 'hourly' | 'fixed'): ContractTemplate[] => {
  return contractTemplates.filter(template => template.type === type)
}

export const generateMilestonesFromTemplate = (
  template: ContractTemplate,
  totalValue: number,
  startDate: Date
): Milestone[] => {
  if (!template.defaultMilestones) return []
  
  return template.defaultMilestones.map((milestoneTemplate, index) => {
    const dueDate = new Date(startDate)
    if (milestoneTemplate.dueOffset) {
      dueDate.setDate(startDate.getDate() + milestoneTemplate.dueOffset)
    }
    
    return {
      id: `milestone-${Date.now()}-${index}`,
      contractId: '', // Will be set when contract is created
      name: milestoneTemplate.name,
      description: milestoneTemplate.description,
      deliverables: milestoneTemplate.deliverables,
      value: Math.round(totalValue * (milestoneTemplate.percentage / 100)),
      dueDate,
      status: 'pending'
    }
  })
}

// Contract status helpers
export const getStatusColor = (status: Contract['status']) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'pending_signature':
      return 'bg-yellow-100 text-yellow-800'
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'disputed':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getMilestoneStatusColor = (status: Milestone['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-gray-100 text-gray-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'submitted':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'paid':
      return 'bg-emerald-100 text-emerald-800'
    case 'disputed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
