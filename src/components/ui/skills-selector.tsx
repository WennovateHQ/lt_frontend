'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { 
  skillsCategories, 
  getAllSkills, 
  getPopularSkills, 
  searchSkills,
  type Skill,
  type SkillCategory,
  type CustomSkill
} from '@/lib/data/skills-taxonomy'

interface SkillsSelectorProps {
  selectedSkills: string[]
  onSkillsChange: (skills: string[]) => void
  maxSkills?: number
  showCategories?: boolean
  showPopular?: boolean
  allowCustomSkills?: boolean
  placeholder?: string
  className?: string
}

export function SkillsSelector({
  selectedSkills,
  onSkillsChange,
  maxSkills = 10,
  showCategories = true,
  showPopular = true,
  allowCustomSkills = true,
  placeholder = "Search skills or add custom ones...",
  className = ""
}: SkillsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [customSkillInput, setCustomSkillInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customSkills, setCustomSkills] = useState<CustomSkill[]>([])

  const allSkills = getAllSkills()
  const popularSkills = getPopularSkills()
  
  // Filter skills based on search query
  const filteredSkills = searchQuery 
    ? searchSkills(searchQuery)
    : activeCategory 
      ? skillsCategories.find(cat => cat.id === activeCategory)?.skills || []
      : []

  // Get display skills (popular or filtered)
  const displaySkills = searchQuery || activeCategory 
    ? filteredSkills 
    : showPopular 
      ? popularSkills 
      : []

  const handleSkillToggle = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      // Remove skill
      onSkillsChange(selectedSkills.filter(s => s !== skillName))
    } else {
      // Add skill (check max limit)
      if (selectedSkills.length < maxSkills) {
        onSkillsChange([...selectedSkills, skillName])
      }
    }
  }

  const handleAddCustomSkill = () => {
    const trimmedSkill = customSkillInput.trim()
    if (trimmedSkill && !selectedSkills.includes(trimmedSkill)) {
      // Check if skill already exists in taxonomy
      const existingSkill = allSkills.find(skill => 
        skill.name.toLowerCase() === trimmedSkill.toLowerCase()
      )
      
      if (!existingSkill) {
        // Add as custom skill
        const newCustomSkill: CustomSkill = {
          id: `custom-${Date.now()}`,
          name: trimmedSkill,
          isCustom: true,
          createdBy: 'current-user', // Would be actual user ID
          approvalStatus: 'pending',
          createdAt: new Date()
        }
        setCustomSkills(prev => [...prev, newCustomSkill])
      }
      
      // Add to selected skills
      if (selectedSkills.length < maxSkills) {
        onSkillsChange([...selectedSkills, trimmedSkill])
      }
      
      setCustomSkillInput('')
      setShowCustomInput(false)
    }
  }

  const handleRemoveSkill = (skillName: string) => {
    onSkillsChange(selectedSkills.filter(s => s !== skillName))
  }

  const isSkillSelected = (skillName: string) => selectedSkills.includes(skillName)
  const canAddMoreSkills = selectedSkills.length < maxSkills

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Skills ({selectedSkills.length}/{maxSkills})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <Badge 
                key={skill} 
                variant="default" 
                className="flex items-center gap-1 pr-1"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setActiveCategory(null)
          }}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      {showCategories && !searchQuery && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Categories</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {skillsCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveCategory(activeCategory === category.id ? null : category.id)
                  setSearchQuery('')
                }}
                className="justify-start text-left h-auto py-2"
              >
                <span className="mr-2">{category.icon}</span>
                <div className="text-xs">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-gray-500">{category.skills.length} skills</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Skills (when no search/category) */}
      {showPopular && !searchQuery && !activeCategory && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StarIcon className="h-4 w-4 text-yellow-500" />
            <h4 className="text-sm font-medium text-gray-900">Popular Skills</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map((skill) => (
              <Badge
                key={skill.id}
                variant={isSkillSelected(skill.name) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  !canAddMoreSkills && !isSkillSelected(skill.name) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-50'
                }`}
                onClick={() => {
                  if (canAddMoreSkills || isSkillSelected(skill.name)) {
                    handleSkillToggle(skill.name)
                  }
                }}
              >
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filtered Skills */}
      {displaySkills.length > 0 && (searchQuery || activeCategory) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            {activeCategory 
              ? skillsCategories.find(cat => cat.id === activeCategory)?.name 
              : `Search Results (${displaySkills.length})`
            }
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {displaySkills.map((skill) => (
              <Button
                key={skill.id}
                variant={isSkillSelected(skill.name) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (canAddMoreSkills || isSkillSelected(skill.name)) {
                    handleSkillToggle(skill.name)
                  }
                }}
                disabled={!canAddMoreSkills && !isSkillSelected(skill.name)}
                className="justify-start text-left h-auto py-2"
              >
                <div className="text-xs">
                  <div className="font-medium">{skill.name}</div>
                  {skill.isPopular && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <StarIcon className="h-3 w-3" />
                      <span>Popular</span>
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Skill Input */}
      {allowCustomSkills && (
        <div className="space-y-2">
          {!showCustomInput ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomInput(true)}
              disabled={!canAddMoreSkills}
              className="w-full"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Custom Skill
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter custom skill name..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomSkill()
                  } else if (e.key === 'Escape') {
                    setCustomSkillInput('')
                    setShowCustomInput(false)
                  }
                }}
                className="flex-1"
                autoFocus
              />
              <Button
                onClick={handleAddCustomSkill}
                disabled={!customSkillInput.trim() || !canAddMoreSkills}
                size="sm"
              >
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCustomSkillInput('')
                  setShowCustomInput(false)
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          )}
          
          {customSkills.length > 0 && (
            <div className="text-xs text-gray-500">
              <p>Custom skills will be reviewed and may be added to our taxonomy.</p>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {searchQuery && displaySkills.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No skills found for "{searchQuery}"</p>
          {allowCustomSkills && (
            <p className="text-xs mt-1">
              You can add it as a custom skill using the button above.
            </p>
          )}
        </div>
      )}

      {/* Max Skills Warning */}
      {selectedSkills.length >= maxSkills && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          You've reached the maximum of {maxSkills} skills. Remove some to add others.
        </div>
      )}
    </div>
  )
}
