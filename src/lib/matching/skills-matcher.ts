import { getAllSkills, getCategoryBySkillId } from '@/lib/data/skills-taxonomy'

export interface SkillRequirement {
  skillName: string
  importance: 'required' | 'preferred' | 'nice-to-have'
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsRequired?: number
}

export interface TalentSkill {
  skillName: string
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience: number
  verified: boolean
  endorsements?: number
  lastUsed?: Date
}

export interface SkillMatchResult {
  skill: string
  required: boolean
  talentHasSkill: boolean
  experienceLevelMatch: boolean
  experienceYearsMatch: boolean
  matchScore: number
  talentSkill?: TalentSkill
  requirement?: SkillRequirement
}

export interface SkillsMatchSummary {
  overallScore: number
  requiredSkillsMatch: number
  preferredSkillsMatch: number
  totalRequiredSkills: number
  totalPreferredSkills: number
  matchedRequiredSkills: number
  matchedPreferredSkills: number
  missingRequiredSkills: string[]
  missingPreferredSkills: string[]
  bonusSkills: string[]
  skillMatches: SkillMatchResult[]
  recommendations: string[]
}

// Experience level scoring
const EXPERIENCE_LEVEL_SCORES = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4
}

// Importance weights
const IMPORTANCE_WEIGHTS = {
  required: 1.0,
  preferred: 0.7,
  'nice-to-have': 0.3
}

/**
 * Calculate skill match score between talent and project requirements
 */
export function calculateSkillsMatch(
  talentSkills: TalentSkill[],
  projectRequirements: SkillRequirement[]
): SkillsMatchSummary {
  const skillMatches: SkillMatchResult[] = []
  const talentSkillMap = new Map(talentSkills.map(skill => [skill.skillName.toLowerCase(), skill]))
  
  let totalWeightedScore = 0
  let maxPossibleScore = 0
  let requiredSkillsMatched = 0
  let preferredSkillsMatched = 0
  
  const requiredSkills = projectRequirements.filter(req => req.importance === 'required')
  const preferredSkills = projectRequirements.filter(req => req.importance === 'preferred')
  const niceToHaveSkills = projectRequirements.filter(req => req.importance === 'nice-to-have')
  
  const missingRequiredSkills: string[] = []
  const missingPreferredSkills: string[] = []
  
  // Process each project requirement
  for (const requirement of projectRequirements) {
    const talentSkill = talentSkillMap.get(requirement.skillName.toLowerCase())
    const weight = IMPORTANCE_WEIGHTS[requirement.importance]
    
    maxPossibleScore += 100 * weight
    
    if (talentSkill) {
      const matchResult = calculateSingleSkillMatch(talentSkill, requirement)
      skillMatches.push(matchResult)
      
      totalWeightedScore += matchResult.matchScore * weight
      
      if (requirement.importance === 'required' && matchResult.matchScore >= 70) {
        requiredSkillsMatched++
      } else if (requirement.importance === 'preferred' && matchResult.matchScore >= 70) {
        preferredSkillsMatched++
      }
    } else {
      // Talent doesn't have this skill
      const matchResult: SkillMatchResult = {
        skill: requirement.skillName,
        required: requirement.importance === 'required',
        talentHasSkill: false,
        experienceLevelMatch: false,
        experienceYearsMatch: false,
        matchScore: 0,
        requirement
      }
      
      skillMatches.push(matchResult)
      
      if (requirement.importance === 'required') {
        missingRequiredSkills.push(requirement.skillName)
      } else if (requirement.importance === 'preferred') {
        missingPreferredSkills.push(requirement.skillName)
      }
    }
  }
  
  // Find bonus skills (talent has skills not required by project)
  const requiredSkillNames = new Set(projectRequirements.map(req => req.skillName.toLowerCase()))
  const bonusSkills = talentSkills
    .filter(skill => !requiredSkillNames.has(skill.skillName.toLowerCase()))
    .map(skill => skill.skillName)
  
  // Calculate overall score
  const overallScore = maxPossibleScore > 0 ? Math.round((totalWeightedScore / maxPossibleScore) * 100) : 0
  
  // Calculate required and preferred match percentages
  const requiredSkillsMatch = requiredSkills.length > 0 
    ? Math.round((requiredSkillsMatched / requiredSkills.length) * 100)
    : 100
  
  const preferredSkillsMatch = preferredSkills.length > 0
    ? Math.round((preferredSkillsMatched / preferredSkills.length) * 100)
    : 100
  
  // Generate recommendations
  const recommendations = generateSkillRecommendations({
    overallScore,
    requiredSkillsMatch,
    missingRequiredSkills,
    missingPreferredSkills,
    bonusSkills,
    skillMatches
  })
  
  return {
    overallScore,
    requiredSkillsMatch,
    preferredSkillsMatch,
    totalRequiredSkills: requiredSkills.length,
    totalPreferredSkills: preferredSkills.length,
    matchedRequiredSkills: requiredSkillsMatched,
    matchedPreferredSkills: preferredSkillsMatched,
    missingRequiredSkills,
    missingPreferredSkills,
    bonusSkills,
    skillMatches,
    recommendations
  }
}

