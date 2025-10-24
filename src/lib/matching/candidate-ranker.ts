import { calculateSkillsMatch, SkillRequirement, TalentSkill, SkillsMatchSummary } from './skills-matcher'
import { calculateLocationMatch, Location, LocationPreference, LocationMatchResult } from './location-matcher'

export interface TalentProfile {
  id: string
  firstName: string
  lastName: string
  displayName: string
  avatar?: string
  location: Location
  skills: TalentSkill[]
  hourlyRate: { min: number; max: number }
  availability: {
    hoursPerWeek: number
    startDate: Date
    workArrangement: 'remote' | 'hybrid' | 'onsite'
    travelRadius?: number
  }
  experience: {
    totalYears: number
    relevantYears: number
    completedProjects: number
    successRate: number
  }
  reputation: {
    rating: number
    reviewCount: number
    responseTime: number // hours
    reliability: number // 0-100
  }
  portfolio: {
    projectCount: number
    relevantProjects: number
    hasRelevantWork: boolean
  }
  verification: {
    identityVerified: boolean
    skillsVerified: boolean
    backgroundChecked: boolean
    referencesChecked: boolean
  }
  preferences?: LocationPreference
}

export interface ProjectRequirements {
  id: string
  title: string
  skills: SkillRequirement[]
  location: Location
  locationPreferences: LocationPreference
  budget: { min: number; max: number; type: 'hourly' | 'fixed' }
  timeline: {
    startDate: Date
    duration: number // weeks
    deadline?: Date
    isUrgent: boolean
  }
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  workArrangement: 'remote' | 'hybrid' | 'onsite'
  industryExperience?: string[]
  teamSize?: number
  clientType: 'startup' | 'sme' | 'enterprise' | 'government' | 'nonprofit'
}

