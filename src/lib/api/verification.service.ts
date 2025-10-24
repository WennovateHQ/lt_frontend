import { apiClient } from './client'

export interface EmailVerification {
  id: string
  userId: string
  email: string
  token: string
  status: 'pending' | 'verified' | 'expired' | 'failed'
  sentAt: string
  verifiedAt?: string
  expiresAt: string
  attempts: number
  maxAttempts: number
}

export interface PhoneVerification {
  id: string
  userId: string
  phoneNumber: string
  countryCode: string
  verificationCode: string
  status: 'pending' | 'verified' | 'expired' | 'failed'
  method: 'sms' | 'call'
  sentAt: string
  verifiedAt?: string
  expiresAt: string
  attempts: number
  maxAttempts: number
}

export interface BusinessVerification {
  id: string
  userId: string
  businessName: string
  registrationNumber: string
  businessType: 'corporation' | 'partnership' | 'sole_proprietorship' | 'non_profit' | 'other'
  jurisdiction: string
  status: 'pending' | 'verified' | 'rejected' | 'requires_documents'
  
  documents: Array<{
    id: string
    type: 'business_registration' | 'tax_certificate' | 'operating_agreement' | 'articles_incorporation' | 'other'
    fileName: string
    fileUrl: string
    uploadedAt: string
    status: 'pending' | 'approved' | 'rejected'
    rejectionReason?: string
  }>
  
  verificationData?: {
    registeredAddress: string
    incorporationDate: string
    directors: Array<{
      name: string
      position: string
    }>
    businessActivity: string
    website?: string
  }
  
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: string
  notes?: string
  
  createdAt: string
  updatedAt: string
}

export interface IdentityVerification {
  id: string
  userId: string
  status: 'pending' | 'verified' | 'rejected' | 'requires_documents'
  
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    nationality: string
    address: {
      street: string
      city: string
      province: string
      postalCode: string
      country: string
    }
  }
  
  documents: Array<{
    id: string
    type: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'bank_statement' | 'other'
    fileName: string
    fileUrl: string
    uploadedAt: string
    status: 'pending' | 'approved' | 'rejected'
    rejectionReason?: string
    extractedData?: Record<string, any>
  }>
  
  verificationChecks: {
    documentAuthenticity: 'pending' | 'passed' | 'failed'
    faceMatch: 'pending' | 'passed' | 'failed'
    addressVerification: 'pending' | 'passed' | 'failed'
    sanctionsCheck: 'pending' | 'passed' | 'failed'
  }
  
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: string
  
  createdAt: string
  updatedAt: string
}

export interface SkillVerification {
  id: string
  userId: string
  skillId: string
  skillName: string
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  status: 'pending' | 'verified' | 'rejected'
  
  verificationMethod: 'test' | 'portfolio' | 'certificate' | 'reference' | 'interview'
  
  evidence: Array<{
    id: string
    type: 'certificate' | 'portfolio_item' | 'test_result' | 'reference_letter' | 'work_sample'
    fileName?: string
    fileUrl?: string
    description: string
    uploadedAt: string
  }>
  
  testResults?: {
    testId: string
    testName: string
    score: number
    maxScore: number
    percentile: number
    completedAt: string
  }
  
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: string
  
  createdAt: string
  updatedAt: string
}

export class VerificationService {
  // Email Verification
  async sendEmailVerification(email?: string): Promise<{
    message: string
    expiresAt: string
  }> {
    return apiClient.post('/verification/email/send', { email })
  }

  async verifyEmail(token: string): Promise<{
    success: boolean
    message: string
  }> {
    return apiClient.post('/verification/email/verify', { token })
  }

  async resendEmailVerification(): Promise<{
    message: string
    expiresAt: string
  }> {
    return apiClient.post('/verification/email/resend')
  }

  async getEmailVerificationStatus(): Promise<EmailVerification> {
    return apiClient.get<EmailVerification>('/verification/email/status')
  }

  // Phone Verification
  async sendPhoneVerification(phoneNumber: string, countryCode: string, method: 'sms' | 'call' = 'sms'): Promise<{
    message: string
    expiresAt: string
    maskedNumber: string
  }> {
    return apiClient.post('/verification/phone/send', { phoneNumber, countryCode, method })
  }

  async verifyPhone(verificationCode: string): Promise<{
    success: boolean
    message: string
  }> {
    return apiClient.post('/verification/phone/verify', { verificationCode })
  }

  async resendPhoneVerification(): Promise<{
    message: string
    expiresAt: string
  }> {
    return apiClient.post('/verification/phone/resend')
  }

  async getPhoneVerificationStatus(): Promise<PhoneVerification> {
    return apiClient.get<PhoneVerification>('/verification/phone/status')
  }

  // Business Verification
  async submitBusinessVerification(data: {
    businessName: string
    registrationNumber: string
    businessType: BusinessVerification['businessType']
    jurisdiction: string
    verificationData?: BusinessVerification['verificationData']
  }): Promise<BusinessVerification> {
    return apiClient.post<BusinessVerification>('/verification/business', data)
  }

  async uploadBusinessDocument(verificationId: string, file: File, documentType: string): Promise<{
    documentId: string
    message: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)