/**
 * Calculate match score for a single skill
 */
function calculateSingleSkillMatch(
  talentSkill: TalentSkill,
  requirement: SkillRequirement
): SkillMatchResult {
  let matchScore = 0
  let experienceLevelMatch = false
  let experienceYearsMatch = false
  
  // Base score for having the skill
  matchScore += 40
  
  // Experience level matching
  if (requirement.experienceLevel) {
    const requiredLevel = EXPERIENCE_LEVEL_SCORES[requirement.experienceLevel]
    const talentLevel = EXPERIENCE_LEVEL_SCORES[talentSkill.experienceLevel]
    
    if (talentLevel >= requiredLevel) {
      experienceLevelMatch = true
      matchScore += 30
      
      // Bonus for exceeding requirements
      if (talentLevel > requiredLevel) {
        matchScore += (talentLevel - requiredLevel) * 5
      }
    } else {
      // Penalty for not meeting level requirements
      matchScore -= (requiredLevel - talentLevel) * 10
    }
  } else {
    // No specific level required, give partial credit
    matchScore += 15
  }
  
  // Years of experience matching
  if (requirement.yearsRequired) {
    if (talentSkill.yearsOfExperience >= requirement.yearsRequired) {
      experienceYearsMatch = true
      matchScore += 20
      
      // Bonus for significantly more experience
      if (talentSkill.yearsOfExperience > requirement.yearsRequired * 1.5) {
        matchScore += 10
      }
    } else {
      // Penalty for insufficient experience
      const yearsDiff = requirement.yearsRequired - talentSkill.yearsOfExperience
      matchScore -= yearsDiff * 5
    }
  } else {
    // No specific years required, give partial credit
    matchScore += 10
  }
  
  // Verification bonus
  if (talentSkill.verified) {
    matchScore += 10
  }
  
  // Endorsements bonus
  if (talentSkill.endorsements && talentSkill.endorsements > 0) {
    matchScore += Math.min(talentSkill.endorsements * 2, 10)
  }
  
  // Recent usage bonus
  if (talentSkill.lastUsed) {
    const monthsSinceUsed = (Date.now() - talentSkill.lastUsed.getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (monthsSinceUsed <= 6) {
      matchScore += 5
    } else if (monthsSinceUsed <= 12) {
      matchScore += 2
    }
  }
  
  // Ensure score is between 0 and 100
  matchScore = Math.max(0, Math.min(100, matchScore))
  
  return {
    skill: requirement.skillName,
    required: requirement.importance === 'required',
    talentHasSkill: true,
    experienceLevelMatch,
    experienceYearsMatch,
    matchScore: Math.round(matchScore),
    talentSkill,
    requirement
  }
}

/**
 * Generate recommendations based on skill match results
 */
function generateSkillRecommendations(data: {
  overallScore: number
  requiredSkillsMatch: number
  missingRequiredSkills: string[]
  missingPreferredSkills: string[]
  bonusSkills: string[]
  skillMatches: SkillMatchResult[]
}): string[] {
  const recommendations: string[] = []
  
  // Overall assessment
  if (data.overallScore >= 90) {
    recommendations.push("Excellent skill match! This candidate meets or exceeds most requirements.")
  } else if (data.overallScore >= 75) {
    recommendations.push("Strong skill match with good alignment to project needs.")
  } else if (data.overallScore >= 60) {
    recommendations.push("Moderate skill match. Consider if gaps can be filled through training.")
  } else if (data.overallScore >= 40) {
    recommendations.push("Limited skill match. Significant training or mentoring may be required.")
  } else {
    recommendations.push("Poor skill match. This candidate may not be suitable for the role.")
  }
  
  // Required skills assessment
  if (data.missingRequiredSkills.length > 0) {
    if (data.missingRequiredSkills.length === 1) {
      recommendations.push(`Missing critical skill: ${data.missingRequiredSkills[0]}`)
    } else {
      recommendations.push(`Missing ${data.missingRequiredSkills.length} critical skills: ${data.missingRequiredSkills.slice(0, 3).join(', ')}${data.missingRequiredSkills.length > 3 ? '...' : ''}`)
    }
  } else if (data.requiredSkillsMatch === 100) {
    recommendations.push("✓ All required skills are present")
  }
  
  // Preferred skills assessment
  if (data.missingPreferredSkills.length > 0 && data.missingPreferredSkills.length <= 3) {
    recommendations.push(`Could benefit from: ${data.missingPreferredSkills.join(', ')}`)
  }
  
  // Bonus skills
  if (data.bonusSkills.length > 0) {
    const topBonusSkills = data.bonusSkills.slice(0, 3)
    recommendations.push(`Additional valuable skills: ${topBonusSkills.join(', ')}`)
  }
  
  // Experience level recommendations
  const lowExperienceMatches = data.skillMatches.filter(
    match => match.talentHasSkill && !match.experienceLevelMatch && match.required
  )
  
  if (lowExperienceMatches.length > 0) {
    recommendations.push(`Experience level may be below requirements for: ${lowExperienceMatches.map(m => m.skill).join(', ')}`)
  }
  
  return recommendations
}

/**
 * Find related skills that could substitute for missing requirements
 */
export function findSkillSubstitutes(
  missingSkills: string[],
  talentSkills: TalentSkill[]
): Array<{ missing: string; substitutes: string[] }> {
  const substitutes: Array<{ missing: string; substitutes: string[] }> = []
  const allSkills = getAllSkills()
  const talentSkillNames = new Set(talentSkills.map(s => s.skillName.toLowerCase()))
  
  for (const missingSkill of missingSkills) {
    const skill = allSkills.find(s => s.name.toLowerCase() === missingSkill.toLowerCase())
    if (!skill) continue
    
    const category = getCategoryBySkillId(skill.id)
    if (!category) continue
    
    // Find related skills in the same category that the talent has
    const relatedSkills = category.skills
      .filter(s => s.name.toLowerCase() !== missingSkill.toLowerCase())
      .filter(s => talentSkillNames.has(s.name.toLowerCase()))
      .map(s => s.name)
    
    if (relatedSkills.length > 0) {
      substitutes.push({
        missing: missingSkill,
        substitutes: relatedSkills
      })
    }
  }
  
  return substitutes
}

/**
 * Calculate skill diversity score
 */
export function calculateSkillDiversity(talentSkills: TalentSkill[]): {
  diversityScore: number
  categoryCoverage: number
  uniqueCategories: string[]
} {
  const allSkills = getAllSkills()
  const categories = new Set<string>()
  
  for (const talentSkill of talentSkills) {
    const skill = allSkills.find(s => s.name.toLowerCase() === talentSkill.skillName.toLowerCase())
    if (skill) {
      const category = getCategoryBySkillId(skill.id)
      if (category) {
        categories.add(category.name)
      }
    }
  }
  
  const uniqueCategories = Array.from(categories)
  const totalCategories = new Set(allSkills.map(s => getCategoryBySkillId(s.id)?.name).filter(Boolean)).size
  const categoryCoverage = Math.round((uniqueCategories.length / totalCategories) * 100)
  
  // Diversity score based on category spread and skill depth
  const avgSkillsPerCategory = talentSkills.length / uniqueCategories.length
  const diversityScore = Math.min(100, Math.round(
    (categoryCoverage * 0.6) + 
    (Math.min(avgSkillsPerCategory / 3, 1) * 40)
  ))
  
  return {
    diversityScore,
    categoryCoverage,
    uniqueCategories
  }
}
