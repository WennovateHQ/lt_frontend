'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchableCitySelect } from '@/components/ui/searchable-city-select'

interface OverviewTabProps {
  profile: any
  setProfile: (profile: any) => void
  updateProfile?: (profileData: any) => void
  updateLocation?: (locationData: any) => void
  updateAvailability?: (availabilityData: any) => void
  isEditing: boolean
}

export function OverviewTab({ profile, setProfile, updateProfile, updateLocation, updateAvailability, isEditing }: OverviewTabProps) {
  // Debug log to check profile structure
  console.log('OverviewTab profile:', profile);
  console.log('OverviewTab isEditing:', isEditing);
  console.log('OverviewTab availability:', profile?.availability);
  
  // Local state for hours per week and available from date to test editability
  const [localHours, setLocalHours] = useState(profile?.availability?.hoursPerWeek?.toString() || "40");
  const [localStartDate, setLocalStartDate] = useState(profile?.availability?.startDate || new Date().toISOString().split('T')[0]);
  
  // Ensure availability object exists
  if (profile && !profile.availability) {
    profile.availability = {
      status: 'AVAILABLE',
      hoursPerWeek: 40,
      startDate: new Date().toISOString().split('T')[0]
    };
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <img
              src={profile.avatar}
              alt={`${profile.firstName} ${profile.lastName}`}
              className="w-20 h-20 rounded-full"
            />
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={profile.firstName}
                      onChange={(e) => setProfile((prev: any) => ({ 
                        ...prev, 
                        profile: { 
                          ...prev.profile, 
                          firstName: e.target.value 
                        } 
                      }))}
                      placeholder="First Name"
                    />
                    <Input
                      value={profile.lastName}
                      onChange={(e) => setProfile((prev: any) => ({ 
                        ...prev, 
                        profile: { 
                          ...prev.profile, 
                          lastName: e.target.value 
                        } 
                      }))}
                      placeholder="Last Name"
                    />
                  </div>
                  <Input
                    value={profile.title}
                    onChange={(e) => setProfile((prev: any) => ({ 
                      ...prev, 
                      profile: { 
                        ...prev.profile, 
                        title: e.target.value 
                      } 
                    }))}
                    placeholder="Professional Title"
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-gray-600">{profile.title}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((prev: any) => ({ 
                    ...prev, 
                    email: e.target.value 
                  }))}
                />
              ) : (
                <p className="text-gray-900">{profile.email}</p>
              )}
            </div>
            <div>
              <Label>Phone</Label>
              {isEditing ? (
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile((prev: any) => ({ 
                    ...prev, 
                    profile: { 
                      ...prev.profile, 
                      phone: e.target.value 
                    } 
                  }))}
                />
              ) : (
                <p className="text-gray-900">{profile.phone}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <Label>Location</Label>
              {isEditing ? (
                <SearchableCitySelect
                  value={profile.location}
                  onChange={(city, province) => {
                    const locationData = { city, province, country: 'Canada' }
                    setProfile((prev: any) => ({ 
                      ...prev, 
                      profile: { 
                        ...prev.profile, 
                        location: locationData
                      } 
                    }))
                    if (updateLocation) {
                      updateLocation(locationData)
                    }
                  }}
                  placeholder="Search for your city..."
                />
              ) : (
                <p className="text-gray-900">{profile.location}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Professional Bio</Label>
            {isEditing ? (
              <Textarea
                value={profile.bio}
                onChange={(e) => setProfile((prev: any) => ({ 
                  ...prev, 
                  profile: { 
                    ...prev.profile, 
                    bio: e.target.value 
                  } 
                }))}
                rows={4}
                placeholder="Tell clients about your experience, expertise, and what makes you unique..."
              />
            ) : (
              <p className="text-gray-700">{profile.bio}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Availability & Status */}
      <Card>
        <CardHeader>
          <CardTitle>Availability & Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Status</Label>
            {isEditing ? (
              <Select
                value={profile.availability?.status || 'AVAILABLE'}
                onValueChange={(value) => {
                  const availabilityData = { ...profile.availability, status: value }
                  setProfile((prev: any) => ({ 
                    ...prev, 
                    availability: availabilityData
                  }))
                  if (updateAvailability) {
                    updateAvailability(availabilityData)
                  }
                }}
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
                  profile.availability.status === 'AVAILABLE' ? 'bg-green-500' : 
                  profile.availability.status === 'BUSY' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="capitalize font-medium">{profile.availability.status}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Hours per Week {isEditing ? '(EDITING MODE)' : '(VIEW MODE)'}</Label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="80"
                  value={localHours}
                  onChange={(e) => {
                    console.log('Hours per week onChange triggered:', e.target.value);
                    setLocalHours(e.target.value);
                    
                    const newHours = parseInt(e.target.value) || 40
                    const availabilityData = { 
                      status: profile.availability?.status || 'AVAILABLE',
                      hoursPerWeek: newHours,
                      startDate: profile.availability?.startDate || new Date().toISOString().split('T')[0]
                    }
                    console.log('Setting availability data:', availabilityData);
                    setProfile((prev: any) => ({ 
                      ...prev, 
                      availability: availabilityData
                    }))
                  }}
                  onBlur={(e) => {
                    console.log('Hours per week onBlur triggered:', e.target.value);
                    const newHours = parseInt(e.target.value) || 40
                    const availabilityData = { 
                      status: profile.availability?.status || 'AVAILABLE',
                      hoursPerWeek: newHours,
                      startDate: profile.availability?.startDate || new Date().toISOString().split('T')[0]
                    }
                    if (updateAvailability) {
                      updateAvailability(availabilityData)
                    }
                  }}
                  placeholder="40"
                  disabled={false}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              ) : (
                <p className="text-gray-900">{profile.availability.hoursPerWeek} hours</p>
              )}
            </div>
            <div>
              <Label>Available From {isEditing ? '(EDITING MODE)' : '(VIEW MODE)'}</Label>
              {isEditing ? (
                <input
                  type="date"
                  value={localStartDate}
                  onChange={(e) => {
                    console.log('Available from onChange triggered:', e.target.value);
                    setLocalStartDate(e.target.value);
                    
                    const availabilityData = { 
                      status: profile.availability?.status || 'AVAILABLE',
                      hoursPerWeek: parseInt(localHours) || 40,
                      startDate: e.target.value
                    }
                    console.log('Setting availability data (date):', availabilityData);
                    setProfile((prev: any) => ({ 
                      ...prev, 
                      availability: availabilityData
                    }))
                  }}
                  onBlur={(e) => {
                    console.log('Available from onBlur triggered:', e.target.value);
                    const availabilityData = { 
                      status: profile.availability?.status || 'AVAILABLE',
                      hoursPerWeek: parseInt(localHours) || 40,
                      startDate: e.target.value
                    }
                    if (updateAvailability) {
                      updateAvailability(availabilityData)
                    }
                  }}
                  disabled={false}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              ) : (
                <p className="text-gray-900">{profile.availability.startDate}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
