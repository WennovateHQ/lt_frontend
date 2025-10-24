'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { ProjectCreationData } from '@/app/(dashboard)/business/projects/create/page'

interface BudgetTimelineStepProps {
  data: Partial<ProjectCreationData>
  onUpdate: (data: Partial<ProjectCreationData>) => void
  onNext: () => void
  onPrevious: () => void
}

const budgetTypes = [
  {
    id: 'hourly' as const,
    name: 'Hourly Rate',
    description: 'Pay by the hour',
    icon: ClockIcon,
    details: 'Best for ongoing work or when scope is flexible'
  },
  {
    id: 'fixed' as const,
    name: 'Fixed Price',
    description: 'One-time project fee',
    icon: CurrencyDollarIcon,
    details: 'Best for well-defined projects with clear deliverables'
  }
]

const durationOptions = [
  { value: 'less-than-week', label: 'Less than a week', description: '1-5 days' },
  { value: '1-2-weeks', label: '1-2 weeks', description: '6-14 days' },
  { value: '3-4-weeks', label: '3-4 weeks', description: '15-30 days' },
  { value: '1-2-months', label: '1-2 months', description: '30-60 days' },
  { value: '3-6-months', label: '3-6 months', description: '60-180 days' },
  { value: '6-months-plus', label: '6+ months', description: '180+ days' },
  { value: 'ongoing', label: 'Ongoing', description: 'No fixed end date' }
]