    return apiClient.post(`/verification/business/${verificationId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async getBusinessVerificationStatus(): Promise<BusinessVerification> {
    return apiClient.get<BusinessVerification>('/verification/business/status')
  }

  async updateBusinessVerification(verificationId: string, data: Partial<BusinessVerification>): Promise<BusinessVerification> {
    return apiClient.put<BusinessVerification>(`/verification/business/${verificationId}`, data)
  }

  // Identity Verification
  async submitIdentityVerification(data: {
    personalInfo: IdentityVerification['personalInfo']
  }): Promise<IdentityVerification> {
    return apiClient.post<IdentityVerification>('/verification/identity', data)
  }

  async uploadIdentityDocument(verificationId: string, file: File, documentType: string): Promise<{
    documentId: string
    message: string
    extractedData?: Record<string, any>
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)

    return apiClient.post(`/verification/identity/${verificationId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async getIdentityVerificationStatus(): Promise<IdentityVerification> {
    return apiClient.get<IdentityVerification>('/verification/identity/status')
  }

  async requestIdentityReview(verificationId: string): Promise<{
    message: string
    estimatedReviewTime: string
  }> {
    return apiClient.post(`/verification/identity/${verificationId}/request-review`)
  }

  // Skill Verification
  async submitSkillVerification(data: {
    skillId: string
    proficiencyLevel: SkillVerification['proficiencyLevel']
    verificationMethod: SkillVerification['verificationMethod']
  }): Promise<SkillVerification> {
    return apiClient.post<SkillVerification>('/verification/skills', data)
  }

  async uploadSkillEvidence(verificationId: string, file: File, evidenceType: string, description: string): Promise<{
    evidenceId: string
    message: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('evidenceType', evidenceType)
    formData.append('description', description)

    return apiClient.post(`/verification/skills/${verificationId}/evidence`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async getSkillVerifications(): Promise<SkillVerification[]> {
    return apiClient.get<SkillVerification[]>('/verification/skills')
  }

  async getSkillVerification(verificationId: string): Promise<SkillVerification> {
    return apiClient.get<SkillVerification>(`/verification/skills/${verificationId}`)
  }

  async takeSkillTest(skillId: string): Promise<{
    testId: string
    testUrl: string
    timeLimit: number
    instructions: string
  }> {
    return apiClient.post(`/verification/skills/test/${skillId}`)
  }

  async submitSkillTestResults(testId: string, answers: Record<string, any>): Promise<{
    score: number
    maxScore: number
    percentile: number
    passed: boolean
    verificationId?: string
  }> {
    return apiClient.post(`/verification/skills/test/${testId}/submit`, { answers })
  }

  // General Verification Status
  async getVerificationOverview(): Promise<{
    email: EmailVerification
    phone?: PhoneVerification
    identity?: IdentityVerification
    business?: BusinessVerification
    skills: SkillVerification[]
    overallStatus: 'unverified' | 'partially_verified' | 'fully_verified'
    completionPercentage: number
    nextSteps: Array<{
      type: string
      title: string
      description: string
      priority: 'high' | 'medium' | 'low'
    }>
  }> {
    return apiClient.get('/verification/overview')
  }

  // Admin methods
  async getVerificationQueue(type: 'identity' | 'business' | 'skills', status?: string): Promise<{
    verifications: Array<IdentityVerification | BusinessVerification | SkillVerification>
    total: number
    pending: number
  }> {
    const params = status ? `?status=${status}` : ''
    return apiClient.get(`/verification/admin/${type}/queue${params}`)
  }

  async approveVerification(type: 'identity' | 'business' | 'skills', verificationId: string, notes?: string): Promise<{
    message: string
  }> {
    return apiClient.post(`/verification/admin/${type}/${verificationId}/approve`, { notes })
  }

  async rejectVerification(type: 'identity' | 'business' | 'skills', verificationId: string, reason: string, notes?: string): Promise<{
    message: string
  }> {
    return apiClient.post(`/verification/admin/${type}/${verificationId}/reject`, { reason, notes })
  }

  async requestMoreDocuments(type: 'identity' | 'business', verificationId: string, requiredDocuments: string[], message: string): Promise<{
    message: string
  }> {
    return apiClient.post(`/verification/admin/${type}/${verificationId}/request-documents`, {
      requiredDocuments,
      message
    })
  }

  // Verification Analytics
  async getVerificationStats(): Promise<{
    totalVerifications: number
    verificationsByType: Record<string, number>
    verificationsByStatus: Record<string, number>
    averageProcessingTime: number
    successRate: number
    monthlyTrends: Array<{
      month: string
      submitted: number
      approved: number
      rejected: number
    }>
  }> {
    return apiClient.get('/verification/admin/stats')
  }

  // Bulk operations
  async bulkApproveVerifications(type: 'identity' | 'business' | 'skills', verificationIds: string[]): Promise<{
    successful: number
    failed: number
    errors: Array<{
      verificationId: string
      error: string
    }>
  }> {
    return apiClient.post(`/verification/admin/${type}/bulk-approve`, { verificationIds })
  }

  async bulkRejectVerifications(type: 'identity' | 'business' | 'skills', verificationIds: string[], reason: string): Promise<{
    successful: number
    failed: number
    errors: Array<{
      verificationId: string
      error: string
    }>
  }> {
    return apiClient.post(`/verification/admin/${type}/bulk-reject`, { verificationIds, reason })
  }
}

export const verificationService = new VerificationService()
