'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  XMarkIcon,
  DocumentTextIcon,
  PhotoIcon,
  EllipsisVerticalIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { formatRelativeTime } from '@/lib/utils'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  senderType: 'business' | 'talent'
  content: string
  attachments?: MessageAttachment[]
  sentAt: Date
  readAt?: Date
  editedAt?: Date
  replyToId?: string
  messageType: 'text' | 'file' | 'system'
}

export interface MessageAttachment {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  url: string
  thumbnailUrl?: string
}

export interface Conversation {
  id: string
  projectId: string
  projectTitle: string
  participants: Array<{
    id: string
    name: string
    avatar?: string
    type: 'business' | 'talent'
    isOnline: boolean
    lastSeen?: Date
  }>
  lastMessage?: Message
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

interface MessageInterfaceProps {
  conversation: Conversation
  messages: Message[]
  currentUserId: string
  currentUserType: 'business' | 'talent'
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>
  onMarkAsRead: (messageIds: string[]) => void
  onTyping?: (isTyping: boolean) => void
  isLoading?: boolean
}

export function MessageInterface({
  conversation,
  messages,
  currentUserId,
  currentUserType,
  onSendMessage,
  onMarkAsRead,
  onTyping,
  isLoading = false
}: MessageInterfaceProps) {
  const [messageText, setMessageText] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark messages as read when they come into view
  useEffect(() => {
    const unreadMessages = messages
      .filter(msg => msg.senderId !== currentUserId && !msg.readAt)
      .map(msg => msg.id)
    
    if (unreadMessages.length > 0) {
      onMarkAsRead(unreadMessages)
    }
  }, [messages, currentUserId, onMarkAsRead])

  // Handle typing indicator
  const handleTyping = (text: string) => {
    setMessageText(text)
    
    if (!isTyping) {
      setIsTyping(true)
      onTyping?.(true)
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onTyping?.(false)
    }, 1000)
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() && attachments.length === 0) return
    
    try {
      setIsSending(true)
      await onSendMessage(messageText.trim(), attachments)
      setMessageText('')
      setAttachments([])
      setReplyToMessage(null)
      textareaRef.current?.focus()
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => {
      // Validate file type and size (10MB limit)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'text/plain']
      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 10MB)`)
        return false
      }
      return true
    })
    
    setAttachments(prev => [...prev, ...validFiles])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const getMessageStatus = (message: Message) => {
    if (message.senderId !== currentUserId) return null
    
    if (message.readAt) {
      return (
        <div className="flex">
          <CheckIcon className="h-4 w-4 text-blue-500 -mr-2" />
          <CheckIcon className="h-4 w-4 text-blue-500" />
        </div>
      )
    }
    return <CheckIcon className="h-4 w-4 text-gray-400" />
  }

  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId)

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {otherParticipant?.avatar ? (
              <img
                src={otherParticipant.avatar}
                alt={otherParticipant.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {otherParticipant?.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">{otherParticipant?.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{conversation.projectTitle}</span>
                {otherParticipant?.isOnline && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Online</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <EllipsisVerticalIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId
              const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId
              const isSystem = message.messageType === 'system'
              
              if (isSystem) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {message.content}
                    </div>
                  </div>
                )
              }
              
              return (
                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {showAvatar && !isOwn && (
                      <div className="flex-shrink-0">
                        {message.senderAvatar ? (
                          <img
                            src={message.senderAvatar}
                            alt={message.senderName}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {message.senderName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      {replyToMessage && message.replyToId === replyToMessage.id && (
                        <div className="text-xs text-gray-500 mb-1 px-3">
                          Replying to: {replyToMessage.content.substring(0, 50)}...
                        </div>
                      )}
                      
                      <div className={`rounded-lg px-3 py-2 ${
                        isOwn 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                                {attachment.fileType.startsWith('image/') ? (
                                  <PhotoIcon className="h-4 w-4" />
                                ) : (
                                  <DocumentTextIcon className="h-4 w-4" />
                                )}
                                <span className="text-xs">{attachment.fileName}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-center space-x-1 mt-1 text-xs text-gray-500 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <span>{formatRelativeTime(message.sentAt)}</span>
                        {isOwn && getMessageStatus(message)}
                        {message.editedAt && (
                          <span className="italic">(edited)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">{otherParticipant?.name} is typing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply indicator */}
      {replyToMessage && (
        <div className="border-t border-gray-200 p-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-8 bg-blue-500 rounded"></div>
              <div>
                <p className="text-xs text-gray-500">Replying to {replyToMessage.senderName}</p>
                <p className="text-sm text-gray-700 truncate max-w-xs">
                  {replyToMessage.content}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyToMessage(null)}
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="border-t border-gray-200 p-2 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-white rounded px-2 py-1 text-sm">
                {file.type.startsWith('image/') ? (
                  <PhotoIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                )}
                <span className="truncate max-w-xs">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex space-x-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <PaperClipIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <FaceSmileIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="resize-none min-h-[40px] max-h-32"
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={(!messageText.trim() && attachments.length === 0) || isSending}
            size="sm"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <PaperAirplaneIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
