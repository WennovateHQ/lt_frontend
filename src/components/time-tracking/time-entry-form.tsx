'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ClockIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api/client'

const timeEntrySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['development', 'design', 'testing', 'meeting', 'research', 'documentation', 'other'])
})

type TimeEntryFormData = z.infer<typeof timeEntrySchema>

interface TimeEntryFormProps {
  contractId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function TimeEntryForm({ contractId, onSuccess, onCancel }: TimeEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // Today's date
      category: 'development'
    }
  })

  const startTime = watch('startTime')
  const endTime = watch('endTime')

  // Calculate hours worked
  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0
    
    const startDate = new Date(`2000-01-01T${start}:00`)
    const endDate = new Date(`2000-01-01T${end}:00`)
    
    if (endDate <= startDate) return 0
    
    const diffMs = endDate.getTime() - startDate.getTime()
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100 // Round to 2 decimal places
  }

  const hoursWorked = calculateHours(startTime, endTime)

  const onSubmit = async (data: TimeEntryFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const timeEntry = {
        ...data,
        hoursWorked,
        contractId
      }

      await apiClient.post(`/contracts/${contractId}/time-entries`, timeEntry)
      
      setSuccess(true)
      reset()
      
      // Call success callback after a short delay to show success message
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
      }, 1500)
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit time entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-700 mb-2">Time Entry Submitted!</h3>
          <p className="text-gray-600">Your time entry has been recorded and is pending approval.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5" />
          Log Time Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                max={new Date().toISOString().split('T')[0]} // Can't log future dates
              />
              {errors.date && (
                <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                {...register('startTime')}
              />
              {errors.startTime && (
                <p className="text-sm text-red-600 mt-1">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                {...register('endTime')}
              />
              {errors.endTime && (
                <p className="text-sm text-red-600 mt-1">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {hoursWorked > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700">
                <ClockIcon className="h-4 w-4" />
                <span className="font-medium">Hours Worked: {hoursWorked}</span>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => setValue('category', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select work category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Work Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe what you worked on during this time..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || hoursWorked <= 0}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Time Entry'}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
