'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import { ProjectCreationData } from '@/app/(dashboard)/business/projects/create/page'
import { SearchableCitySelect } from '@/components/ui/searchable-city-select'

interface LocationPreferencesStepProps {
  data: Partial<ProjectCreationData>
  onUpdate: (data: Partial<ProjectCreationData>) => void
  onNext: () => void
  onPrevious: () => void
}

const workArrangements = [
  {
    id: 'on-site' as const,
    name: 'On-site',
    description: 'Talent works at your location',
    icon: BuildingOfficeIcon,
    details: 'Best for hands-on collaboration and when physical presence is required'
  },
  {
    id: 'remote' as const,
    name: 'Remote',
    description: 'Talent works from their location',
    icon: HomeIcon,
    details: 'Access to wider talent pool, often more cost-effective'
  },
  {
    id: 'hybrid' as const,
    name: 'Hybrid',
    description: 'Mix of on-site and remote work',
    icon: ComputerDesktopIcon,
    details: 'Flexibility with some in-person collaboration'
  }
]

const travelRadiusOptions = [
  { value: 10, label: '10 km', description: 'Local area only' },
  { value: 25, label: '25 km', description: 'City and close suburbs' },
  { value: 50, label: '50 km', description: 'Greater metropolitan area' },
  { value: 100, label: '100 km', description: 'Regional area' }
]


