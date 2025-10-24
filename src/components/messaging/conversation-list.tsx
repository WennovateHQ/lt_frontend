'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { formatRelativeTime } from '@/lib/utils'
import { Conversation } from '@/lib/api/messages.service'

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId?: string
  onConversationSelect: (conversationId: string) => void
  currentUserId: string
}

export function ConversationList({
  conversations = [],
  selectedConversationId,
  onConversationSelect,
  currentUserId
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = (conversations || []).filter(conversation => {
    // Get participant name from participantUsers array (excluding current user)
    const otherParticipant = conversation.participantUsers?.find(p => p.id !== currentUserId)
    const participantName = otherParticipant?.companyName || otherParticipant?.firstName || ''
    const projectTitle = conversation.project?.title || ''
    
    return (
      participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conversation.lastMessage?.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const activeConversations = filteredConversations.filter(c => c.status === 'active')
  const archivedConversations = filteredConversations.filter(c => c.status === 'archived')

  const renderConversation = (conversation: Conversation) => {
    const isSelected = conversation.id === selectedConversationId
    const isUnread = conversation.unreadCount > 0
    const isLastMessageFromOther = conversation.lastMessage?.senderId !== currentUserId

    // Get the other participant (not the current user)
    const otherParticipant = conversation.participantUsers?.find(p => p.id !== currentUserId)
    const participantName = otherParticipant?.companyName || 
                           `${otherParticipant?.firstName || ''} ${otherParticipant?.lastName || ''}`.trim() || 
                           'Unknown User'
    const participantType = otherParticipant?.userType || 'talent'
    const participantAvatar = otherParticipant?.avatar
    const projectTitle = conversation.project?.title || 'No project'

    return (
      <div
        key={conversation.id}
        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
          isSelected ? 'bg-blue-50 border-blue-200' : ''
        }`}
        onClick={() => onConversationSelect(conversation.id)}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
            {participantAvatar ? (
              <img
                src={participantAvatar}
                alt={participantName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`font-medium truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                {participantName}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                {isUnread && (
                  <Badge variant="default" className="text-xs px-2 py-0.5">
                    {conversation.unreadCount}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    participantType === 'business'
                      ? 'border-blue-200 text-blue-700'
                      : 'border-green-200 text-green-700'
                  }`}
                >
                  {participantType}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-gray-600 truncate mb-1">
              {projectTitle}
            </p>

            <div className="flex items-center justify-between">
              <p className={`text-sm truncate flex-1 mr-2 ${
                isUnread && isLastMessageFromOther ? 'font-medium text-gray-900' : 'text-gray-500'
              }`}>
                {conversation.lastMessage?.content || 'No messages yet'}
              </p>
              <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {conversation.lastMessage?.createdAt ? formatRelativeTime(conversation.lastMessage.createdAt) : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          Messages
        </CardTitle>
        
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
              <p className="text-gray-600">
                {searchQuery ? 'No conversations match your search.' : 'Start a conversation by applying to a project.'}
              </p>
            </div>
          ) : (
            <div>
              {/* Active Conversations */}
              {activeConversations.length > 0 && (
                <div>
                  {activeConversations.map(renderConversation)}
                </div>
              )}

              {/* Archived Conversations */}
              {archivedConversations.length > 0 && (
                <div className="border-t bg-gray-50">
                  <div className="p-3 border-b bg-gray-100">
                    <h4 className="text-sm font-medium text-gray-700">Archived</h4>
                  </div>
                  {archivedConversations.map(renderConversation)}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
