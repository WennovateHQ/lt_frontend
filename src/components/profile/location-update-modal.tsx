'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api/client'

interface LocationUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationUpdated: () => void
}

const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' }
]

export function LocationUpdateModal({ isOpen, onClose, onLocationUpdated }: LocationUpdateModalProps) {
  const [selectedProvince, setSelectedProvince] = useState('')
  const [city, setCity] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProvince) {
      setError('Please select a province')
      return
    }

    try {
      setIsUpdating(true)
      setError(null)

      // Update user location
      await apiClient.put('/users/location', {
        province: selectedProvince,
        city: city || undefined
      })

      // Call success callback
      onLocationUpdated()
      onClose()
    } catch (err: any) {
      console.error('Failed to update location:', err)
      setError(err.response?.data?.message || 'Failed to update location')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5" />
            Update Your Location
          </DialogTitle>
          <DialogDescription>
            Your province is required to calculate accurate taxes for escrow funding. Please update your business location to continue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
              Province / Territory *
            </label>
            <select
              id="province"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a province...</option>
              {CANADIAN_PROVINCES.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City (Optional)
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Toronto"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !selectedProvince}
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Location'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Why is this required?</strong> Your province determines the applicable tax rates (GST, HST, PST) 
            for platform fees, ensuring accurate billing and compliance with Canadian tax regulations.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
