'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircleIcon, 
  UserIcon, 
  StarIcon, 
  BriefcaseIcon,
  CameraIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

interface OnboardingChecklistProps {
  profile: any
  onDismiss?: () => void
}

interface ChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
  link: string
  icon: any
}

export function OnboardingChecklist({ profile, onDismiss }: OnboardingChecklistProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Calculate completion status
  const checklistItems: ChecklistItem[] = [
    {
      id: 'profile-picture',
      title: 'Upload Profile Picture',
      description: 'Add a professional photo to your profile',
      completed: !!profile?.avatar && !profile.avatar.includes('dicebear'),
      link: '/talent/profile',
      icon: CameraIcon
    },
    {
      id: 'basic-info',
      title: 'Complete Basic Information',
      description: 'Add your title, bio, and contact details',
      completed: !!(profile?.title && profile?.bio && profile?.phone),
      link: '/talent/profile',
      icon: UserIcon
    },
    {
      id: 'skills',
      title: 'Add Your Skills',
      description: 'List your technical skills and expertise',
      completed: profile?.skills && profile.skills.length > 0,
      link: '/talent/profile?tab=skills',
      icon: StarIcon
    },
    {
      id: 'portfolio',
      title: 'Showcase Your Work',
      description: 'Add portfolio items to highlight your projects',
      completed: profile?.portfolio && profile.portfolio.length > 0,
      link: '/talent/profile?tab=portfolio',
      icon: BriefcaseIcon
    }
  ]

  const completedCount = checklistItems.filter(item => item.completed).length
  const totalCount = checklistItems.length
  const progress = (completedCount / totalCount) * 100
  const isFullyCompleted = completedCount === totalCount

  // Auto-hide when fully completed
  useEffect(() => {
    if (isFullyCompleted) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isFullyCompleted, onDismiss])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              {isFullyCompleted ? '🎉 Profile Complete!' : '👋 Welcome! Complete Your Profile'}
            </CardTitle>
            <CardDescription className="mt-1">
              {isFullyCompleted 
                ? 'Great job! Your profile is all set up and ready to attract opportunities.'
                : 'Complete these steps to improve your visibility to potential clients'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {completedCount} of {totalCount} completed
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {checklistItems.map((item) => (
          <Link href={item.link} key={item.id}>
            <div
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                item.completed
                  ? 'bg-green-50 border-green-200 opacity-75'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer'
              }`}
            >
              <div className="mt-0.5">
                {item.completed ? (
                  <CheckCircleSolidIcon className="h-6 w-6 text-green-600" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-gray-400" />
                  <h4
                    className={`font-medium ${
                      item.completed
                        ? 'text-gray-500 line-through'
                        : 'text-gray-900'
                    }`}
                  >
                    {item.title}
                  </h4>
                </div>
                <p
                  className={`text-sm mt-0.5 ${
                    item.completed ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {item.description}
                </p>
              </div>

              {!item.completed && (
                <Button size="sm" variant="ghost" className="text-blue-600">
                  Complete →
                </Button>
              )}
            </div>
          </Link>
        ))}
      </CardContent>

      {isFullyCompleted && (
        <div className="px-6 pb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800 font-medium">
              ✨ Your profile stands out! You're now ready to start finding opportunities.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
