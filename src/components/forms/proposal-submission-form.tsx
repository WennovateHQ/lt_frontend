'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DocumentArrowUpIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'

const proposalSchema = z.object({
  coverLetter: z.string().min(100, 'Cover letter must be at least 100 characters'),
  proposedRate: z.number().min(10, 'Rate must be at least $10/hour').optional(),
  proposedBudget: z.number().min(100, 'Budget must be at least $100').optional(),
  rateType: z.enum(['hourly', 'fixed']),
  estimatedHours: z.number().min(1, 'Estimated hours required').optional(),
  estimatedTimeline: z.string().min(1, 'Timeline is required'),
  startDate: z.date(),
  questions: z.string().optional(),
  portfolioSamples: z.array(z.any()).max(5, 'Maximum 5 portfolio samples'),
  availability: z.string().min(1, 'Availability information required'),
  additionalNotes: z.string().optional()
}).refine((data) => {
  if (data.rateType === 'hourly' && !data.proposedRate) {
    return false;
  }
  if (data.rateType === 'fixed' && !data.proposedBudget) {
    return false;
  }
  return true;
}, {
  message: "Rate or budget is required based on project type",
  path: ["proposedRate"]
})

type ProposalFormData = z.infer<typeof proposalSchema>

interface ProposalSubmissionFormProps {
  projectId: string
  projectTitle: string
  projectBudget: { min: number; max: number; type: 'hourly' | 'fixed' }
  onSubmit: (data: ProposalFormData) => Promise<void>
  onCancel: () => void
}