export function LocationPreferencesStep({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious 
}: LocationPreferencesStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    
    if (!data.location?.trim()) {
      newErrors.location = 'Please specify your location'
    }
    
    if (!data.workArrangement) {
      newErrors.workArrangement = 'Please select a work arrangement'
    }
    
    if (data.workArrangement === 'hybrid' && !data.hybridPercentage) {
      newErrors.hybridPercentage = 'Please specify the on-site percentage for hybrid work'
    }
    
    if ((data.workArrangement === 'on-site' || data.workArrangement === 'hybrid') && !data.travelRadius) {
      newErrors.travelRadius = 'Please select a travel radius'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      onNext()
    }
  }

  const handleWorkArrangementChange = (arrangement: 'on-site' | 'remote' | 'hybrid') => {
    onUpdate({ workArrangement: arrangement })
    // Clear related errors
    if (errors.workArrangement) {
      setErrors(prev => ({ ...prev, workArrangement: '' }))
    }
    // Reset hybrid percentage if not hybrid
    if (arrangement !== 'hybrid') {
      onUpdate({ hybridPercentage: undefined })
    }
    // Reset travel radius if remote
    if (arrangement === 'remote') {
      onUpdate({ travelRadius: undefined })
    }
  }

  const needsLocation = data.workArrangement === 'on-site' || data.workArrangement === 'hybrid'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location & Work Arrangement</CardTitle>
        <p className="text-sm text-gray-600">
          Specify where the work will take place and your location preferences.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Your Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Your Business Location *</Label>
          <SearchableCitySelect
            value={data.location || ''}
            onChange={(city, province) => {
              const locationString = `${city}, ${province}`
              onUpdate({ location: locationString })
              if (errors.location) {
                setErrors(prev => ({ ...prev, location: '' }))
              }
            }}
            placeholder="Search for your business location..."
            className={errors.location ? 'border-red-500' : ''}
          />
          {errors.location && (
            <p className="text-sm text-red-600">{errors.location}</p>
          )}
          <p className="text-xs text-gray-500">
            This helps us find talent in your area and calculate travel distances.
          </p>
        </div>

        {/* Work Arrangement */}
        <div className="space-y-4">
          <div>
            <Label>Work Arrangement *</Label>
            <p className="text-sm text-gray-600">
              How would you like the talent to work on this project?
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workArrangements.map((arrangement) => {
              const Icon = arrangement.icon
              return (
                <div
                  key={arrangement.id}
                  className={`relative cursor-pointer rounded-lg border p-4 transition-colors ${
                    data.workArrangement === arrangement.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${errors.workArrangement ? 'border-red-500' : ''}`}
                  onClick={() => handleWorkArrangementChange(arrangement.id)}
                >
                  <div className="text-center">
                    <Icon className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {arrangement.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {arrangement.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {arrangement.details}
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="workArrangement"
                      value={arrangement.id}
                      checked={data.workArrangement === arrangement.id}
                      onChange={() => handleWorkArrangementChange(arrangement.id)}
                      className="sr-only"
                    />
                  </div>
                </div>
              )
            })}
          </div>
          
          {errors.workArrangement && (
            <p className="text-sm text-red-600">{errors.workArrangement}</p>
          )}
        </div>

        {/* Hybrid Percentage */}
        {data.workArrangement === 'hybrid' && (
          <div className="space-y-2">
            <Label htmlFor="hybrid-percentage">On-site Percentage *</Label>
            <div className="flex items-center space-x-4">
              <input
                id="hybrid-percentage"
                type="range"
                min="10"
                max="90"
                step="10"
                value={data.hybridPercentage || 50}
                onChange={(e) => {
                  onUpdate({ hybridPercentage: parseInt(e.target.value) })
                  if (errors.hybridPercentage) {
                    setErrors(prev => ({ ...prev, hybridPercentage: '' }))
                  }
                }}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                {data.hybridPercentage || 50}%
              </span>
            </div>
            {errors.hybridPercentage && (
              <p className="text-sm text-red-600">{errors.hybridPercentage}</p>
            )}
            <p className="text-xs text-gray-500">
              What percentage of time should the talent work on-site? 
              ({100 - (data.hybridPercentage || 50)}% remote)
            </p>
          </div>
        )}

        {/* Travel Radius */}
        {needsLocation && (
          <div className="space-y-4">
            <div>
              <Label>Maximum Travel Distance *</Label>
              <p className="text-sm text-gray-600">
                How far are you willing for talent to travel to your location?
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {travelRadiusOptions.map((option) => (
                <div
                  key={option.value}
                  className={`cursor-pointer rounded-lg border p-3 text-center transition-colors ${
                    data.travelRadius === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${errors.travelRadius ? 'border-red-500' : ''}`}
                  onClick={() => {
                    onUpdate({ travelRadius: option.value as 10 | 25 | 50 | 100 })
                    if (errors.travelRadius) {
                      setErrors(prev => ({ ...prev, travelRadius: '' }))
                    }
                  }}
                >
                  <div className="text-lg font-semibold text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {option.description}
                  </div>
                  <input
                    type="radio"
                    name="travelRadius"
                    value={option.value}
                    checked={data.travelRadius === option.value}
                    onChange={() => onUpdate({ travelRadius: option.value as 10 | 25 | 50 | 100 })}
                    className="sr-only"
                  />
                </div>
              ))}
            </div>
            
            {errors.travelRadius && (
              <p className="text-sm text-red-600">{errors.travelRadius}</p>
            )}
          </div>
        )}

        {/* Additional Location Notes */}
        <div className="space-y-2">
          <Label htmlFor="location-notes">Additional Location Notes (Optional)</Label>
          <textarea
            id="location-notes"
            placeholder="Any specific location requirements, parking availability, accessibility needs, etc."
            value={data.locationNotes || ''}
            onChange={(e) => onUpdate({ locationNotes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        {/* Location Summary */}
        {data.workArrangement && data.location && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-900 mb-2">Location Summary</h4>
            <p className="text-sm text-green-800">
              {data.workArrangement === 'remote' 
                ? `Talent can work remotely from anywhere. Your business is located in ${data.location}.`
                : data.workArrangement === 'on-site'
                ? `Talent will work on-site at your location in ${data.location}. Maximum travel distance: ${data.travelRadius} km.`
                : `Talent will work ${data.hybridPercentage}% on-site in ${data.location} and ${100 - (data.hybridPercentage || 50)}% remotely. Maximum travel distance: ${data.travelRadius} km.`
              }
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            Previous: Skills & Requirements
          </Button>
          <Button onClick={handleNext}>
            Next: Budget & Timeline
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
