'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SearchableCitySelect } from '@/components/ui/searchable-city-select'
import { 
  MapPinIcon, 
  BriefcaseIcon, 
  PlusIcon, 
  XMarkIcon,
  BuildingOfficeIcon,
  TruckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface PreferencesTabProps {
  profile: any
  setProfile: (profile: any) => void
  updateWorkPreferences?: (preferencesData: any) => void
  updateLocation?: (locationData: any) => void
  addIndustryExperience?: (experienceData: any) => void
  updateIndustryExperience?: (id: string, updates: any) => void
  removeIndustryExperience?: (id: string) => void
  isEditing: boolean
}

export function PreferencesTab({ 
  profile, 
  setProfile, 
  updateWorkPreferences, 
  updateLocation,
  addIndustryExperience, 
  updateIndustryExperience, 
  removeIndustryExperience, 
  isEditing 
}: PreferencesTabProps) {
  
  // Local state for preferences with proper defaults (only fields used in frontend)
  const [localWorkPreferences, setLocalWorkPreferences] = useState({
    arrangements: profile?.workPreferences?.arrangements || [],
    travelRadius: profile?.workPreferences?.travelRadius || 25,
    onSitePercentage: profile?.workPreferences?.onSitePercentage || 50,
    preferredLocations: profile?.workPreferences?.preferredLocations || []
  })
  const [localIndustryExperience, setLocalIndustryExperience] = useState(profile?.workPreferences?.industryExperience || profile?.industryExperience || [])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Update local state when profile changes
  useEffect(() => {
    setLocalWorkPreferences({
      arrangements: profile?.workPreferences?.arrangements || [],
      travelRadius: profile?.workPreferences?.travelRadius || 25,
      onSitePercentage: profile?.workPreferences?.onSitePercentage || 50,
      preferredLocations: profile?.workPreferences?.preferredLocations || []
    })
    setLocalIndustryExperience(profile?.workPreferences?.industryExperience || profile?.industryExperience || [])
    setHasUnsavedChanges(false)
  }, [profile])

  // Save changes when exiting edit mode
  useEffect(() => {
    if (!isEditing && hasUnsavedChanges) {
      saveChanges()
    }
  }, [isEditing, hasUnsavedChanges])

  const saveChanges = async () => {
    try {
      // Update profile state immediately for UI feedback
      setProfile((prev: any) => ({
        ...prev,
        workPreferences: localWorkPreferences,
        industryExperience: localIndustryExperience
      }))

      // Save work preferences to backend (including industry experience)
      if (updateWorkPreferences) {
        const dataToSave = {
          ...localWorkPreferences,
          industryExperience: localIndustryExperience
        }
        await updateWorkPreferences(dataToSave)
      }
      
      console.log('✅ Preferences saved:', {
        workPreferences: localWorkPreferences,
        industryExperience: localIndustryExperience
      })
      
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save preferences. Please try again.')
    }
  }
  
  const updateWorkPreferencesLocal = (field: string, value: any) => {
    setHasUnsavedChanges(true)
    setLocalWorkPreferences(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleArrangement = (arrangement: string) => {
    const current = localWorkPreferences.arrangements
    const updated = current.includes(arrangement)
      ? current.filter((a: string) => a !== arrangement)
      : [...current, arrangement]
    
    updateWorkPreferencesLocal('arrangements', updated)
  }

  const addLocation = (location: string) => {
    if (location.trim() && !localWorkPreferences.preferredLocations.includes(location.trim())) {
      updateWorkPreferencesLocal('preferredLocations', [
        ...localWorkPreferences.preferredLocations,
        location.trim()
      ])
    }
  }

  const removeLocation = (location: string) => {
    updateWorkPreferencesLocal('preferredLocations', 
      localWorkPreferences.preferredLocations.filter((l: string) => l !== location)
    )
  }

  const addIndustryExperienceLocal = () => {
    const newExp = {
      industry: '',
      years: 1,
      projects: 1
    }
    setHasUnsavedChanges(true)
    setLocalIndustryExperience((prev: any) => [...prev, newExp])
  }

  const updateIndustryExperienceLocal = (index: number, field: string, value: any) => {
    setHasUnsavedChanges(true)
    setLocalIndustryExperience((prev: any) => prev.map((exp: any, i: number) =>
      i === index ? { ...exp, [field]: value } : exp
    ))
  }

  const removeIndustryExperienceLocal = (index: number) => {
    setHasUnsavedChanges(true)
    setLocalIndustryExperience((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const bcCities = [
    'Vancouver', 'Burnaby', 'Richmond', 'Surrey', 'Langley', 'Coquitlam',
    'North Vancouver', 'West Vancouver', 'New Westminster', 'Port Coquitlam',
    'Maple Ridge', 'Delta', 'White Rock', 'Abbotsford', 'Chilliwack',
    'Kelowna', 'Kamloops', 'Prince George', 'Nanaimo', 'Victoria'
  ]

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education',
    'Manufacturing', 'Real Estate', 'Hospitality', 'Non-profit',
    'Government', 'Media & Entertainment', 'Agriculture', 'Energy',
    'Transportation', 'Professional Services', 'Retail'
  ]

  return (
    <div className="space-y-6">
      {/* Header with unsaved changes indicator */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Work Preferences & Experience</CardTitle>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && isEditing && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Unsaved Changes
                </Badge>
              )}
              {hasUnsavedChanges && isEditing && (
                <Button onClick={saveChanges} size="sm" variant="outline">
                  Save Changes Now
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Set your work arrangement preferences and industry experience
            {hasUnsavedChanges && isEditing && (
              <span className="text-yellow-600 ml-2">• Click "Save Changes" to save your updates</span>
            )}
          </p>
        </CardHeader>
      </Card>
      {/* Work Arrangements */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BriefcaseIcon className="h-5 w-5 text-blue-600" />
            <CardTitle>Work Arrangements</CardTitle>
          </div>
          <p className="text-sm text-gray-600">
            Select your preferred work arrangements and flexibility
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Arrangement Types */}
          <div>
            <Label className="text-base font-medium">Preferred Arrangements</Label>
            <p className="text-sm text-gray-600 mb-3">Select all that apply</p>
            
            {isEditing ? (
              <div className="space-y-3">
                {['on-site', 'hybrid', 'remote'].map((arrangement) => (
                  <div key={arrangement} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={arrangement}
                      checked={localWorkPreferences.arrangements.includes(arrangement)}
                      onChange={() => toggleArrangement(arrangement)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor={arrangement} className="capitalize cursor-pointer">
                      {arrangement.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {localWorkPreferences.arrangements.map((arrangement: string, index: number) => (
                  <Badge key={index} variant="secondary" className="capitalize">
                    {arrangement.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Travel Radius and On-site Percentage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium">Travel Radius</Label>
              <p className="text-sm text-gray-600 mb-3">Maximum distance willing to travel</p>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    {[10, 25, 50, 100].map((radius) => (
                      <div key={radius} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`radius-${radius}`}
                          name="travelRadius"
                          value={radius}
                          checked={localWorkPreferences.travelRadius === radius}
                          onChange={(e) => updateWorkPreferencesLocal('travelRadius', parseInt(e.target.value))}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <Label htmlFor={`radius-${radius}`} className="cursor-pointer">
                          {radius} km
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <TruckIcon className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{localWorkPreferences.travelRadius} km</span>
                </div>
              )}
            </div>

            <div>
              <Label className="text-base font-medium">On-site Percentage (Hybrid)</Label>
              <p className="text-sm text-gray-600 mb-3">Preferred on-site time for hybrid work</p>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={localWorkPreferences.onSitePercentage}
                    onChange={(e) => updateWorkPreferencesLocal('onSitePercentage', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">
                    {localWorkPreferences.onSitePercentage}% on-site
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{localWorkPreferences.onSitePercentage}% on-site</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferred Locations */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-5 w-5 text-green-600" />
            <CardTitle>Preferred Locations</CardTitle>
          </div>
          <p className="text-sm text-gray-600">
            Cities and areas where you prefer to work
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Location (Edit Mode) */}
          {isEditing && (
            <div>
              <Label>Add Location</Label>
              <div className="mt-1">
                <SearchableCitySelect
                  value=""
                  onChange={(city, province) => {
                    const locationString = `${city}, ${province}`
                    addLocation(locationString)
                    
                    // Note: Location updates will be saved when user clicks save button
                    // No immediate API calls - following the save button pattern
                  }}
                  placeholder="Search for cities to add to your preferred locations..."
                />
              </div>
            </div>
          )}

          {/* Current Locations */}
          <div>
            <Label>Selected Locations</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {localWorkPreferences.preferredLocations.map((location: string, index: number) => (
                <div key={index} className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  <MapPinIcon className="h-3 w-3" />
                  <span>{location}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeLocation(location)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Experience */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="h-5 w-5 text-purple-600" />
              <CardTitle>Industry Experience</CardTitle>
            </div>
            {isEditing && (
              <Button onClick={addIndustryExperienceLocal} size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Industry
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Your experience across different industries
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {localIndustryExperience.map((exp: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Industry</Label>
                          <select
                            value={exp.industry}
                            onChange={(e) => updateIndustryExperienceLocal(index, 'industry', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">Select industry...</option>
                            {industries.map(industry => (
                              <option key={industry} value={industry}>{industry}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Years of Experience</Label>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            value={exp.years}
                            onChange={(e) => updateIndustryExperienceLocal(index, 'years', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Projects Completed</Label>
                          <Input
                            type="number"
                            min="0"
                            value={exp.projects}
                            onChange={(e) => updateIndustryExperienceLocal(index, 'projects', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIndustryExperienceLocal(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{exp.industry}</h4>
                      <p className="text-sm text-gray-600">{exp.projects} projects completed</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{exp.years} years</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {localIndustryExperience.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No industry experience added yet</p>
                {isEditing && (
                  <Button onClick={addIndustryExperienceLocal} className="mt-2">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Your First Industry
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences Guidelines */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-900">Work Preferences Tips</h4>
              <ul className="text-sm text-green-800 mt-2 space-y-1">
                <li>• Be flexible with arrangements to get more opportunities</li>
                <li>• Consider your commute time when setting travel radius</li>
                <li>• Industry experience helps with specialized project matching</li>
                <li>• Multiple location preferences increase your project pool</li>
                <li>• Hybrid work is popular with BC businesses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
