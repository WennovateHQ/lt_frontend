'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BellIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { notificationsService, Notification } from '@/lib/api/notifications.service'
import { formatRelativeTime } from '@/lib/utils'

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    loadNotifications()
    loadUnreadCount()
  }, [selectedTab])

  const loadNotifications = async () => {
    try {
      const response = await notificationsService.getNotifications({
        read: selectedTab === 'unread' ? false : undefined,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      setNotifications(response.notifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await notificationsService.getUnreadCount()
      setUnreadCount(response.count)
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      await notificationsService.markAsRead(notificationIds)
      setNotifications(prev => prev.map(notif => 
        notificationIds.includes(notif.id) 
          ? { ...notif, read: true, readAt: new Date().toISOString() }
          : notif
      ))
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      setNotifications(prev => prev.map(notif => ({
        ...notif,
        read: true,
        readAt: new Date().toISOString()
      })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      const deletedNotif = notifications.find(n => n.id === notificationId)
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <EnvelopeIcon className="w-5 h-5 text-blue-600" />
      case 'application':
        return <BriefcaseIcon className="w-5 h-5 text-green-600" />
      case 'project':
        return <BriefcaseIcon className="w-5 h-5 text-purple-600" />
      case 'payment':
        return <CreditCardIcon className="w-5 h-5 text-yellow-600" />
      case 'system':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
      default:
        return <BellIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-800'
      case 'application': return 'bg-green-100 text-green-800'
      case 'project': return 'bg-purple-100 text-purple-800'
      case 'payment': return 'bg-yellow-100 text-yellow-800'
      case 'system': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredNotifications = selectedTab === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BellIcon className="w-6 h-6" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-gray-600">Stay updated with your latest activities</p>
        </div>
        
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckIcon className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'all' | 'unread')}>
        <TabsList>
          <TabsTrigger value="all">
            All Notifications
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <BellIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                </h3>
                <p className="text-gray-600">
                  {selectedTab === 'unread' 
                    ? "You're all caught up!" 
                    : "We'll notify you when something important happens."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map(notification => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => !notification.read && markAsRead([notification.id])}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          <Badge className={`text-xs ${getNotificationTypeColor(notification.type)}`}>
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {notification.emailSent && (
                              <Badge variant="outline" className="text-xs">
                                Email sent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
