'use client'

import { useState, useEffect } from 'react'
import { ConversationsList } from '@/components/messaging/conversations-list'
import { MessageInterface, Conversation, Message } from '@/components/messaging/message-interface'
import { useAuth } from '@/lib/contexts/auth-context'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

// Mock data - would come from API
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    projectId: 'proj-1',
    projectTitle: 'E-commerce Website Development',
    participants: [
      {
        id: 'business-1',
        name: 'Vancouver Retail Co.',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
        type: 'business',
        isOnline: true
      },
      {
        id: 'talent-1',
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        type: 'talent',
        isOnline: false,
        lastSeen: new Date('2024-01-20T14:30:00')
      }
    ],
    lastMessage: {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'business-1',
      senderName: 'Vancouver Retail Co.',
      senderType: 'business',
      content: 'Great! Let\'s schedule a call to discuss the project requirements in detail.',
      sentAt: new Date('2024-01-20T15:45:00'),
      messageType: 'text'
    },
    unreadCount: 2,
    createdAt: new Date('2024-01-18T10:30:00'),
    updatedAt: new Date('2024-01-20T15:45:00')
  },
  {
    id: 'conv-2',
    projectId: 'proj-2',
    projectTitle: 'Mobile App UI/UX Design',
    participants: [
      {
        id: 'business-2',
        name: 'FitTech Solutions',
        avatar: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop&crop=face',
        type: 'business',
        isOnline: false,
        lastSeen: new Date('2024-01-19T16:20:00')
      },
      {
        id: 'talent-1',
        name: 'Alex Chen',
        type: 'talent',
        isOnline: true
      }
    ],
    lastMessage: {
      id: 'msg-8',
      conversationId: 'conv-2',
      senderId: 'talent-1',
      senderName: 'Alex Chen',
      senderType: 'talent',
      content: 'I\'ve uploaded the initial wireframes for your review. Please let me know your thoughts!',
      sentAt: new Date('2024-01-19T16:20:00'),
      messageType: 'text'
    },
    unreadCount: 0,
    createdAt: new Date('2024-01-17T14:15:00'),
    updatedAt: new Date('2024-01-19T16:20:00')
  },
  {
    id: 'conv-3',
    projectId: 'proj-3',
    projectTitle: 'React Native Mobile App',
    participants: [
      {
        id: 'business-3',
        name: 'InnovateLab',
        avatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop&crop=face',
        type: 'business',
        isOnline: true
      },
      {
        id: 'talent-1',
        name: 'Alex Chen',
        type: 'talent',
        isOnline: true
      }
    ],
    lastMessage: {
      id: 'msg-12',
      conversationId: 'conv-3',
      senderId: 'business-3',
      senderName: 'InnovateLab',
      senderType: 'business',
      content: 'The interview went great! We\'d like to move forward with your proposal.',
      sentAt: new Date('2024-01-21T11:15:00'),
      messageType: 'text'
    },
    unreadCount: 1,
    createdAt: new Date('2024-01-16T09:00:00'),
    updatedAt: new Date('2024-01-21T11:15:00')
  }
]