export function BudgetTimelineStep({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious 
}: BudgetTimelineStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    
    if (!data.budgetType) {
      newErrors.budgetType = 'Please select a budget type'
    }
    
    if (!data.budgetRange?.min || data.budgetRange.min <= 0) {
      newErrors.budgetMin = 'Please enter a minimum budget'
    }
    
    if (!data.budgetRange?.max || data.budgetRange.max <= 0) {
      newErrors.budgetMax = 'Please enter a maximum budget'
    }
    
    if (data.budgetRange?.min && data.budgetRange?.max && data.budgetRange.min > data.budgetRange.max) {
      newErrors.budgetRange = 'Minimum budget cannot be higher than maximum budget'
    }
    
    if (!data.startDate) {
      newErrors.startDate = 'Please select a start date'
    } else if (new Date(data.startDate) < new Date()) {
      newErrors.startDate = 'Start date cannot be in the past'
    }
    
    if (!data.duration) {
      newErrors.duration = 'Please select project duration'
    }
    
    if (data.deadline && new Date(data.deadline) <= new Date(data.startDate || new Date())) {
      newErrors.deadline = 'Deadline must be after start date'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      onNext()
    }
  }

  const handleBudgetTypeChange = (type: 'hourly' | 'fixed') => {
    onUpdate({ budgetType: type })
    if (errors.budgetType) {
      setErrors(prev => ({ ...prev, budgetType: '' }))
    }
  }

  const handleBudgetChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0
    const currentRange = data.budgetRange || { min: 0, max: 0 }
    
    onUpdate({ 
      budgetRange: { 
        ...currentRange, 
        [field]: numValue 
      } 
    })
    
    // Clear related errors
    if (errors[`budget${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors(prev => ({ ...prev, [`budget${field.charAt(0).toUpperCase() + field.slice(1)}`]: '' }))
    }
    if (errors.budgetRange) {
      setErrors(prev => ({ ...prev, budgetRange: '' }))
    }
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getMinDate = () => {
    const today = new Date()
    return formatDate(today)
  }

  const getMinDeadlineDate = () => {
    if (data.startDate) {
      const startDate = new Date(data.startDate)
      startDate.setDate(startDate.getDate() + 1) // At least one day after start
      return formatDate(startDate)
    }
    return getMinDate()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget & Timeline</CardTitle>
        <p className="text-sm text-gray-600">
          Set your budget and timeline expectations for this project.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Type */}
        <div className="space-y-4">
          <div>
            <Label>Budget Type *</Label>
            <p className="text-sm text-gray-600">
              How would you like to structure payment for this project?
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetTypes.map((type) => {
              const Icon = type.icon
              return (
                <div
                  key={type.id}
                  className={`relative cursor-pointer rounded-lg border p-4 transition-colors ${
                    data.budgetType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${errors.budgetType ? 'border-red-500' : ''}`}
                  onClick={() => handleBudgetTypeChange(type.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="h-6 w-6 text-gray-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {type.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {type.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {type.details}
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="budgetType"
                      value={type.id}
                      checked={data.budgetType === type.id}
                      onChange={() => handleBudgetTypeChange(type.id)}
                      className="sr-only"
                    />
                  </div>
                </div>
              )
            })}
          </div>
          
          {errors.budgetType && (
            <p className="text-sm text-red-600">{errors.budgetType}</p>
          )}
        </div>

        {/* Budget Range */}
        <div className="space-y-4">
          <div>
            <Label>Budget Range (CAD) *</Label>
            <p className="text-sm text-gray-600">
              {data.budgetType === 'hourly' 
                ? 'What hourly rate range are you comfortable with?'
                : 'What is your total project budget range?'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget-min">
                Minimum {data.budgetType === 'hourly' ? '(per hour)' : '(total)'}
              </Label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="budget-min"
                  type="number"
                  min="0"
                  step={data.budgetType === 'hourly' ? '5' : '100'}
                  placeholder={data.budgetType === 'hourly' ? '25' : '1000'}
                  value={data.budgetRange?.min || ''}
                  onChange={(e) => handleBudgetChange('min', e.target.value)}
                  className={`pl-10 ${errors.budgetMin ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.budgetMin && (
                <p className="text-sm text-red-600">{errors.budgetMin}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget-max">
                Maximum {data.budgetType === 'hourly' ? '(per hour)' : '(total)'}
              </Label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="budget-max"
                  type="number"
                  min="0"
                  step={data.budgetType === 'hourly' ? '5' : '100'}
                  placeholder={data.budgetType === 'hourly' ? '75' : '5000'}
                  value={data.budgetRange?.max || ''}
                  onChange={(e) => handleBudgetChange('max', e.target.value)}
                  className={`pl-10 ${errors.budgetMax ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.budgetMax && (
                <p className="text-sm text-red-600">{errors.budgetMax}</p>
              )}
            </div>
          </div>
          
          {errors.budgetRange && (
            <p className="text-sm text-red-600">{errors.budgetRange}</p>
          )}
          
          <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Budget Tips:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Research market rates for similar projects</li>
                <li>• Consider the complexity and timeline of your project</li>
                <li>• {data.budgetType === 'hourly' ? 'Hourly rates in BC typically range from $25-150/hour' : 'Include a buffer for unexpected requirements'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start-date">Preferred Start Date *</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="start-date"
              type="date"
              min={getMinDate()}
              value={data.startDate ? formatDate(new Date(data.startDate)) : ''}
              onChange={(e) => {
                onUpdate({ startDate: new Date(e.target.value) })
                if (errors.startDate) {
                  setErrors(prev => ({ ...prev, startDate: '' }))
                }
              }}
              className={`pl-10 ${errors.startDate ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.startDate && (
            <p className="text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>

        {/* Project Duration */}
        <div className="space-y-4">
          <div>
            <Label>Expected Project Duration *</Label>
            <p className="text-sm text-gray-600">
              How long do you expect this project to take?
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {durationOptions.map((option) => (
              <div
                key={option.value}
                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                  data.duration === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${errors.duration ? 'border-red-500' : ''}`}
                onClick={() => {
                  onUpdate({ duration: option.value })
                  if (errors.duration) {
                    setErrors(prev => ({ ...prev, duration: '' }))
                  }
                }}
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {option.description}
                  </div>
                </div>
                <input
                  type="radio"
                  name="duration"
                  value={option.value}
                  checked={data.duration === option.value}
                  onChange={() => onUpdate({ duration: option.value })}
                  className="sr-only"
                />
              </div>
            ))}
          </div>
          
          {errors.duration && (
            <p className="text-sm text-red-600">{errors.duration}</p>
          )}
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <Label htmlFor="deadline">Hard Deadline (Optional)</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="deadline"
              type="date"
              min={getMinDeadlineDate()}
              value={data.deadline ? formatDate(new Date(data.deadline)) : ''}
              onChange={(e) => {
                onUpdate({ deadline: e.target.value ? new Date(e.target.value) : undefined })
                if (errors.deadline) {
                  setErrors(prev => ({ ...prev, deadline: '' }))
                }
              }}
              className={`pl-10 ${errors.deadline ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.deadline && (
            <p className="text-sm text-red-600">{errors.deadline}</p>
          )}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="deadline-flexible"
              checked={data.deadlineFlexible || false}
              onChange={(e) => onUpdate({ deadlineFlexible: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Label htmlFor="deadline-flexible" className="text-sm">
              Deadline is flexible
            </Label>
          </div>
        </div>

        {/* Budget & Timeline Summary */}
        {data.budgetType && data.budgetRange?.min && data.budgetRange?.max && data.startDate && data.duration && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-900 mb-2">Budget & Timeline Summary</h4>
            <div className="text-sm text-green-800 space-y-1">
              <p>
                <strong>Budget:</strong> ${data.budgetRange.min} - ${data.budgetRange.max} CAD 
                {data.budgetType === 'hourly' ? ' per hour' : ' total'}
              </p>
              <p>
                <strong>Start Date:</strong> {new Date(data.startDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Duration:</strong> {durationOptions.find(d => d.value === data.duration)?.label}
              </p>
              {data.deadline && (
                <p>
                  <strong>Deadline:</strong> {new Date(data.deadline).toLocaleDateString()}
                  {data.deadlineFlexible && ' (flexible)'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            Previous: Location & Work
          </Button>
          <Button onClick={handleNext}>
            Next: Review & Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
