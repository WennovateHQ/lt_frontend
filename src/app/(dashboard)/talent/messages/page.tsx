'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ConversationList } from '@/components/messaging/conversation-list'
import { MessageThread } from '@/components/messaging/message-thread'
import { useAuth } from '@/lib/contexts/auth-context'
import { messagesService } from '@/lib/api/messages.service'

export default function TalentMessagesPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get URL parameters for direct conversation links
  const talentId = searchParams.get('talentId')
  const applicationId = searchParams.get('applicationId')

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
    if (talentId && applicationId && conversations.length > 0) {
      // Find existing conversation or create new one
      const existingConversation = conversations.find(c => 
        c.participantUsers?.some((p: any) => p.id === talentId)
      )
      
      if (existingConversation) {
        setSelectedConversationId(existingConversation.id)
      } else {
        // Create new conversation
        createConversationWithTalent(talentId, applicationId)
      }
    }
  }, [talentId, applicationId, conversations])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      const response = await messagesService.getConversations()
      console.log('📨 Talent conversations response:', response)
      setConversations(response.conversations)
    } catch (err: any) {
      console.error('Failed to load conversations:', err)
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
      const conversation = await messagesService.findOrCreateConversation(
        [user!.id, talentId],
        applicationId
      )
      setSelectedConversationId(conversation.id)
      // Refresh conversations list
      loadConversations()
    } catch (err: any) {
      console.error('Failed to create conversation:', err)
      setError('Failed to start conversation')
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

  if (!user) {
    return <div>Please log in to view messages.</div>
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadConversations}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-200px)] flex bg-white rounded-lg shadow">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId || undefined}
          onConversationSelect={setSelectedConversationId}
          currentUserId={user?.id || ''}
        />
      </div>

      {/* Message Thread */}
      <div className="flex-1">
        <MessageThread
          conversation={selectedConversation}
          messages={conversationMessages}
          currentUserId={user?.id || ''}
          onSendMessage={handleSendMessage}
          onMarkAsRead={handleMarkAsRead}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
