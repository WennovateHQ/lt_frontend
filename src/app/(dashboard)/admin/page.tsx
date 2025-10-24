'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default function AdminDashboardPage() {
  return (
    <AuthGuard requiredUserType="admin">
      <AdminDashboard />
    </AuthGuard>
  )
}
