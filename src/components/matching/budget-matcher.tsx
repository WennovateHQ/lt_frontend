'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { matchingService, TalentMatch } from '@/lib/api/matching.service'
import { formatCurrency } from '@/lib/utils'

interface BudgetMatch {
  talentId: string
  projectId: string
  budgetCompatibilityScore: number
  talentRates: {
    hourlyRate: {
      min: number
      max: number
      preferred: number
    }
    projectRate?: number
    currency: string
  }
  projectBudget: {
    type: 'fixed' | 'hourly'
    totalBudget: number
    hourlyBudget?: {
      min: number
      max: number
    }
    estimatedHours: number
    currency: string
  }
  analysis: {
    alignment: 'perfect' | 'good' | 'acceptable' | 'poor'
    savings: number
    premium: number
    negotiationRoom: number
    costEfficiency: number
  }
  recommendations: string[]
  concerns: string[]
  alternatives: Array<{
    scenario: string
    adjustedRate: number
    adjustedHours: number
    totalCost: number
    description: string
  }>
}

export function BudgetMatcher({ projectId }: { projectId: string }) {
  const [matches, setMatches] = useState<BudgetMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<BudgetMatch | null>(null)
  const [sortBy, setSortBy] = useState<'score' | 'rate' | 'value'>('score')

  useEffect(() => {
    loadBudgetMatches()
  }, [projectId])

  const loadBudgetMatches = async () => {
    try {
      const response = await matchingService.getProjectMatches(projectId, {
        sortBy: 'score',
        maxResults: 20
      })
      
      const budgetMatches = response.matches.map(match => ({
        talentId: match.talentId,
        projectId: match.projectId,
        budgetCompatibilityScore: calculateBudgetScore(match),
        talentRates: extractTalentRates(match.talent),
        projectBudget: extractProjectBudget(match.project),
        analysis: analyzeBudgetAlignment(match),
        recommendations: generateBudgetRecommendations(match),
        concerns: identifyBudgetConcerns(match),
        alternatives: generateAlternativeScenarios(match)
      }))
      
      setMatches(budgetMatches)
    } catch (error) {
      console.error('Failed to load budget matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateBudgetScore = (match: TalentMatch): number => {
    const budgetScore = match.matchScore.breakdown.budget
    const valueScore = calculateValueScore(match)
    const flexibilityScore = calculateFlexibilityScore(match)
    
    return Math.round((budgetScore * 0.5 + valueScore * 0.3 + flexibilityScore * 0.2) * 100)
  }

  const calculateValueScore = (match: TalentMatch): number => {
    // Mock calculation - in real app, analyze value for money
    return 0.85
  }

  const calculateFlexibilityScore = (match: TalentMatch): number => {
    // Mock calculation - in real app, analyze rate negotiation flexibility
    return 0.75
  }

  const extractTalentRates = (talent: any) => ({
    hourlyRate: {
      min: talent.hourlyRate?.min || 50,
      max: talent.hourlyRate?.max || 100,
      preferred: talent.hourlyRate?.preferred || 75
    },
    projectRate: talent.projectRate,
    currency: talent.hourlyRate?.currency || 'CAD'
  })

  const extractProjectBudget = (project: any) => ({
    type: project.budget?.type || 'hourly',
    totalBudget: project.budget?.amount || 8000,
    hourlyBudget: project.budget?.hourlyRate || { min: 60, max: 90 },
    estimatedHours: project.estimatedHours || 100,
    currency: 'CAD'
  })

  const analyzeBudgetAlignment = (match: TalentMatch) => {
    const talent = extractTalentRates(match.talent)
    const project = extractProjectBudget(match.project)
    
    const talentPreferred = talent.hourlyRate.preferred
    const projectMax = project.hourlyBudget?.max || 0
    const projectMin = project.hourlyBudget?.min || 0
    
    let alignment: 'perfect' | 'good' | 'acceptable' | 'poor'
    let savings = 0
    let premium = 0
    let negotiationRoom = 0
    
    if (talentPreferred <= projectMax && talentPreferred >= projectMin) {
      alignment = 'perfect'
      savings = projectMax - talentPreferred
    } else if (talentPreferred <= projectMax * 1.1) {
      alignment = 'good'
      premium = talentPreferred - projectMax
    } else if (talentPreferred <= projectMax * 1.2) {
      alignment = 'acceptable'
      premium = talentPreferred - projectMax
    } else {
      alignment = 'poor'
      premium = talentPreferred - projectMax
    }
    
    negotiationRoom = talent.hourlyRate.max - talent.hourlyRate.min
    const costEfficiency = calculateCostEfficiency(match)
    
    return { alignment, savings, premium, negotiationRoom, costEfficiency }
  }

  const calculateCostEfficiency = (match: TalentMatch): number => {
    // Mock calculation - in real app, analyze cost vs expected quality/speed
    return 8.5
  }

  const generateBudgetRecommendations = (match: TalentMatch): string[] => {
    const analysis = analyzeBudgetAlignment(match)
    const recommendations = []
    
    if (analysis.alignment === 'perfect') {
      recommendations.push('Excellent budget fit - proceed with standard rate')
      recommendations.push(`Potential savings of ${formatCurrency(analysis.savings)} per hour`)
    } else if (analysis.alignment === 'good') {
      recommendations.push('Good budget alignment with minor premium')
      recommendations.push('Consider negotiating based on project scope')
    } else if (analysis.alignment === 'acceptable') {
      recommendations.push('Budget stretch required - evaluate project priorities')
      recommendations.push('Explore reduced scope or extended timeline options')
    } else {
      recommendations.push('Significant budget mismatch - consider alternatives')
      recommendations.push('May need to increase budget or find different talent')
    }
    
    return recommendations
  }

  const identifyBudgetConcerns = (match: TalentMatch): string[] => {
    const analysis = analyzeBudgetAlignment(match)
    const concerns = []
    
    if (analysis.premium > 0) {
      concerns.push(`Rate exceeds budget by ${formatCurrency(analysis.premium)} per hour`)
    }
    
    if (analysis.negotiationRoom < 10) {
      concerns.push('Limited flexibility in rate negotiation')
    }
    
    return concerns
  }

  const generateAlternativeScenarios = (match: TalentMatch) => {
    const talent = extractTalentRates(match.talent)
    const project = extractProjectBudget(match.project)
    
    return [
      {
        scenario: 'Reduced Scope',
        adjustedRate: talent.hourlyRate.preferred,
        adjustedHours: Math.round(project.estimatedHours * 0.8),
        totalCost: talent.hourlyRate.preferred * Math.round(project.estimatedHours * 0.8),
        description: '20% scope reduction to fit budget'
      },
      {
        scenario: 'Extended Timeline',
        adjustedRate: Math.round(talent.hourlyRate.preferred * 0.9),
        adjustedHours: project.estimatedHours,
        totalCost: Math.round(talent.hourlyRate.preferred * 0.9) * project.estimatedHours,
        description: '10% rate reduction for flexible timeline'
      },
      {
        scenario: 'Hybrid Approach',
        adjustedRate: talent.hourlyRate.min,
        adjustedHours: Math.round(project.estimatedHours * 1.1),
        totalCost: talent.hourlyRate.min * Math.round(project.estimatedHours * 1.1),
        description: 'Minimum rate with additional mentoring hours'
      }
    ]
  }

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case 'perfect': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'acceptable': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const sortedMatches = [...matches].sort((a, b) => {
    switch (sortBy) {
      case 'rate':
        return a.talentRates.hourlyRate.preferred - b.talentRates.hourlyRate.preferred
      case 'value':
        return b.analysis.costEfficiency - a.analysis.costEfficiency
      default:
        return b.budgetCompatibilityScore - a.budgetCompatibilityScore
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CurrencyDollarIcon className="w-6 h-6" />
            Budget Alignment
          </h2>
          <p className="text-gray-600">Find talents that match your project budget and requirements</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'rate' | 'value')}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="score">Compatibility Score</option>
            <option value="rate">Hourly Rate</option>
            <option value="value">Cost Efficiency</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Matches List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Budget-Compatible Talents ({sortedMatches.length})</h3>
            
            {sortedMatches.map(match => (
              <Card 
                key={match.talentId} 
                className={`cursor-pointer transition-colors ${
                  selectedMatch?.talentId === match.talentId ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedMatch(match)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Talent #{match.talentId.slice(-4)}</h4>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(match.talentRates.hourlyRate.preferred)}/hour
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(match.budgetCompatibilityScore)}`}>
                        {match.budgetCompatibilityScore}%
                      </div>
                      <Badge className={getAlignmentColor(match.analysis.alignment)}>
                        {match.analysis.alignment}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rate Range:</span>
                      <span>
                        {formatCurrency(match.talentRates.hourlyRate.min)} - {formatCurrency(match.talentRates.hourlyRate.max)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Project Budget:</span>
                      <span>
                        {match.projectBudget.hourlyBudget ? 
                          `${formatCurrency(match.projectBudget.hourlyBudget.min)} - ${formatCurrency(match.projectBudget.hourlyBudget.max)}/hr` :
                          formatCurrency(match.projectBudget.totalBudget)
                        }
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      {match.analysis.savings > 0 ? (
                        <>
                          <ArrowTrendingDownIcon className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">
                            {formatCurrency(match.analysis.savings)} under budget
                          </span>
                        </>
                      ) : match.analysis.premium > 0 ? (
                        <>
                          <ArrowTrendingUpIcon className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">
                            {formatCurrency(match.analysis.premium)} over budget
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Perfect budget match</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Budget Compatibility</span>
                      <span>{match.budgetCompatibilityScore}%</span>
                    </div>
                    <Progress value={match.budgetCompatibilityScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Analysis */}
          <div className="space-y-4">
            {selectedMatch ? (
              <>
                <h3 className="text-lg font-semibold">Budget Analysis</h3>
                
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                    <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Budget Compatibility</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-3xl font-bold ${getScoreColor(selectedMatch.budgetCompatibilityScore)} mb-2`}>
                          {selectedMatch.budgetCompatibilityScore}%
                        </div>
                        <Progress value={selectedMatch.budgetCompatibilityScore} className="h-3 mb-3" />
                        <Badge className={getAlignmentColor(selectedMatch.analysis.alignment)}>
                          {selectedMatch.analysis.alignment} alignment
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Cost Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">Talent Rate</span>
                            <p className="text-lg font-semibold">
                              {formatCurrency(selectedMatch.talentRates.hourlyRate.preferred)}/hr
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Project Budget</span>
                            <p className="text-lg font-semibold">
                              {selectedMatch.projectBudget.hourlyBudget ? 
                                `${formatCurrency(selectedMatch.projectBudget.hourlyBudget.max)}/hr` :
                                formatCurrency(selectedMatch.projectBudget.totalBudget)
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Estimated Total</span>
                            <p className="text-lg font-semibold">
                              {formatCurrency(selectedMatch.talentRates.hourlyRate.preferred * selectedMatch.projectBudget.estimatedHours)}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Cost Efficiency</span>
                            <p className="text-lg font-semibold">
                              {selectedMatch.analysis.costEfficiency}/10
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedMatch.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                              <span className="text-sm text-gray-700">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {selectedMatch.concerns.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Budget Concerns</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedMatch.concerns.map((concern, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                <span className="text-sm text-gray-700">{concern}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="breakdown" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Rate Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Minimum Rate:</span>
                            <span className="font-medium">{formatCurrency(selectedMatch.talentRates.hourlyRate.min)}/hr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Preferred Rate:</span>
                            <span className="font-medium">{formatCurrency(selectedMatch.talentRates.hourlyRate.preferred)}/hr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Maximum Rate:</span>
                            <span className="font-medium">{formatCurrency(selectedMatch.talentRates.hourlyRate.max)}/hr</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600">Negotiation Room:</span>
                            <span className="font-medium">{formatCurrency(selectedMatch.analysis.negotiationRoom)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Project Budget</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Budget Type:</span>
                            <span className="font-medium capitalize">{selectedMatch.projectBudget.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Budget:</span>
                            <span className="font-medium">{formatCurrency(selectedMatch.projectBudget.totalBudget)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated Hours:</span>
                            <span className="font-medium">{selectedMatch.projectBudget.estimatedHours} hours</span>
                          </div>
                          {selectedMatch.projectBudget.hourlyBudget && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Hourly Range:</span>
                              <span className="font-medium">
                                {formatCurrency(selectedMatch.projectBudget.hourlyBudget.min)} - {formatCurrency(selectedMatch.projectBudget.hourlyBudget.max)}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="scenarios" className="space-y-4">
                    <div className="space-y-4">
                      {selectedMatch.alternatives.map((scenario, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-base">{scenario.scenario}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Rate:</span>
                                <p className="font-medium">{formatCurrency(scenario.adjustedRate)}/hr</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Hours:</span>
                                <p className="font-medium">{scenario.adjustedHours}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Total:</span>
                                <p className="font-medium">{formatCurrency(scenario.totalCost)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <ChartBarIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Talent</h3>
                  <p className="text-gray-600">Click on a talent to see detailed budget analysis</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
