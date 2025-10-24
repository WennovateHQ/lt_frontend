'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CurrencyDollarIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline'
import { formatCurrency } from '@/lib/utils'

interface RatesTabProps {
  profile: any
  setProfile: (profile: any) => void
  updateRateStructure?: (rateData: any) => void
  updateAvailability?: (availabilityData: any) => void
  isEditing: boolean
}

export function RatesTab({ profile, setProfile, updateRateStructure, updateAvailability, isEditing }: RatesTabProps) {
  // Local state for rates and availability
  const [localHourlyRate, setLocalHourlyRate] = useState(profile?.hourlyRate?.toString() || "");
  const [localHours, setLocalHours] = useState(profile?.availability?.hoursPerWeek?.toString() || "40");
  const [localStartDate, setLocalStartDate] = useState(profile?.availability?.startDate || new Date().toISOString().split('T')[0]);
  const [localStatus, setLocalStatus] = useState(profile?.availability?.status || 'AVAILABLE');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update local state when profile changes
  useEffect(() => {
    setLocalHourlyRate(profile?.hourlyRate?.toString() || "");
    setLocalHours(profile?.availability?.hoursPerWeek?.toString() || "40");
    setLocalStartDate(profile?.availability?.startDate || new Date().toISOString().split('T')[0]);
    setLocalStatus(profile?.availability?.status || 'AVAILABLE');
    setHasUnsavedChanges(false);
  }, [profile]);

  // Save changes when exiting edit mode
  useEffect(() => {
    if (!isEditing && hasUnsavedChanges) {
      saveChanges();
    }
  }, [isEditing, hasUnsavedChanges]);

  const saveChanges = async () => {
    try {
      // Update local profile state immediately for UI feedback
      const hourlyRateValue = parseInt(localHourlyRate) || 0;
      const availabilityData = {
        status: localStatus,
        hoursPerWeek: parseInt(localHours) || 40,
        startDate: localStartDate
      };

      setProfile((prev: any) => ({
        ...prev,
        hourlyRate: hourlyRateValue,
        availability: availabilityData
      }));

      // Save rate structure
      if (updateRateStructure) {
        await updateRateStructure({ hourlyRate: hourlyRateValue });
      }
      
      // Save availability
      if (updateAvailability) {
        await updateAvailability(availabilityData);
      }
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving rates and availability:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const updateLocalData = (field: string, value: any) => {
    setHasUnsavedChanges(true);
    
    if (field === 'hourlyRate') {
      setLocalHourlyRate(value);
    } else if (field === 'status') {
      setLocalStatus(value);
    } else if (field === 'hoursPerWeek') {
      setLocalHours(value);
    } else if (field === 'startDate') {
      setLocalStartDate(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with unsaved changes indicator */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rates & Availability</CardTitle>
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
            Set your hourly rate and availability preferences
            {hasUnsavedChanges && isEditing && (
              <span className="text-yellow-600 ml-2">• Click "Save Changes" to save your updates</span>
            )}
          </p>
        </CardHeader>
      </Card>

      {/* Hourly Rate */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
            <CardTitle>Hourly Rate</CardTitle>
          </div>
          <p className="text-sm text-gray-600">
            Set your standard hourly rate
          </p>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-base font-medium">Standard Hourly Rate</Label>
            <p className="text-sm text-gray-600 mb-3">Your base rate for most projects</p>
            {isEditing ? (
              <div className="max-w-xs">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="75"
                    value={localHourlyRate}
                    onChange={(e) => updateLocalData('hourlyRate', e.target.value)}
                    className="pl-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">/hour</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  ${profile.hourlyRate || 0}/hour
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Availability & Status - Reusing from Overview Tab */}
      <Card>
        <CardHeader>
          <CardTitle>Availability & Status</CardTitle>
          <p className="text-sm text-gray-600">
            Manage your current availability and capacity
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Status</Label>
            {isEditing ? (
              <Select
                value={localStatus}
                onValueChange={(value) => updateLocalData('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="BUSY">Busy</SelectItem>
                  <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${
                  profile.availability?.status === 'AVAILABLE' ? 'bg-green-500' : 
                  profile.availability?.status === 'BUSY' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="capitalize font-medium">{profile.availability?.status || 'Available'}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Hours per Week</Label>
              {isEditing ? (
                <Input
                  type="number"
                  min="1"
                  max="80"
                  value={localHours}
                  onChange={(e) => updateLocalData('hoursPerWeek', e.target.value)}
                  placeholder="40"
                />
              ) : (
                <p className="text-gray-900">{profile.availability?.hoursPerWeek || 40} hours</p>
              )}
            </div>
            <div>
              <Label>Available From</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={localStartDate}
                  onChange={(e) => updateLocalData('startDate', e.target.value)}
                />
              ) : (
                <p className="text-gray-900">{profile.availability?.startDate || 'Not set'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Rate Setting Tips</h4>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• Research market rates in BC for your skill level</li>
                <li>• Consider your experience, expertise, and unique value</li>
                <li>• Start with a competitive base rate and adjust based on demand</li>
                <li>• Factor in your overhead costs and desired profit margin</li>
                <li>• Review and update your rates regularly as you gain experience</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
