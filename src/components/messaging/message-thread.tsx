'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  UserIcon,
  EllipsisHorizontalIcon,
  CheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { formatRelativeTime, formatDate } from '@/lib/utils'
import { Conversation } from '@/lib/api/messages.service'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  messageType: 'text' | 'file' | 'system'
  attachments?: Array<{
    id: string
    fileName: string
    fileSize: number
    mimeType: string
    downloadUrl: string
  }>
  readBy: Array<{
    userId: string
    readAt: string
  }>
  createdAt: string
  updatedAt: string
  // Populated fields
  sender?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    userType: 'business' | 'talent'
  }
}

interface MessageThreadProps {
  conversation: Conversation | null
  messages: Message[]
  currentUserId: string
  onSendMessage: (content: string, attachments?: File[]) => void
  onMarkAsRead: (messageIds: string[]) => void
  isLoading?: boolean
}

export function MessageThread({
  conversation,
  messages = [],
  currentUserId,
  onSendMessage,
  onMarkAsRead,
  isLoading = false
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark unread messages as read when conversation is selected
  useEffect(() => {
    if (conversation && messages.length > 0) {
      const unreadMessages = messages.filter(
        msg => (!msg.readBy || msg.readBy.length === 0) && msg.senderId !== currentUserId
      )
      if (unreadMessages.length > 0) {
        onMarkAsRead(unreadMessages.map(msg => msg.id))
      }
    }
  }, [conversation, messages, currentUserId, onMarkAsRead])

  const handleSendMessage = () => {
    if (newMessage.trim() || attachments.length > 0) {
      onSendMessage(newMessage.trim(), attachments)
      setNewMessage('')
      setAttachments([])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {}
    
    if (!messages || !Array.isArray(messages)) {
      return groups
    }
    
    messages.forEach(message => {
      if (message && message.createdAt) {
        const date = formatDate(new Date(message.createdAt))
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(message)
      }
    })
    
    return groups
  }

  if (!conversation) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
        </div>
      </Card>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              {conversation.participantUsers?.[0]?.avatar ? (
                <img
                  src={conversation.participantUsers[0].avatar}
                  alt={conversation.participantUsers?.[0]?.firstName || 'User'}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-lg">{conversation.participantUsers?.[0]?.firstName || 'User'}</CardTitle>
              <p className="text-sm text-gray-600">{conversation.project?.title || 'No project'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${
                conversation.participantUsers?.[0]?.userType === 'business'
                  ? 'border-blue-200 text-blue-700'
                  : 'border-green-200 text-green-700'
              }`}
            >
              {conversation.participantUsers?.[0]?.userType === 'business' ? 'Business' : 'Talent'}
            </Badge>
            <Button variant="ghost" size="sm">
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {Object.entries(messageGroups).map(([date, dayMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-xs text-gray-600">{date}</span>
                </div>
              </div>

              {/* Messages for this date */}
              {dayMessages.map((message, index) => {
                const isOwnMessage = message.senderId === currentUserId
                const showAvatar = !isOwnMessage && (
                  index === 0 || 
                  dayMessages[index - 1]?.senderId !== message.senderId
                )

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar (for other user's messages) */}
                    {!isOwnMessage && (
                      <div className="w-8 h-8 shrink-0">
                        {showAvatar && (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            {message.sender?.avatar ? (
                              <img
                                src={message.sender.avatar}
                                alt={`${message.sender.firstName} ${message.sender.lastName}`}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <UserIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message bubble */}
                    <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : ''}`}>
                      {message.messageType === 'system' ? (
                        <div className="text-center">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {message.content}
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {/* Message content */}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map(attachment => (
                                <div
                                  key={attachment.id}
                                  className={`flex items-center gap-2 p-2 rounded border ${
                                    isOwnMessage ? 'border-blue-400 bg-blue-500' : 'border-gray-200 bg-white'
                                  }`}
                                >
                                  <PaperClipIcon className="w-4 h-4" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{attachment.fileName}</p>
                                    <p className="text-xs opacity-75">{formatFileSize(attachment.fileSize)}</p>
                                  </div>
                                  <Button size="sm" variant="ghost" className="h-6 px-2">
                                    Download
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Message metadata */}
                          <div className={`flex items-center justify-between mt-1 text-xs ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span>{formatRelativeTime(message.createdAt)}</span>
                            {isOwnMessage && (
                              <div className="flex items-center gap-1">
                                {message.readBy && message.readBy.length > 0 ? (
                                  <CheckCircleIcon className="w-3 h-3" />
                                ) : (
                                  <CheckIcon className="w-3 h-3" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      {/* Message input */}
      <div className="p-4 border-t">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="mb-3 space-y-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                <PaperClipIcon className="w-4 h-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAttachment(index)}
                  className="h-6 px-2 text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="resize-none"
              disabled={isLoading}
            />
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <PaperClipIcon className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && attachments.length === 0) || isLoading}
            size="sm"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
