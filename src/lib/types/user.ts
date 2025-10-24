export interface TalentProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  displayName?: string
  email: string
  avatar?: string
  title: string
  bio: string
  hourlyRate: number
  phone?: string
  website?: string
  gstHstNumber?: string
  location?: {
    city: string
    province: string
    country: string
  }
  skills: TalentSkill[]
  portfolio?: PortfolioItem[]
  credentials?: Credential[]
  availability: string
  yearsOfExperience?: number
  rating?: number
  completedProjects?: number
  responseTime?: string
  successRate?: number
  createdAt: Date
  updatedAt: Date
}

export interface TalentSkill {
  id: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience: number
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  imageUrl?: string
  projectUrl?: string
  technologies: string[]
  completedAt: Date
}

export interface Credential {
  id: string
  type: 'degree' | 'certification' | 'license' | 'award'
  title: string
  institution: string
  year: number
  expiryDate?: Date
  verified: boolean
}

export interface BusinessProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  companyName: string
  companySize?: string
  industry?: string
  bio?: string
  phone?: string
  website?: string
  gstHstNumber?: string
  location?: {
    city: string
    province: string
    country: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  userType: 'business' | 'talent' | 'admin'
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
  profile?: TalentProfile | BusinessProfile
}

export type UserType = 'talent' | 'business' | 'admin'
