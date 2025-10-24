'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { SkillsSelector } from '@/components/ui/skills-selector'
import { experienceLevels, type ExperienceLevel } from '@/lib/data/skills-taxonomy'
import { ProjectCreationData } from '@/app/(dashboard)/business/projects/create/page'

interface SkillsRequirementsStepProps {
  data: Partial<ProjectCreationData>
  onUpdate: (data: Partial<ProjectCreationData>) => void
  onNext: () => void
  onPrevious: () => void
}

export function SkillsRequirementsStep({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious 
}: SkillsRequirementsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    
    if (!data.requiredSkills || data.requiredSkills.length === 0) {
      newErrors.skills = 'Please select at least one required skill'
    }
    
    if (!data.experienceLevel) {
      newErrors.experienceLevel = 'Please select an experience level'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      onNext()
    }
  }

  const handleSkillsChange = (skills: string[]) => {
    onUpdate({ requiredSkills: skills })
    // Clear error when skills are selected
    if (skills.length > 0 && errors.skills) {
      setErrors(prev => ({ ...prev, skills: '' }))
    }
  }

  const handleExperienceLevelChange = (level: ExperienceLevel) => {
    onUpdate({ experienceLevel: level })
    // Clear error when level is selected
    if (errors.experienceLevel) {
      setErrors(prev => ({ ...prev, experienceLevel: '' }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Requirements</CardTitle>
        <p className="text-sm text-gray-600">
          Specify the skills and experience level needed for your project. This helps us match you with the most qualified talent.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required Skills */}
        <div className="space-y-2">
          <Label>Required Skills *</Label>
          <p className="text-sm text-gray-600">
            Select the primary skills needed for this project. You can choose from our taxonomy or add custom skills.
          </p>
          <SkillsSelector
            selectedSkills={data.requiredSkills || []}
            onSkillsChange={handleSkillsChange}
            maxSkills={15}
            showCategories={true}
            showPopular={true}
            allowCustomSkills={true}
            placeholder="Search for required skills..."
            className={errors.skills ? 'border-red-500 rounded-lg p-4' : ''}
          />
          {errors.skills && (
            <p className="text-sm text-red-600">{errors.skills}</p>
          )}
        </div>

        {/* Experience Level */}
        <div className="space-y-4">
          <div>
            <Label>Experience Level Required *</Label>
            <p className="text-sm text-gray-600">
              What level of experience do you need for this project?
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experienceLevels.map((level) => (
              <div
                key={level.id}
                className={`relative cursor-pointer rounded-lg border p-4 transition-colors ${
                  data.experienceLevel === level.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${errors.experienceLevel ? 'border-red-500' : ''}`}
                onClick={() => handleExperienceLevelChange(level.id)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="experienceLevel"
                    value={level.id}
                    checked={data.experienceLevel === level.id}
                    onChange={() => handleExperienceLevelChange(level.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <label className="block text-sm font-medium text-gray-900 cursor-pointer">
                      {level.name}
                    </label>
                    <p className="text-sm text-gray-500">{level.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {errors.experienceLevel && (
            <p className="text-sm text-red-600">{errors.experienceLevel}</p>
          )}
        </div>

        {/* Additional Requirements */}
        <div className="space-y-2">
          <Label htmlFor="additional-requirements">Additional Requirements (Optional)</Label>
          <textarea
            id="additional-requirements"
            placeholder="Any specific certifications, tools, or other requirements not covered above..."
            value={data.additionalRequirements || ''}
            onChange={(e) => onUpdate({ additionalRequirements: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <p className="text-xs text-gray-500">
            Examples: "Must have AWS certification", "Experience with Shopify required", "Portfolio of similar projects needed"
          </p>
        </div>

        {/* Skills Summary */}
        {data.requiredSkills && data.requiredSkills.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Skills Summary</h4>
            <p className="text-sm text-blue-800">
              You're looking for {data.experienceLevel ? experienceLevels.find(l => l.id === data.experienceLevel)?.name.toLowerCase() : ''} talent with expertise in: {data.requiredSkills.join(', ')}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            Previous: Project Details
          </Button>
          <Button onClick={handleNext}>
            Next: Location & Work Arrangement
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
