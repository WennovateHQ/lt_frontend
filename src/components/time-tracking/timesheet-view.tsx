'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { formatDate, formatCurrency } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'
import { TimeEntryForm } from './time-entry-form'
import { TimeEntry, TimesheetSummary } from '@/lib/api/time-tracking.service'

interface TimesheetViewProps {
  contractId: string
  userRole: 'business' | 'talent'
  canEdit: boolean
}

export function TimesheetView({ contractId, userRole, canEdit }: TimesheetViewProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [summary, setSummary] = useState<TimesheetSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('current') // current, previous, all
  const [filterStatus, setFilterStatus] = useState('all') // all, pending, approved, rejected

  useEffect(() => {
    fetchTimeEntries()
  }, [contractId, selectedPeriod, filterStatus])

  const fetchTimeEntries = async () => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        period: selectedPeriod,
        status: filterStatus !== 'all' ? filterStatus : ''
      })
      
      const response = await apiClient.get(`/contracts/${contractId}/time-entries?${params}`) as any
      setTimeEntries(response.timeEntries || [])
      setSummary(response.summary || null)
      
    } catch (error) {
      console.error('Error fetching time entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveTimeEntry = async (timeEntryId: string) => {
    try {
      await apiClient.put(`/time-entries/${timeEntryId}/approve`)
      await fetchTimeEntries()
    } catch (error) {
      console.error('Error approving time entry:', error)
    }
  }

  const handleRejectTimeEntry = async (timeEntryId: string, reason: string) => {
    try {
      await apiClient.put(`/time-entries/${timeEntryId}/reject`, { reason })
      await fetchTimeEntries()
    } catch (error) {
      console.error('Error rejecting time entry:', error)
    }
  }

  const handleExportTimesheet = async () => {
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        format: 'pdf'
      })
      
      const response = await apiClient.get(`/contracts/${contractId}/timesheet/export?${params}`, {
        responseType: 'blob'
      }) as any
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `timesheet-${contractId}-${selectedPeriod}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
    } catch (error) {
      console.error('Error exporting timesheet:', error)
    }
  }

  const getStatusBadge = (status: TimeEntry['status']) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, icon: ClockIcon, text: 'Pending' },
      APPROVED: { variant: 'success' as const, icon: CheckCircleIcon, text: 'Approved' },
      REJECTED: { variant: 'destructive' as const, icon: XMarkIcon, text: 'Rejected' },
      PAID: { variant: 'default' as const, icon: CheckCircleIcon, text: 'Paid' }
    }
    
    const config = variants[status]
    
    if (!config) {
      console.warn(`Unknown time entry status: ${status}`)
      return <Badge variant="secondary">{status}</Badge>
    }
    
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      development: 'bg-blue-100 text-blue-800',
      design: 'bg-purple-100 text-purple-800',
      testing: 'bg-green-100 text-green-800',
      meeting: 'bg-yellow-100 text-yellow-800',
      research: 'bg-indigo-100 text-indigo-800',
      documentation: 'bg-gray-100 text-gray-800',
      other: 'bg-orange-100 text-orange-800'
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  if (showAddForm && userRole === 'talent' && canEdit) {
    return (
      <TimeEntryForm
        contractId={contractId}
        onSuccess={() => {
          setShowAddForm(false)
          fetchTimeEntries()
        }}
        onCancel={() => setShowAddForm(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold">{summary.totalHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Approved Hours</p>
                  <p className="text-2xl font-bold text-green-600">{summary.approvedHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Pending Hours</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.pendingHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalEarnings)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Timesheet
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {userRole === 'talent' && canEdit && (
                <Button onClick={() => setShowAddForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Time Entry
                </Button>
              )}
              
              <Button variant="outline" onClick={handleExportTimesheet}>
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Period</SelectItem>
                  <SelectItem value="previous">Previous Period</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                  <SelectItem value="approved">Approved Only</SelectItem>
                  <SelectItem value="rejected">Rejected Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : timeEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No time entries found for the selected period.</p>
              {userRole === 'talent' && canEdit && (
                <Button 
                  className="mt-4" 
                  onClick={() => setShowAddForm(true)}
                >
                  Add Your First Time Entry
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  {userRole === 'business' && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {entry.startTime && entry.endTime ? `${entry.startTime} - ${entry.endTime}` : '-'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {typeof entry.hours === 'string' ? parseFloat(entry.hours) : entry.hours}h
                    </TableCell>
                    <TableCell>
                      {entry.category ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}>
                          {entry.category}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate" title={entry.description}>
                        {entry.description}
                      </p>
                      {entry.status === 'REJECTED' && entry.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {entry.rejectionReason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(entry.status)}
                    </TableCell>
                    {userRole === 'business' && (
                      <TableCell>
                        {entry.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleApproveTimeEntry(entry.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const reason = prompt('Reason for rejection:')
                                if (reason) {
                                  handleRejectTimeEntry(entry.id, reason)
                                }
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
