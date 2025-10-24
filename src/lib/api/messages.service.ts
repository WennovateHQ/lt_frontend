import { apiClient } from './client'

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

export interface Conversation {
  id: string
  participants: Array<{
    userId: string
    joinedAt: string
    lastReadAt?: string
  }>
  projectId?: string
  lastMessage?: Message
  unreadCount: number
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
  // Populated fields
  participantUsers?: Array<{
    id: string
    firstName: string
    lastName: string
    avatar?: string
    userType: 'business' | 'talent'
    companyName?: string
  }>
  project?: {
    id: string
    title: string
  }
}

export interface CreateConversationRequest {
  participantIds: string[]
  projectId?: string
  initialMessage?: string
}

export interface SendMessageRequest {
  content: string
  messageType?: 'text' | 'file'
  attachments?: File[]
}

export interface ConversationSearchParams {
  status?: 'active' | 'archived'
  projectId?: string
  page?: number
  limit?: number
  sortBy?: 'updatedAt' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface MessageSearchParams {
  conversationId: string
  page?: number
  limit?: number
  before?: string // message ID
  after?: string // message ID
}

export interface ConversationSearchResponse {
  conversations: Conversation[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface MessageSearchResponse {
  messages: Message[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export class MessagesService {
  // Conversations
  async getConversations(params?: ConversationSearchParams): Promise<ConversationSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ConversationSearchResponse>(`/messages/conversations?${searchParams.toString()}`)
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    return apiClient.get<Conversation>(`/messages/conversations/${conversationId}`)
  }

  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    return apiClient.post<Conversation>('/messages/conversations', data)
  }

  async archiveConversation(conversationId: string): Promise<Conversation> {
    return apiClient.post<Conversation>(`/messages/conversations/${conversationId}/archive`)
  }

  async unarchiveConversation(conversationId: string): Promise<Conversation> {
    return apiClient.post<Conversation>(`/messages/conversations/${conversationId}/unarchive`)
  }

  // Messages
  async getMessages(params: MessageSearchParams): Promise<MessageSearchResponse> {
    const { conversationId, ...searchParams } = params
    const urlParams = new URLSearchParams()
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlParams.append(key, value.toString())
      }
    })

    return apiClient.get<MessageSearchResponse>(`/messages/conversations/${conversationId}/messages?${urlParams.toString()}`)
  }

  async sendMessage(conversationId: string, data: SendMessageRequest): Promise<Message> {
    if (data.attachments && data.attachments.length > 0) {
      // Handle file uploads
      const formData = new FormData()
      formData.append('content', data.content)
      formData.append('messageType', data.messageType || 'text')
      
      data.attachments.forEach((file, index) => {
        formData.append(`attachments`, file)
      })

      return apiClient.post<Message>(`/messages/conversations/${conversationId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } else {
      // Text message only
      return apiClient.post<Message>(`/messages/conversations/${conversationId}/messages`, {
        content: data.content,
        messageType: data.messageType || 'text'
      })
    }
  }

  async markAsRead(conversationId: string, messageIds?: string[]): Promise<void> {
    return apiClient.post<void>(`/messages/conversations/${conversationId}/read`, {
      messageIds
    })
  }

  async deleteMessage(messageId: string): Promise<void> {
    return apiClient.delete<void>(`/messages/${messageId}`)
  }

  // Utility methods
  async getUnreadCount(): Promise<{ totalUnread: number }> {
    return apiClient.get<{ totalUnread: number }>('/messages/unread-count')
  }

  async searchMessages(query: string, conversationId?: string): Promise<MessageSearchResponse> {
    const searchParams = new URLSearchParams()
    searchParams.append('query', query)
    
    if (conversationId) {
      searchParams.append('conversationId', conversationId)
    }

    return apiClient.get<MessageSearchResponse>(`/messages/search?${searchParams.toString()}`)
  }

  // Find or create conversation with specific users
  async findOrCreateConversation(participantIds: string[], projectId?: string): Promise<Conversation> {
    return apiClient.post<Conversation>('/messages/conversations/find-or-create', {
      participantIds,
      projectId
    })
  }
}

export const messagesService = new MessagesService()
