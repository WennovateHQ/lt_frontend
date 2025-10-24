'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ShareIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { FileUpload } from '@/lib/file-sharing/file-manager'
import { useCreateShareLink } from '@/lib/hooks/use-file-sharing'

const shareLinkSchema = z.object({
  expiresIn: z.number().min(1).max(365),
  maxAccesses: z.number().min(1).max(1000).optional(),
  password: z.string().optional(),
  allowDownload: z.boolean().default(true),
  allowPreview: z.boolean().default(true)
})

type ShareLinkFormData = z.infer<typeof shareLinkSchema>

interface ShareLinkModalProps {
  file: FileUpload
  onClose: () => void
}

export function ShareLinkModal({ file, onClose }: ShareLinkModalProps) {
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const createShareLinkMutation = useCreateShareLink()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ShareLinkFormData>({
    resolver: zodResolver(shareLinkSchema),
    defaultValues: {
      expiresIn: 7,
      allowDownload: true,
      allowPreview: true
    }
  })

  const watchedValues = watch()

  const onSubmit = async (data: ShareLinkFormData) => {
    try {
      const result = await createShareLinkMutation.mutateAsync({
        fileId: file.id,
        options: data
      })
      setShareLink(result.shareUrl || null)
    } catch (error) {
      console.error('Failed to create share link:', error)
    }
  }

  const copyToClipboard = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const expirationOptions = [
    { value: 1, label: '1 day' },
    { value: 3, label: '3 days' },
    { value: 7, label: '1 week' },
    { value: 14, label: '2 weeks' },
    { value: 30, label: '1 month' },
    { value: 90, label: '3 months' },
    { value: 365, label: '1 year' }
  ]

  if (shareLink) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShareIcon className="w-5 h-5" />
              Share Link Created
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckIcon className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Share link has been created successfully!
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-green-600">Link copied to clipboard!</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <h4 className="font-medium">Link Settings:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Expires in {watchedValues.expiresIn} day{watchedValues.expiresIn !== 1 ? 's' : ''}</li>
                {watchedValues.maxAccesses && (
                  <li>• Maximum {watchedValues.maxAccesses} access{watchedValues.maxAccesses !== 1 ? 'es' : ''}</li>
                )}
                {watchedValues.password && (
                  <li>• Password protected</li>
                )}
                <li>• Download {watchedValues.allowDownload ? 'allowed' : 'disabled'}</li>
                <li>• Preview {watchedValues.allowPreview ? 'allowed' : 'disabled'}</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={copyToClipboard}>
                <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShareIcon className="w-5 h-5" />
            Create Share Link
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShareIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">{file.originalName}</p>
                <p className="text-xs text-gray-600">
                  {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="expiresIn">Link Expiration</Label>
              <Select
                value={watchedValues.expiresIn?.toString()}
                onValueChange={(value) => setValue('expiresIn', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  {expirationOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.expiresIn && (
                <p className="text-sm text-red-600 mt-1">{errors.expiresIn.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="maxAccesses">Maximum Access Count (Optional)</Label>
              <Input
                {...register('maxAccesses', { valueAsNumber: true })}
                type="number"
                placeholder="Unlimited"
                min="1"
                max="1000"
              />
              <p className="text-xs text-gray-600 mt-1">
                Leave empty for unlimited access
              </p>
              {errors.maxAccesses && (
                <p className="text-sm text-red-600 mt-1">{errors.maxAccesses.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password Protection (Optional)</Label>
              <Input
                {...register('password')}
                type="password"
                placeholder="Enter password"
              />
              <p className="text-xs text-gray-600 mt-1">
                Add a password to restrict access
              </p>
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="allowPreview"
                  checked={watchedValues.allowPreview}
                  onCheckedChange={(checked) => setValue('allowPreview', checked as boolean)}
                />
                <Label htmlFor="allowPreview" className="flex items-center gap-2 cursor-pointer">
                  <EyeIcon className="w-4 h-4" />
                  Allow preview
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="allowDownload"
                  checked={watchedValues.allowDownload}
                  onCheckedChange={(checked) => setValue('allowDownload', checked as boolean)}
                />
                <Label htmlFor="allowDownload" className="flex items-center gap-2 cursor-pointer">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Allow download
                </Label>
              </div>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <ExclamationTriangleIcon className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Anyone with this link will be able to access the file according to the permissions you set.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createShareLinkMutation.isPending}
            >
              {createShareLinkMutation.isPending ? (
                'Creating Link...'
              ) : (
                <>
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Create Share Link
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
