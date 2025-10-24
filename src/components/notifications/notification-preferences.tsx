'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { notificationsService, NotificationPreferences } from '@/lib/api/notifications.service'

export function NotificationPreferencesComponent() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const prefs = await notificationsService.getPreferences()
      setPreferences(prefs)
    } catch (error) {
      console.error('Failed to load notification preferences:', error)
      setMessage({ type: 'error', text: 'Failed to load preferences' })
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    if (!preferences) return

    setSaving(true)
    try {
      const updated = await notificationsService.updatePreferences(preferences)
      setPreferences(updated)
      setMessage({ type: 'success', text: 'Preferences saved successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Failed to save preferences:', error)
      setMessage({ type: 'error', text: 'Failed to save preferences' })
    } finally {
      setSaving(false)
    }
  }

  const updateEmailPreference = (key: keyof NotificationPreferences['email'], value: boolean) => {
    if (!preferences) return
    setPreferences({
      ...preferences,
      email: {
        ...preferences.email,
        [key]: value
      }
    })
  }

  const updatePushPreference = (key: keyof NotificationPreferences['push'], value: boolean) => {
    if (!preferences) return
    setPreferences({
      ...preferences,
      push: {
        ...preferences.push,
        [key]: value
      }
    })
  }

  const updateFrequencyPreference = (key: keyof NotificationPreferences['frequency'], value: boolean) => {
    if (!preferences) return
    
    // Only one frequency can be selected at a time
    const newFrequency = {
      immediate: false,
      daily: false,
      weekly: false,
      never: false,
      [key]: value
    }

    setPreferences({
      ...preferences,
      frequency: newFrequency
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-600">Failed to load notification preferences</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
        <p className="text-gray-600">Manage how and when you receive notifications</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <EnvelopeIcon className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="push" className="flex items-center gap-2">
            <DevicePhoneMobileIcon className="w-4 h-4" />
            Push
          </TabsTrigger>
          <TabsTrigger value="frequency" className="flex items-center gap-2">
            <Cog6ToothIcon className="w-4 h-4" />
            Frequency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-messages" className="font-medium">New Messages</Label>
                    <p className="text-sm text-gray-600">Get notified when you receive new messages</p>
                  </div>
                  <Checkbox
                    id="email-messages"
                    checked={preferences.email.newMessages}
                    onCheckedChange={(checked) => updateEmailPreference('newMessages', checked as boolean)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-applications" className="font-medium">Application Updates</Label>
                    <p className="text-sm text-gray-600">Updates on your job applications and proposals</p>
                  </div>
                  <Checkbox
                    id="email-applications"
                    checked={preferences.email.applicationUpdates}
                    onCheckedChange={(checked) => updateEmailPreference('applicationUpdates', checked as boolean)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-projects" className="font-medium">Project Updates</Label>
                    <p className="text-sm text-gray-600">Updates on your posted projects and matches</p>
                  </div>
                  <Checkbox
                    id="email-projects"
                    checked={preferences.email.projectUpdates}
                    onCheckedChange={(checked) => updateEmailPreference('projectUpdates', checked as boolean)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-payments" className="font-medium">Payment Notifications</Label>
                    <p className="text-sm text-gray-600">Payment confirmations and escrow updates</p>
                  </div>
                  <Checkbox
                    id="email-payments"
                    checked={preferences.email.paymentNotifications}
                    onCheckedChange={(checked) => updateEmailPreference('paymentNotifications', checked as boolean)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-system" className="font-medium">System Notifications</Label>
                    <p className="text-sm text-gray-600">Important system updates and security alerts</p>
                  </div>
                  <Checkbox
                    id="email-system"
                    checked={preferences.email.systemNotifications}
                    onCheckedChange={(checked) => updateEmailPreference('systemNotifications', checked as boolean)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-marketing" className="font-medium">Marketing Emails</Label>
                    <p className="text-sm text-gray-600">Tips, features, and platform updates</p>
                  </div>
                  <Checkbox
                    id="email-marketing"
                    checked={preferences.email.marketingEmails}
                    onCheckedChange={(checked) => updateEmailPreference('marketingEmails', checked as boolean)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="push">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DevicePhoneMobileIcon className="w-5 h-5" />
                Push Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-messages" className="font-medium">New Messages</Label>
                    <p className="text-sm text-gray-600">Instant notifications for new messages</p>
                  </div>
                  <Checkbox
                    id="push-messages"
                    checked={preferences.push.newMessages}
                    onCheckedChange={(checked) => updatePushPreference('newMessages', checked as boolean)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-applications" className="font-medium">Application Updates</Label>
                    <p className="text-sm text-gray-600">Updates on your applications</p>
                  </div>
                  <Checkbox
                    id="push-applications"
                    checked={preferences.push.applicationUpdates}
                    onCheckedChange={(checked) => updatePushPreference('applicationUpdates', checked as boolean)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-projects" className="font-medium">Project Updates</Label>
                    <p className="text-sm text-gray-600">Updates on your projects</p>
                  </div>
                  <Checkbox
                    id="push-projects"
                    checked={preferences.push.projectUpdates}
                    onCheckedChange={(checked) => updatePushPreference('projectUpdates', checked as boolean)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-payments" className="font-medium">Payment Notifications</Label>
                    <p className="text-sm text-gray-600">Payment confirmations</p>
                  </div>
                  <Checkbox
                    id="push-payments"
                    checked={preferences.push.paymentNotifications}
                    onCheckedChange={(checked) => updatePushPreference('paymentNotifications', checked as boolean)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frequency">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog6ToothIcon className="w-5 h-5" />
                Notification Frequency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="freq-immediate"
                    checked={preferences.frequency.immediate}
                    onCheckedChange={(checked) => updateFrequencyPreference('immediate', checked as boolean)}
                  />
                  <div>
                    <Label htmlFor="freq-immediate" className="font-medium">Immediate</Label>
                    <p className="text-sm text-gray-600">Send notifications as they happen</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="freq-daily"
                    checked={preferences.frequency.daily}
                    onCheckedChange={(checked) => updateFrequencyPreference('daily', checked as boolean)}
                  />
                  <div>
                    <Label htmlFor="freq-daily" className="font-medium">Daily Digest</Label>
                    <p className="text-sm text-gray-600">Receive a daily summary of notifications</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="freq-weekly"
                    checked={preferences.frequency.weekly}
                    onCheckedChange={(checked) => updateFrequencyPreference('weekly', checked as boolean)}
                  />
                  <div>
                    <Label htmlFor="freq-weekly" className="font-medium">Weekly Summary</Label>
                    <p className="text-sm text-gray-600">Receive a weekly summary of notifications</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="freq-never"
                    checked={preferences.frequency.never}
                    onCheckedChange={(checked) => updateFrequencyPreference('never', checked as boolean)}
                  />
                  <div>
                    <Label htmlFor="freq-never" className="font-medium">Never</Label>
                    <p className="text-sm text-gray-600">Don't send any email notifications</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}