const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'business-1',
      senderName: 'Vancouver Retail Co.',
      senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
      senderType: 'business',
      content: 'Hi Alex! I reviewed your application for our e-commerce project and I\'m impressed with your portfolio.',
      sentAt: new Date('2024-01-18T11:00:00'),
      readAt: new Date('2024-01-18T11:05:00'),
      messageType: 'text'
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'talent-1',
      senderName: 'Alex Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      senderType: 'talent',
      content: 'Thank you! I\'m excited about the opportunity to work on your e-commerce platform. I have extensive experience with similar projects in the Vancouver area.',
      sentAt: new Date('2024-01-18T11:15:00'),
      readAt: new Date('2024-01-18T11:20:00'),
      messageType: 'text'
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'business-1',
      senderName: 'Vancouver Retail Co.',
      senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
      senderType: 'business',
      content: 'That\'s great to hear! I noticed you mentioned experience with Stripe integration. Can you tell me more about your approach to payment processing?',
      sentAt: new Date('2024-01-18T14:30:00'),
      readAt: new Date('2024-01-18T14:45:00'),
      messageType: 'text'
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'talent-1',
      senderName: 'Alex Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      senderType: 'talent',
      content: 'Absolutely! I typically implement Stripe Connect for marketplace-style platforms, which allows for secure payment processing with proper fee handling. I also ensure PCI compliance and implement proper error handling for failed transactions.\n\nFor your retail business, I would recommend setting up webhooks for inventory management and automated receipt generation.',
      sentAt: new Date('2024-01-20T09:15:00'),
      readAt: new Date('2024-01-20T09:30:00'),
      messageType: 'text'
    },
    {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'business-1',
      senderName: 'Vancouver Retail Co.',
      senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
      senderType: 'business',
      content: 'Great! Let\'s schedule a call to discuss the project requirements in detail.',
      sentAt: new Date('2024-01-20T15:45:00'),
      messageType: 'text'
    }
  ],
  'conv-2': [
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'business-2',
      senderName: 'FitTech Solutions',
      senderAvatar: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop&crop=face',
      senderType: 'business',
      content: 'Hi Alex, we\'d like to move forward with your application for the fitness app UI/UX design.',
      sentAt: new Date('2024-01-17T15:00:00'),
      readAt: new Date('2024-01-17T15:10:00'),
      messageType: 'text'
    },
    {
      id: 'msg-7',
      conversationId: 'conv-2',
      senderId: 'talent-1',
      senderName: 'Alex Chen',
      senderType: 'talent',
      content: 'Fantastic! I\'m excited to work on this project. When would be a good time to discuss the design requirements and user personas?',
      sentAt: new Date('2024-01-17T15:30:00'),
      readAt: new Date('2024-01-17T15:35:00'),
      messageType: 'text'
    },
    {
      id: 'msg-8',
      conversationId: 'conv-2',
      senderId: 'talent-1',
      senderName: 'Alex Chen',
      senderType: 'talent',
      content: 'I\'ve uploaded the initial wireframes for your review. Please let me know your thoughts!',
      sentAt: new Date('2024-01-19T16:20:00'),
      readAt: new Date('2024-01-19T16:25:00'),
      messageType: 'text'
    }
  ],
  'conv-3': [
    {
      id: 'msg-9',
      conversationId: 'conv-3',
      senderId: 'business-3',
      senderName: 'InnovateLab',
      senderAvatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop&crop=face',
      senderType: 'business',
      content: 'Hello Alex! Your React Native experience looks impressive. We\'d like to schedule an interview.',
      sentAt: new Date('2024-01-16T10:00:00'),
      readAt: new Date('2024-01-16T10:15:00'),
      messageType: 'text'
    },
    {
      id: 'msg-10',
      conversationId: 'conv-3',
      senderId: 'talent-1',
      senderName: 'Alex Chen',
      senderType: 'talent',
      content: 'Thank you for the opportunity! I\'m available this week for an interview. What time works best for you?',
      sentAt: new Date('2024-01-16T10:30:00'),
      readAt: new Date('2024-01-16T10:35:00'),
      messageType: 'text'
    },
    {
      id: 'msg-11',
      conversationId: 'conv-3',
      senderId: 'business-3',
      senderName: 'InnovateLab',
      senderAvatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop&crop=face',
      senderType: 'business',
      content: 'How about Thursday at 2 PM? We can do a video call to discuss the technical requirements.',
      sentAt: new Date('2024-01-16T14:20:00'),
      readAt: new Date('2024-01-16T14:25:00'),
      messageType: 'text'
    },
    {
      id: 'msg-12',
      conversationId: 'conv-3',
      senderId: 'business-3',
      senderName: 'InnovateLab',
      senderAvatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop&crop=face',
      senderType: 'business',
      content: 'The interview went great! We\'d like to move forward with your proposal.',
      sentAt: new Date('2024-01-21T11:15:00'),
      messageType: 'text'
    }
  ]
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setMessages(mockMessages[selectedConversation.id] || [])
        setIsLoading(false)
      }, 500)
    }
  }, [selectedConversation])

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    
    // Mark conversation as read
    if (conversation.unreadCount > 0) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      )
    }
  }

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedConversation || !user) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: user.id,
      senderName: (user as any).profile?.displayName || `${(user as any).profile?.firstName} ${(user as any).profile?.lastName}` || user.email,
      senderAvatar: (user as any).profile?.avatar,
      senderType: (user.userType === 'admin' ? 'business' : user.userType) as 'business' | 'talent',
      content,
      sentAt: new Date(),
      messageType: attachments && attachments.length > 0 ? 'file' : 'text',
      attachments: attachments?.map((file, index) => ({
        id: `att-${Date.now()}-${index}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: URL.createObjectURL(file)
      }))
    }

    // Add message to current conversation
    setMessages(prev => [...prev, newMessage])

    // Update conversation with last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
          : conv
      )
    )

    // In real implementation, send to API
    console.log('Sending message:', newMessage)
  }

  const handleMarkAsRead = (messageIds: string[]) => {
    setMessages(prev =>
      prev.map(msg =>
        messageIds.includes(msg.id) && msg.senderId !== user?.id
          ? { ...msg, readAt: new Date() }
          : msg
      )
    )
  }

  const handleTyping = (isTyping: boolean) => {
    // In real implementation, send typing indicator to other participants
    console.log('Typing:', isTyping)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
          <p className="text-gray-500">You need to be logged in to view messages.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      {/* Conversations Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ConversationsList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          currentUserId={user.id}
          onSelectConversation={handleSelectConversation}
          isLoading={false}
        />
      </div>

      {/* Message Interface */}
      <div className="flex-1">
        {selectedConversation ? (
          <MessageInterface
            conversation={selectedConversation}
            messages={messages}
            currentUserId={user.id}
            currentUserType={(user.userType === 'admin' ? 'business' : user.userType) as 'business' | 'talent'}
            onSendMessage={handleSendMessage}
            onMarkAsRead={handleMarkAsRead}
            onTyping={handleTyping}
            isLoading={isLoading}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
