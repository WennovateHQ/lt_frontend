'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DocumentTextIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { ProjectCreationData } from '@/app/(dashboard)/business/projects/create/page'
import { experienceLevels } from '@/lib/data/skills-taxonomy'

interface ReviewSubmitStepProps {
  data: Partial<ProjectCreationData>
  onUpdate: (data: Partial<ProjectCreationData>) => void
  onSubmit: () => void
  onPrevious: () => void
  isSubmitting: boolean
}

const durationOptions = [
  { value: 'less-than-week', label: 'Less than a week' },
  { value: '1-2-weeks', label: '1-2 weeks' },
  { value: '3-4-weeks', label: '3-4 weeks' },
  { value: '1-2-months', label: '1-2 months' },
  { value: '3-6-months', label: '3-6 months' },
  { value: '6-months-plus', label: '6+ months' },
  { value: 'ongoing', label: 'Ongoing' }
]

export function ReviewSubmitStep({ 
  data, 
  onUpdate, 
  onSubmit, 
  onPrevious, 
  isSubmitting 
}: ReviewSubmitStepProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getWorkArrangementText = () => {
    if (data.workArrangement === 'remote') return 'Remote work'
    if (data.workArrangement === 'on-site') return 'On-site work'
    if (data.workArrangement === 'hybrid') {
      return `Hybrid (${data.hybridPercentage}% on-site, ${100 - (data.hybridPercentage || 50)}% remote)`
    }
    return 'Not specified'
  }

  const getDurationText = () => {
    return durationOptions.find(d => d.value === data.duration)?.label || 'Not specified'
  }

  const getExperienceLevelText = () => {
    return experienceLevels.find(l => l.id === data.experienceLevel)?.name || 'Not specified'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Project</CardTitle>
          <p className="text-sm text-gray-600">
            Please review all the details before publishing your project. You can edit any section by going back to previous steps.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">{data.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{data.description}</p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span><strong>Industry:</strong> {data.industry}</span>
              </div>
              {data.attachments && data.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Attachments ({data.attachments.length})
                  </p>
                  <div className="space-y-1">
                    {data.attachments.map((file, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        • {file.name} ({formatFileSize(file.size)})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skills & Requirements */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Skills & Requirements</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {data.requiredSkills?.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-sm">
                <span><strong>Experience Level:</strong> {getExperienceLevelText()}</span>
              </div>
              {data.additionalRequirements && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Additional Requirements</p>
                  <p className="text-sm text-gray-600">{data.additionalRequirements}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location & Work Arrangement */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Location & Work Arrangement</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="text-sm">
                <span><strong>Business Location:</strong> {data.location}</span>
              </div>
              <div className="text-sm">
                <span><strong>Work Arrangement:</strong> {getWorkArrangementText()}</span>
              </div>
              {(data.workArrangement === 'on-site' || data.workArrangement === 'hybrid') && (
                <div className="text-sm">
                  <span><strong>Maximum Travel Distance:</strong> {data.travelRadius} km</span>
                </div>
              )}
              {data.locationNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Location Notes</p>
                  <p className="text-sm text-gray-600">{data.locationNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Budget & Timeline</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="text-sm">
                <span><strong>Budget Type:</strong> {data.budgetType === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}</span>
              </div>
              <div className="text-sm">
                <span><strong>Budget Range:</strong> ${data.budgetRange?.min} - ${data.budgetRange?.max} CAD{data.budgetType === 'hourly' ? ' per hour' : ' total'}</span>
              </div>
              <div className="text-sm">
                <span><strong>Start Date:</strong> {data.startDate ? new Date(data.startDate).toLocaleDateString() : 'Not specified'}</span>
              </div>
              <div className="text-sm">
                <span><strong>Expected Duration:</strong> {getDurationText()}</span>
              </div>
              {data.deadline && (
                <div className="text-sm">
                  <span><strong>Deadline:</strong> {new Date(data.deadline).toLocaleDateString()}{data.deadlineFlexible ? ' (flexible)' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Project Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Project Summary</h4>
                <p className="text-sm text-blue-800 mt-1">
                  You're looking for {getExperienceLevelText().toLowerCase()} talent with skills in{' '}
                  {data.requiredSkills?.slice(0, 3).join(', ')}
                  {data.requiredSkills && data.requiredSkills.length > 3 && ` and ${data.requiredSkills.length - 3} more`}.{' '}
                  Budget: ${data.budgetRange?.min}-${data.budgetRange?.max} CAD{data.budgetType === 'hourly' ? '/hour' : ' total'}.{' '}
                  {getWorkArrangementText()} in {data.location}.
                </p>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <div className="flex items-start space-x-2 p-4 bg-amber-50 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Before Publishing:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Your project will be visible to all verified talent on the platform</li>
                  <li>• You'll receive applications within 24-48 hours</li>
                  <li>• You can edit or pause your project at any time</li>
                  <li>• Platform fee of 8% applies to successful contracts</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms-agreement"
                checked={data.termsAgreed || false}
                onChange={(e) => onUpdate({ termsAgreed: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms-agreement" className="text-sm text-gray-700">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onPrevious} disabled={isSubmitting}>
              Previous: Budget & Timeline
            </Button>
            <Button 
              onClick={() => {
                console.log('🔴 === PUBLISH BUTTON CLICKED ===');
                console.log('📋 Terms agreed:', data.termsAgreed);
                console.log('📋 Is submitting:', isSubmitting);
                console.log('📋 Button disabled:', !data.termsAgreed || isSubmitting);
                onSubmit();
              }} 
              disabled={!data.termsAgreed || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Publishing...</span>
                </div>
              ) : (
                'Publish Project'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