export function ProposalSubmissionForm({ 
  projectId, 
  projectTitle, 
  projectBudget, 
  onSubmit, 
  onCancel 
}: ProposalSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([])

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      rateType: projectBudget.type,
      proposedRate: projectBudget.type === 'hourly' ? projectBudget.min : undefined,
      proposedBudget: projectBudget.type === 'fixed' ? projectBudget.min : undefined,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
      portfolioSamples: [],
      questions: ''
    }
  })

  const watchRateType = form.watch('rateType')
  const watchProposedRate = form.watch('proposedRate')
  const watchProposedBudget = form.watch('proposedBudget')
  const watchEstimatedHours = form.watch('estimatedHours')

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (portfolioFiles.length + files.length > 5) {
      alert('Maximum 5 portfolio samples allowed')
      return
    }
    setPortfolioFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setPortfolioFiles(prev => prev.filter((_, i) => i !== index))
  }


  const calculateTotalValue = () => {
    if (watchRateType === 'hourly' && watchEstimatedHours && watchProposedRate) {
      return watchProposedRate * watchEstimatedHours
    }
    if (watchRateType === 'fixed' && watchProposedBudget) {
      return watchProposedBudget
    }
    return watchProposedRate || watchProposedBudget || 0
  }

  const handleSubmit = async (data: ProposalFormData) => {
    try {
      setIsSubmitting(true)
      const proposalData = {
        ...data,
        portfolioSamples: portfolioFiles
      }
      await onSubmit(proposalData)
    } catch (error) {
      console.error('Failed to submit proposal:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Proposal</h1>
        <p className="text-gray-600">Project: <span className="font-medium">{projectTitle}</span></p>
        <div className="flex items-center gap-4 mt-2">
          <Badge variant="outline">
            Budget: {projectBudget.type === 'hourly' ? '$' + projectBudget.min + '-' + projectBudget.max + '/hr' : '$' + projectBudget.min.toLocaleString() + '-' + projectBudget.max.toLocaleString()}
          </Badge>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Cover Letter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DocumentArrowUpIcon className="h-5 w-5" />
              Cover Letter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="coverLetter">
                Tell the client why you're the perfect fit for this project
              </Label>
              <Textarea
                {...form.register('coverLetter')}
                id="coverLetter"
                rows={6}
                placeholder="Describe your relevant experience, approach to the project, and why you're interested in working with this client..."
                className="mt-2"
              />
              {form.formState.errors.coverLetter && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.coverLetter.message}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {form.watch('coverLetter')?.length || 0}/100 characters minimum
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rateType">Project Type</Label>
                <select
                  {...form.register('rateType')}
                  id="rateType"
                  disabled={true} // Disabled since it's determined by project
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="hourly">Hourly Rate</option>
                  <option value="fixed">Fixed Price</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Project type is set by the client
                </p>
              </div>

              {watchRateType === 'hourly' ? (
                <div>
                  <Label htmlFor="proposedRate">Hourly Rate ($)</Label>
                  <Input
                    {...form.register('proposedRate', { valueAsNumber: true })}
                    id="proposedRate"
                    type="number"
                    min={projectBudget.min}
                    max={projectBudget.max}
                    placeholder="75"
                    className="mt-1"
                  />
                  {form.formState.errors.proposedRate && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.proposedRate.message}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Range: ${projectBudget.min} - ${projectBudget.max}/hr
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="proposedBudget">Total Project Budget ($)</Label>
                  <Input
                    {...form.register('proposedBudget', { valueAsNumber: true })}
                    id="proposedBudget"
                    type="number"
                    min={projectBudget.min}
                    max={projectBudget.max}
                    placeholder="5000"
                    className="mt-1"
                  />
                  {form.formState.errors.proposedBudget && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.proposedBudget.message}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Range: ${projectBudget.min.toLocaleString()} - ${projectBudget.max.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {watchRateType === 'hourly' && (
              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  {...form.register('estimatedHours', { valueAsNumber: true })}
                  id="estimatedHours"
                  type="number"
                  min={1}
                  placeholder="40"
                  className="mt-1"
                />
                {form.formState.errors.estimatedHours && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.estimatedHours.message}
                  </p>
                )}
              </div>
            )}

            {/* Total Value Display */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">
                  {watchRateType === 'hourly' ? 'Estimated Project Value:' : 'Total Project Budget:'}
                </span>
                <span className="text-xl font-bold text-blue-600">
                  ${calculateTotalValue().toLocaleString()}
                </span>
              </div>
              {watchRateType === 'hourly' && watchEstimatedHours && watchProposedRate && (
                <p className="text-sm text-gray-600 mt-1">
                  ${watchProposedRate}/hr × {watchEstimatedHours} hours
                </p>
              )}
              {watchRateType === 'fixed' && (
                <p className="text-sm text-gray-600 mt-1">
                  Fixed-price project budget
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Timeline & Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Earliest Start Date</Label>
                <Input
                  {...form.register('startDate', { valueAsDate: true })}
                  id="startDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
                {form.formState.errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="estimatedTimeline">Estimated Timeline</Label>
                <select
                  {...form.register('estimatedTimeline')}
                  id="estimatedTimeline"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select timeline</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="3-4 weeks">3-4 weeks</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="2-3 months">2-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6+ months">6+ months</option>
                </select>
                {form.formState.errors.estimatedTimeline && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.estimatedTimeline.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="availability">Your Availability</Label>
              <Textarea
                {...form.register('availability')}
                id="availability"
                rows={3}
                placeholder="Describe your current availability, working hours, and any scheduling constraints..."
                className="mt-1"
              />
              {form.formState.errors.availability && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.availability.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Samples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DocumentArrowUpIcon className="h-5 w-5" />
              Portfolio Samples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Upload relevant work samples (max 5 files)</Label>
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              
              {portfolioFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {portfolioFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QuestionMarkCircleIcon className="h-5 w-5" />
              Questions for Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...form.register('questions')}
              rows={4}
              placeholder="Any questions about the project requirements, timeline, or technical specifications?"
              className="w-full"
            />
            {form.formState.errors.questions && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.questions.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...form.register('additionalNotes')}
              rows={4}
              placeholder="Any additional information you'd like to share with the client..."
            />
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
