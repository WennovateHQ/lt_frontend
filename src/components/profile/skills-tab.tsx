'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SkillsSelector } from '@/components/ui/skills-selector'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus } from 'lucide-react'
import { getAllSkills, searchSkills } from '@/lib/data/skills-taxonomy'

interface Skill {
  name: string
  level: number // 1-5 scale
  years: number
  category?: string
}

interface SkillsTabProps {
  profile: any
  handleSkillsChange: (skills: Skill[]) => void
  isEditing: boolean
}

export function SkillsTab({ profile, handleSkillsChange, isEditing }: SkillsTabProps) {
  // Convert profile skills to new format
  const getSkillsFromProfile = (): Skill[] => {
    if (!profile?.skills) return []
    return profile.skills.map((userSkill: any) => ({
      name: userSkill.skill?.name || userSkill.name || userSkill,
      level: userSkill.level || 3,
      years: userSkill.experience || userSkill.years || 1,
      category: userSkill.skill?.category || userSkill.category || 'General'
    }))
  }

  const [skills, setSkills] = useState<Skill[]>(getSkillsFromProfile())
  const [newSkillName, setNewSkillName] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Update skills when profile changes (when data is loaded from backend)
  React.useEffect(() => {
    console.log('🔄 Skills: Profile changed, updating skills from profile:', profile?.skills)
    const profileSkills = getSkillsFromProfile()
    console.log('🔄 Skills: Parsed skills:', profileSkills)
    setSkills(profileSkills)
    setHasUnsavedChanges(false)
  }, [profile?.skills])

  // Save skills when exiting edit mode
  React.useEffect(() => {
    if (!isEditing && hasUnsavedChanges) {
      console.log('🔄 Skills: Saving changes to backend...', skills)
      handleSkillsChange(skills)
      setHasUnsavedChanges(false)
    }
  }, [isEditing, hasUnsavedChanges])

  // Manual save function for debugging
  const saveSkills = () => {
    console.log('🔄 Skills: Manual save triggered', skills)
    handleSkillsChange(skills)
    setHasUnsavedChanges(false)
  }

  const addSkill = () => {
    if (newSkillName.trim()) {
      // Find skill in taxonomy to get category
      const allSkills = getAllSkills()
      const skillFromTaxonomy = allSkills.find(s => 
        s.name.toLowerCase() === newSkillName.trim().toLowerCase()
      )
      
      const newSkill: Skill = {
        name: newSkillName.trim(),
        level: 3,
        years: 1,
        category: skillFromTaxonomy?.category || 'General'
      }
      const updatedSkills = [...skills, newSkill]
      setSkills(updatedSkills)
      setNewSkillName('')
      setHasUnsavedChanges(true)
    }
  }

  // Handle skills selection from SkillsSelector
  const handleSkillsSelection = (selectedSkillNames: string[]) => {
    const allSkills = getAllSkills()
    const newSkills: Skill[] = selectedSkillNames.map(skillName => {
      // Check if skill already exists in current skills
      const existingSkill = skills.find(s => s.name === skillName)
      if (existingSkill) {
        return existingSkill
      }
      
      // Find skill in taxonomy to get category
      const skillFromTaxonomy = allSkills.find(s => 
        s.name.toLowerCase() === skillName.toLowerCase()
      )
      
      return {
        name: skillName,
        level: 3,
        years: 1,
        category: skillFromTaxonomy?.category || 'General'
      }
    })
    
    setSkills(newSkills)
    setHasUnsavedChanges(true)
  }

  const removeSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index)
    setSkills(updatedSkills)
    setHasUnsavedChanges(true)
  }

  const updateSkill = (index: number, field: keyof Skill, value: string | number) => {
    const updatedSkills = skills.map((skill, i) => 
      i === index ? { ...skill, [field]: value } : skill
    )
    setSkills(updatedSkills)
    setHasUnsavedChanges(true)
  }

  const getLevelText = (level: number) => {
    const levels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master']
    return levels[level] || 'Intermediate'
  }

  const getLevelColor = (level: number) => {
    const colors = ['', 'bg-red-100 text-red-800', 'bg-yellow-100 text-yellow-800', 'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800']
    return colors[level] || 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Skills & Experience</CardTitle>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && isEditing && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Unsaved Changes
                </Badge>
              )}
              {hasUnsavedChanges && isEditing && (
                <Button onClick={saveSkills} size="sm" variant="outline">
                  Save Skills Now
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Add your skills with experience level and years of experience
            {hasUnsavedChanges && isEditing && (
              <span className="text-yellow-600 ml-2">• Click "Save Changes" to save your updates</span>
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Skills Selector */}
          {isEditing && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-medium mb-3">Add Skills</h5>
                <SkillsSelector
                  selectedSkills={skills.map(s => s.name)}
                  onSkillsChange={handleSkillsSelection}
                  maxSkills={20}
                  showCategories={true}
                  showPopular={true}
                  allowCustomSkills={true}
                  placeholder="Search for skills to add..."
                />
              </div>
            </div>
          )}

          {/* Skills List */}
          <div className="space-y-3">
            {skills.map((skill, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-lg">{skill.name}</h4>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Experience Level */}
                  <div>
                    <Label className="text-sm font-medium">Experience Level</Label>
                    {isEditing ? (
                      <Select
                        value={skill.level.toString()}
                        onValueChange={(value) => updateSkill(index, 'level', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Beginner</SelectItem>
                          <SelectItem value="2">Intermediate</SelectItem>
                          <SelectItem value="3">Advanced</SelectItem>
                          <SelectItem value="4">Expert</SelectItem>
                          <SelectItem value="5">Master</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={`${getLevelColor(skill.level)} mt-1`}>
                        {getLevelText(skill.level)}
                      </Badge>
                    )}
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <Label className="text-sm font-medium">Years of Experience</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={skill.years}
                        onChange={(e) => updateSkill(index, 'years', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">
                        {skill.years} {skill.years === 1 ? 'year' : 'years'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {skills.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No skills added yet.</p>
              {isEditing && <p className="text-sm mt-1">Add your first skill above to get started.</p>}
            </div>
          )}

          {/* Skills Summary */}
          {skills.length > 0 && (
            <Card className="bg-blue-50 border-blue-200 mt-6">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {skills.length}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Skills Summary</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      You have {skills.length} skills with an average of{' '}
                      {Math.round(skills.reduce((sum, skill) => sum + skill.years, 0) / skills.length)} years experience.
                      {skills.filter(s => s.level >= 4).length > 0 && (
                        ` You have ${skills.filter(s => s.level >= 4).length} expert-level skills.`
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