export interface CandidateMatch {
  talent: TalentProfile
  overallScore: number
  ranking: number
  skillsMatch: SkillsMatchSummary
  locationMatch: LocationMatchResult
  budgetMatch: BudgetMatchResult
  availabilityMatch: AvailabilityMatchResult
  experienceMatch: ExperienceMatchResult
  reputationScore: ReputationScore
  verificationScore: VerificationScore
  portfolioMatch: PortfolioMatchResult
  riskAssessment: RiskAssessment
  recommendations: string[]
  strengths: string[]
  concerns: string[]
  fitScore: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface BudgetMatchResult {
  isWithinBudget: boolean
  budgetAlignment: number // 0-100
  proposedRate?: number
  costEfficiency: number // 0-100
  valueScore: number // 0-100
  recommendations: string[]
}

export interface AvailabilityMatchResult {
  canStartOnTime: boolean
  hasCapacity: boolean
  scheduleAlignment: number // 0-100
  timelineCompatibility: number // 0-100
  recommendations: string[]
}

export interface ExperienceMatchResult {
  levelMatch: boolean
  experienceScore: number // 0-100
  relevantExperience: number
  projectComplexityFit: number // 0-100
  recommendations: string[]
}

export interface ReputationScore {
  overallScore: number // 0-100
  ratingScore: number
  reliabilityScore: number
  responsivenessScore: number
  trackRecordScore: number
  recommendations: string[]
}

export interface VerificationScore {
  overallScore: number // 0-100
  trustScore: number
  credibilityScore: number
  riskLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
}

export interface PortfolioMatchResult {
  relevanceScore: number // 0-100
  qualityScore: number // 0-100
  diversityScore: number // 0-100
  hasRelevantWork: boolean
  recommendations: string[]
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high'
  riskFactors: string[]
  mitigationStrategies: string[]
  confidenceLevel: number // 0-100
}

// Scoring weights for different criteria
const SCORING_WEIGHTS = {
  skills: 0.30,        // 30% - Most important
  location: 0.20,      // 20% - Critical for local focus
  budget: 0.15,        // 15% - Important for project viability
  experience: 0.12,    // 12% - Important for quality
  reputation: 0.10,    // 10% - Trust and reliability
  availability: 0.08,  // 8% - Timeline compatibility
  verification: 0.03,  // 3% - Trust factor
  portfolio: 0.02      // 2% - Additional validation
}

/**
 * Rank candidates for a project
 */
export function rankCandidates(
  candidates: TalentProfile[],
  projectRequirements: ProjectRequirements
): CandidateMatch[] {
  const matches: CandidateMatch[] = []
  
  for (const talent of candidates) {
    const match = evaluateCandidate(talent, projectRequirements)
    matches.push(match)
  }
  
  // Sort by overall score (descending)
  matches.sort((a, b) => b.overallScore - a.overallScore)
  
  // Assign rankings
  matches.forEach((match, index) => {
    match.ranking = index + 1
  })
  
  return matches
}

/**
 * Evaluate a single candidate against project requirements
 */
export function evaluateCandidate(
  talent: TalentProfile,
  project: ProjectRequirements
): CandidateMatch {
  // Calculate individual match scores
  const skillsMatch = calculateSkillsMatch(talent.skills, project.skills)
  const locationMatch = calculateLocationMatch(
    talent.location,
    project.location,
    project.locationPreferences,
    talent.preferences
  )
  const budgetMatch = calculateBudgetMatch(talent, project)
  const availabilityMatch = calculateAvailabilityMatch(talent, project)
  const experienceMatch = calculateExperienceMatch(talent, project)
  const reputationScore = calculateReputationScore(talent)
  const verificationScore = calculateVerificationScore(talent)
  const portfolioMatch = calculatePortfolioMatch(talent, project)
  
  // Calculate weighted overall score
  const overallScore = Math.round(
    (skillsMatch.overallScore * SCORING_WEIGHTS.skills) +
    (locationMatch.matchScore * SCORING_WEIGHTS.location) +
    (budgetMatch.valueScore * SCORING_WEIGHTS.budget) +
    (experienceMatch.experienceScore * SCORING_WEIGHTS.experience) +
    (reputationScore.overallScore * SCORING_WEIGHTS.reputation) +
    (availabilityMatch.scheduleAlignment * SCORING_WEIGHTS.availability) +
    (verificationScore.overallScore * SCORING_WEIGHTS.verification) +
    (portfolioMatch.relevanceScore * SCORING_WEIGHTS.portfolio)
  )
  
  // Determine fit score
  let fitScore: 'excellent' | 'good' | 'fair' | 'poor'
  if (overallScore >= 85) fitScore = 'excellent'
  else if (overallScore >= 70) fitScore = 'good'
  else if (overallScore >= 55) fitScore = 'fair'
  else fitScore = 'poor'
  
  // Generate recommendations, strengths, and concerns
  const { recommendations, strengths, concerns } = generateInsights(
    talent,
    project,
    { skillsMatch, locationMatch, budgetMatch, availabilityMatch, experienceMatch, reputationScore }
  )
  
  // Assess risks
  const riskAssessment = assessRisks(talent, project, overallScore)
  
  return {
    talent,
    overallScore,
    ranking: 0, // Will be set after sorting
    skillsMatch,
    locationMatch,
    budgetMatch,
    availabilityMatch,
    experienceMatch,
    reputationScore,
    verificationScore,
    portfolioMatch,
    riskAssessment,
    recommendations,
    strengths,
    concerns,
    fitScore
  }
}

/**
 * Calculate budget match
 */
function calculateBudgetMatch(talent: TalentProfile, project: ProjectRequirements): BudgetMatchResult {
  const recommendations: string[] = []
  let budgetAlignment = 0
  let costEfficiency = 0
  let valueScore = 0
  
  const talentMinRate = talent.hourlyRate.min
  const talentMaxRate = talent.hourlyRate.max
  const projectMinBudget = project.budget.min
  const projectMaxBudget = project.budget.max
  
  // Check if talent's rate range overlaps with project budget
  const isWithinBudget = talentMinRate <= projectMaxBudget && talentMaxRate >= projectMinBudget
  
  if (isWithinBudget) {
    budgetAlignment = 100
    recommendations.push("✓ Rate aligns with project budget")
  } else if (talentMinRate > projectMaxBudget) {
    const overage = ((talentMinRate - projectMaxBudget) / projectMaxBudget) * 100
    if (overage <= 20) {
      budgetAlignment = 70
      recommendations.push("Slightly above budget - may be negotiable")
    } else if (overage <= 50) {
      budgetAlignment = 40
      recommendations.push("Above budget - significant negotiation needed")
    } else {
      budgetAlignment = 20
      recommendations.push("Well above budget - unlikely to be affordable")
    }
  } else {
    budgetAlignment = 80
    recommendations.push("Below budget - good value opportunity")
  }
  
  // Cost efficiency (lower rates get higher scores)
  const avgTalentRate = (talentMinRate + talentMaxRate) / 2
  const avgProjectBudget = (projectMinBudget + projectMaxBudget) / 2
  
  if (avgTalentRate <= avgProjectBudget * 0.8) {
    costEfficiency = 90
    recommendations.push("Excellent cost efficiency")
  } else if (avgTalentRate <= avgProjectBudget) {
    costEfficiency = 75
    recommendations.push("Good cost efficiency")
  } else if (avgTalentRate <= avgProjectBudget * 1.2) {
    costEfficiency = 60
    recommendations.push("Moderate cost efficiency")
  } else {
    costEfficiency = 30
    recommendations.push("Lower cost efficiency")
  }
  
  // Value score (considers experience and reputation vs cost)
  const experienceMultiplier = Math.min(talent.experience.totalYears / 5, 2)
  const reputationMultiplier = talent.reputation.rating / 5
  const baseValue = (costEfficiency * experienceMultiplier * reputationMultiplier) / 2
  
  valueScore = Math.min(100, Math.round(baseValue))
  
  return {
    isWithinBudget,
    budgetAlignment,
    costEfficiency,
    valueScore,
    recommendations
  }
}

/**
 * Calculate availability match
 */
function calculateAvailabilityMatch(talent: TalentProfile, project: ProjectRequirements): AvailabilityMatchResult {
  const recommendations: string[] = []
  let scheduleAlignment = 0
  let timelineCompatibility = 0
  
  // Check start date compatibility
  const canStartOnTime = talent.availability.startDate <= project.timeline.startDate
  if (canStartOnTime) {
    scheduleAlignment += 50
    recommendations.push("✓ Can start on time")
  } else {
    const delayDays = Math.ceil((talent.availability.startDate.getTime() - project.timeline.startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (delayDays <= 7) {
      scheduleAlignment += 40
      recommendations.push(`Minor delay: ${delayDays} days`)
    } else if (delayDays <= 14) {
      scheduleAlignment += 25
      recommendations.push(`Moderate delay: ${delayDays} days`)
    } else {
      scheduleAlignment += 10
      recommendations.push(`Significant delay: ${delayDays} days`)
    }
  }
  
  // Check capacity
  const requiredHours = 40 // Assume full-time project
  const hasCapacity = talent.availability.hoursPerWeek >= requiredHours
  if (hasCapacity) {
    scheduleAlignment += 30
    recommendations.push("✓ Has sufficient capacity")
  } else {
    const capacityPercentage = (talent.availability.hoursPerWeek / requiredHours) * 100
    scheduleAlignment += Math.round(capacityPercentage * 0.3)
    recommendations.push(`Limited capacity: ${talent.availability.hoursPerWeek}h/week`)
  }
  
  // Work arrangement compatibility
  if (talent.availability.workArrangement === project.workArrangement) {
    scheduleAlignment += 20
    recommendations.push("✓ Work arrangement matches")
  } else if (
    (talent.availability.workArrangement === 'hybrid' && project.workArrangement === 'remote') ||
    (talent.availability.workArrangement === 'remote' && project.workArrangement === 'hybrid')
  ) {
    scheduleAlignment += 15
    recommendations.push("Work arrangement compatible")
  } else {
    scheduleAlignment += 5
    recommendations.push("Work arrangement mismatch")
  }
  
  // Timeline compatibility
  const projectDurationWeeks = project.timeline.duration
  const isUrgent = project.timeline.isUrgent
  
  if (!isUrgent) {
    timelineCompatibility = 80
    recommendations.push("Standard timeline - good fit")
  } else {
    if (talent.reputation.responseTime <= 2) {
      timelineCompatibility = 90
      recommendations.push("✓ Fast responder - good for urgent project")
    } else if (talent.reputation.responseTime <= 8) {
      timelineCompatibility = 70
      recommendations.push("Moderate response time for urgent project")
    } else {
      timelineCompatibility = 40
      recommendations.push("Slow response time - may not suit urgent project")
    }
  }
  
  return {
    canStartOnTime,
    hasCapacity,
    scheduleAlignment: Math.min(100, scheduleAlignment),
    timelineCompatibility,
    recommendations
  }
}

/**
 * Calculate experience match
 */
function calculateExperienceMatch(talent: TalentProfile, project: ProjectRequirements): ExperienceMatchResult {
  const recommendations: string[] = []
  let experienceScore = 0
  
  // Experience level matching
  const levelScores = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }
  const requiredLevel = levelScores[project.experienceLevel]
  const talentLevel = Math.min(4, Math.ceil(talent.experience.totalYears / 2)) // Rough mapping
  
  const levelMatch = talentLevel >= requiredLevel
  if (levelMatch) {
    experienceScore += 40
    if (talentLevel > requiredLevel) {
      experienceScore += (talentLevel - requiredLevel) * 5
      recommendations.push("✓ Exceeds experience requirements")
    } else {
      recommendations.push("✓ Meets experience requirements")
    }
  } else {
    experienceScore += Math.max(0, 40 - (requiredLevel - talentLevel) * 15)
    recommendations.push("Below required experience level")
  }
  
  // Relevant experience
  const relevantExperience = talent.experience.relevantYears
  if (relevantExperience >= 3) {
    experienceScore += 25
    recommendations.push("✓ Strong relevant experience")
  } else if (relevantExperience >= 1) {
    experienceScore += 15
    recommendations.push("Some relevant experience")
  } else {
    experienceScore += 5
    recommendations.push("Limited relevant experience")
  }
  
  // Project completion track record
  const completedProjects = talent.experience.completedProjects
  if (completedProjects >= 20) {
    experienceScore += 20
    recommendations.push("✓ Extensive project history")
  } else if (completedProjects >= 10) {
    experienceScore += 15
    recommendations.push("Good project history")
  } else if (completedProjects >= 5) {
    experienceScore += 10
    recommendations.push("Moderate project history")
  } else {
    experienceScore += 5
    recommendations.push("Limited project history")
  }
  
  // Success rate
  const successRate = talent.experience.successRate
  if (successRate >= 95) {
    experienceScore += 15
    recommendations.push("✓ Excellent success rate")
  } else if (successRate >= 85) {
    experienceScore += 10
    recommendations.push("Good success rate")
  } else if (successRate >= 75) {
    experienceScore += 5
    recommendations.push("Moderate success rate")
  } else {
    recommendations.push("⚠ Lower success rate - review carefully")
  }
  
  // Project complexity fit
  const projectComplexityFit = Math.min(100, experienceScore + (talent.experience.totalYears * 2))
  
  return {
    levelMatch,
    experienceScore: Math.min(100, experienceScore),
    relevantExperience,
    projectComplexityFit,
    recommendations
  }
}

/**
 * Calculate reputation score
 */
function calculateReputationScore(talent: TalentProfile): ReputationScore {
  const recommendations: string[] = []
  
  // Rating score
  const ratingScore = Math.round((talent.reputation.rating / 5) * 100)
  
  // Reliability score
  const reliabilityScore = talent.reputation.reliability
  
  // Responsiveness score (inverse of response time)
  let responsivenessScore = 0
  if (talent.reputation.responseTime <= 1) {
    responsivenessScore = 100
    recommendations.push("✓ Very responsive (< 1 hour)")
  } else if (talent.reputation.responseTime <= 4) {
    responsivenessScore = 80
    recommendations.push("✓ Quick responder (< 4 hours)")
  } else if (talent.reputation.responseTime <= 24) {
    responsivenessScore = 60
    recommendations.push("Responds within 24 hours")
  } else {
    responsivenessScore = 30
    recommendations.push("Slower response time")
  }
  
  // Track record score
  const trackRecordScore = Math.min(100, (talent.reputation.reviewCount / 10) * 100)
  
  // Overall reputation score
  const overallScore = Math.round(
    (ratingScore * 0.4) +
    (reliabilityScore * 0.3) +
    (responsivenessScore * 0.2) +
    (trackRecordScore * 0.1)
  )
  
  if (overallScore >= 90) {
    recommendations.push("✓ Excellent reputation")
  } else if (overallScore >= 75) {
    recommendations.push("✓ Good reputation")
  } else if (overallScore >= 60) {
    recommendations.push("Moderate reputation")
  } else {
    recommendations.push("⚠ Limited reputation data")
  }
  
  return {
    overallScore,
    ratingScore,
    reliabilityScore,
    responsivenessScore,
    trackRecordScore,
    recommendations
  }
}

/**
 * Calculate verification score
 */
function calculateVerificationScore(talent: TalentProfile): VerificationScore {
  const recommendations: string[] = []
  let overallScore = 0
  
  if (talent.verification.identityVerified) {
    overallScore += 30
    recommendations.push("✓ Identity verified")
  } else {
    recommendations.push("⚠ Identity not verified")
  }
  
  if (talent.verification.skillsVerified) {
    overallScore += 25
    recommendations.push("✓ Skills verified")
  }
  
  if (talent.verification.backgroundChecked) {
    overallScore += 25
    recommendations.push("✓ Background checked")
  }
  
  if (talent.verification.referencesChecked) {
    overallScore += 20
    recommendations.push("✓ References checked")
  }
  
  const trustScore = overallScore
  const credibilityScore = overallScore
  
  let riskLevel: 'low' | 'medium' | 'high'
  if (overallScore >= 75) {
    riskLevel = 'low'
  } else if (overallScore >= 50) {
    riskLevel = 'medium'
  } else {
    riskLevel = 'high'
  }
  
  return {
    overallScore,
    trustScore,
    credibilityScore,
    riskLevel,
    recommendations
  }
}

/**
 * Calculate portfolio match
 */
function calculatePortfolioMatch(talent: TalentProfile, project: ProjectRequirements): PortfolioMatchResult {
  const recommendations: string[] = []
  
  // Relevance score based on relevant projects
  const relevanceScore = talent.portfolio.hasRelevantWork ? 
    Math.min(100, (talent.portfolio.relevantProjects / Math.max(1, talent.portfolio.projectCount)) * 100) : 0
  
  // Quality score based on total projects
  const qualityScore = Math.min(100, talent.portfolio.projectCount * 10)
  
  // Diversity score
  const diversityScore = Math.min(100, talent.portfolio.projectCount * 5)
  
  if (talent.portfolio.hasRelevantWork) {
    recommendations.push("✓ Has relevant portfolio work")
  } else {
    recommendations.push("No directly relevant portfolio work")
  }
  
  return {
    relevanceScore,
    qualityScore,
    diversityScore,
    hasRelevantWork: talent.portfolio.hasRelevantWork,
    recommendations
  }
}

/**
 * Generate insights and recommendations
 */
function generateInsights(
  talent: TalentProfile,
  project: ProjectRequirements,
  scores: any
): { recommendations: string[]; strengths: string[]; concerns: string[] } {
  const recommendations: string[] = []
  const strengths: string[] = []
  const concerns: string[] = []
  
  // Analyze strengths
  if (scores.skillsMatch.overallScore >= 80) {
    strengths.push("Excellent technical skill match")
  }
  if (scores.locationMatch.matchScore >= 80) {
    strengths.push("Great location fit for local collaboration")
  }
  if (scores.reputationScore.overallScore >= 85) {
    strengths.push("Strong reputation and track record")
  }
  if (scores.experienceMatch.experienceScore >= 80) {
    strengths.push("Relevant experience level")
  }
  
  // Analyze concerns
  if (scores.skillsMatch.missingRequiredSkills.length > 0) {
    concerns.push(`Missing required skills: ${scores.skillsMatch.missingRequiredSkills.join(', ')}`)
  }
  if (!scores.budgetMatch.isWithinBudget) {
    concerns.push("Rate may be outside project budget")
  }
  if (!scores.availabilityMatch.canStartOnTime) {
    concerns.push("May not be available for project start date")
  }
  
  // Generate recommendations
  if (strengths.length >= 3) {
    recommendations.push("Strong candidate - recommend for interview")
  } else if (strengths.length >= 2) {
    recommendations.push("Good candidate - worth considering")
  } else {
    recommendations.push("Review carefully - may need additional evaluation")
  }
  
  return { recommendations, strengths, concerns }
}

/**
 * Assess risks
 */
function assessRisks(talent: TalentProfile, project: ProjectRequirements, overallScore: number): RiskAssessment {
  const riskFactors: string[] = []
  const mitigationStrategies: string[] = []
  
  // Score-based risk
  let overallRisk: 'low' | 'medium' | 'high'
  if (overallScore >= 75) {
    overallRisk = 'low'
  } else if (overallScore >= 55) {
    overallRisk = 'medium'
    riskFactors.push("Moderate overall match score")
    mitigationStrategies.push("Conduct thorough interview to assess fit")
  } else {
    overallRisk = 'high'
    riskFactors.push("Low overall match score")
    mitigationStrategies.push("Consider alternative candidates")
  }
  
  // Verification risks
  if (!talent.verification.identityVerified) {
    riskFactors.push("Identity not verified")
    mitigationStrategies.push("Require identity verification before hiring")
  }
  
  // Experience risks
  if (talent.experience.successRate < 80) {
    riskFactors.push("Lower than average success rate")
    mitigationStrategies.push("Check references carefully")
  }
  
  // Budget risks
  if (talent.hourlyRate.min > project.budget.max) {
    riskFactors.push("Rate above budget")
    mitigationStrategies.push("Negotiate rate or adjust project scope")
  }
  
  const confidenceLevel = Math.max(0, Math.min(100, overallScore - riskFactors.length * 10))
  
  return {
    overallRisk,
    riskFactors,
    mitigationStrategies,
    confidenceLevel
  }
}
