'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import { formatRelativeTime } from '@/lib/utils'
import { Conversation } from './message-interface'

interface ConversationsListProps {
  conversations: Conversation[]
  selectedConversationId?: string
  currentUserId: string
  onSelectConversation: (conversation: Conversation) => void
  onArchiveConversation?: (conversationId: string) => void
  onDeleteConversation?: (conversationId: string) => void
  isLoading?: boolean
}

export function ConversationsList({
  conversations,
  selectedConversationId,
  currentUserId,
  onSelectConversation,
  onArchiveConversation,
  onDeleteConversation,
  isLoading = false
}: ConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')

  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId)
    const matchesSearch = !searchQuery || 
      conversation.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && conversation.unreadCount > 0)
    
    return matchesSearch && matchesFilter
  })

  const sortedConversations = filteredConversations.sort((a, b) => {
    // Sort by last message time, most recent first
    const aTime = a.lastMessage?.sentAt || a.updatedAt
    const bTime = b.lastMessage?.sentAt || b.updatedAt
    return bTime.getTime() - aTime.getTime()
  })

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
            Messages
            {totalUnreadCount > 0 && (
              <Badge className="ml-2 bg-red-500">
                {totalUnreadCount}
              </Badge>
            )}
          </h2>
          <Button variant="ghost" size="sm">
            <EllipsisVerticalIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-1 mt-3">
          {[
            { key: 'all', label: 'All', count: conversations.length },
            { key: 'unread', label: 'Unread', count: conversations.filter(c => c.unreadCount > 0).length },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filterOption.label}
              {filterOption.count > 0 && (
                <span className="ml-1 text-xs">({filterOption.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery 
                ? 'No conversations match your search.'
                : 'Start a conversation by applying to a project or posting one.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(p => p.id !== currentUserId)
              const isSelected = conversation.id === selectedConversationId
              const lastMessageTime = conversation.lastMessage?.sentAt || conversation.updatedAt
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {otherParticipant?.avatar ? (
                        <img
                          src={otherParticipant.avatar}
                          alt={otherParticipant.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Online indicator */}
                      {otherParticipant?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium truncate ${
                          conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {otherParticipant?.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(lastMessageTime)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mb-2 truncate">
                        {conversation.projectTitle}
                      </p>

                      {conversation.lastMessage && (
                        <p className={`text-sm truncate ${
                          conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                        }`}>
                          {conversation.lastMessage.senderId === currentUserId && (
                            <span className="text-gray-400">You: </span>
                          )}
                          {conversation.lastMessage.messageType === 'file' 
                            ? '📎 Attachment' 
                            : conversation.lastMessage.content
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
          {totalUnreadCount > 0 && (
            <span>{totalUnreadCount} unread</span>
          )}
        </div>
      </div>
    </div>
  )
}
