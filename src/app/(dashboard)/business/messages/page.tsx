'use client'

import { ConversationList } from '@/components/messaging/conversation-list'
import { Conversation } from '@/lib/api/messages.service'
import { MessageThread, Message } from '@/components/messaging/message-thread'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useSearchParams } from 'next/navigation'
import { messagesService } from '@/lib/api/messages.service'

export default function BusinessMessagesPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conversationCreationAttempted, setConversationCreationAttempted] = useState(false)

  // Get URL parameters for direct conversation
  const talentId = searchParams.get('talentId')
  const applicationId = searchParams.get('applicationId')
  const conversationId = searchParams.get('conversationId')

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId)
    }
  }, [selectedConversationId])

  // Handle direct conversation link
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      // Check if conversation exists in loaded conversations
      const existingConv = conversations.find(c => c.id === conversationId)
      if (existingConv) {
        setSelectedConversationId(conversationId)
      } else {
        // If conversation doesn't exist in list, still try to select it
        // The backend will handle validation
        setSelectedConversationId(conversationId)
      }
    }
  }, [conversationId, conversations])

  // Auto-create conversation if coming from application
  useEffect(() => {
    if (talentId && applicationId && conversations.length > 0 && !conversationCreationAttempted) {
      // Check if conversation already exists
      const existingConv = conversations.find(c => 
        c.participantUsers?.some((p: any) => p.id === talentId)
      )
      
      if (existingConv) {
        console.log('📍 Found existing conversation:', existingConv.id)
        setSelectedConversationId(existingConv.id)
      } else {
        // Create new conversation (only once)
        console.log('📍 No existing conversation found, creating new one')
        setConversationCreationAttempted(true)
        createConversationWithTalent(talentId, applicationId)
      }
    }
  }, [talentId, applicationId, conversations, conversationCreationAttempted])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      setError(null) // Clear any previous errors
      const response = await messagesService.getConversations()
      console.log('✅ Conversations loaded successfully:', response.conversations.length)
      setConversations(response.conversations)
    } catch (err: any) {
      console.error('❌ Failed to load conversations:', err)
      console.error('Error details:', err.response?.data || err.message)
      setError('Failed to load conversations')
      // Fallback to empty array for now
      setConversations([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      console.log('🔍 Loading messages for conversation:', conversationId)
      const response = await messagesService.getMessages({ conversationId })
      console.log('📨 Messages response:', response)
      console.log('📨 Messages array:', response.messages)
      setMessages(response.messages)
    } catch (err: any) {
      console.error('Failed to load messages:', err)
      setMessages([])
    }
  }

  const createConversationWithTalent = async (talentId: string, applicationId?: string) => {
    try {
      console.log('🔄 Creating conversation with talent:', talentId)
      const conversation = await messagesService.findOrCreateConversation(
        [user!.id, talentId],
        applicationId
      )
      console.log('✅ Conversation created:', conversation.id)
      setSelectedConversationId(conversation.id)
      // Refresh conversations list
      await loadConversations()
    } catch (err: any) {
      console.error('❌ Failed to create conversation:', err)
      console.error('Error details:', err.response?.data || err.message)
      // Don't set global error state - conversations list is still valid
      // User can still see and use existing conversations
      alert('Could not start conversation with this talent. They may not have an account yet.')
    }
  }

  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null
  const conversationMessages = messages.filter(m => m.conversationId === selectedConversationId)
  
  console.log('🔍 Debug - selectedConversationId:', selectedConversationId)
  console.log('🔍 Debug - all messages:', messages)
  console.log('🔍 Debug - filtered conversationMessages:', conversationMessages)

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedConversationId) return
    
    try {
      await messagesService.sendMessage(selectedConversationId, {
        content,
        attachments
      })
      // Reload messages
      loadMessages(selectedConversationId)
    } catch (err: any) {
      console.error('Failed to send message:', err)
    }
  }

  const handleMarkAsRead = async (messageIds: string[]) => {
    if (!selectedConversationId) return
    
    try {
      await messagesService.markAsRead(selectedConversationId, messageIds)
    } catch (err: any) {
      console.error('Failed to mark as read:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadConversations}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex">
      <div className="w-1/3 border-r border-gray-200">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId || undefined}
          onConversationSelect={setSelectedConversationId}
          currentUserId={user?.id || ''}
        />
      </div>
      <div className="flex-1">
        <MessageThread
          conversation={selectedConversation}
          messages={conversationMessages}
          currentUserId={user?.id || ''}
          onSendMessage={handleSendMessage}
          onMarkAsRead={handleMarkAsRead}
        />
      </div>
    </div>
  )
}
