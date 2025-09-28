import React from 'react'
import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardHome from '../components/dashboard/DashboardHome'
import ProofManagement from '../components/dashboard/ProofManagement'
import CertificateGeneration from '../components/dashboard/CertificateGeneration'
import AuditLogs from '../components/dashboard/AuditLogs'
import Settings from '../components/dashboard/Settings'
import Statistics from '../components/dashboard/Statistics'

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="proofs" element={<ProofManagement />} />
        <Route path="certificates" element={<CertificateGeneration />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </DashboardLayout>
  )
}

export default Dashboard
