import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  Activity, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  RefreshCw
} from 'lucide-react'

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterUser, setFilterUser] = useState('all')
  const [dateRange, setDateRange] = useState('7')

  // Sample audit log data
  const auditLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:30:25',
      action: 'Data Wipe Completed',
      type: 'wipe_success',
      user: 'John Doe',
      deviceId: 'DL-001',
      details: 'Successfully wiped Dell Latitude 7420 using DoD 5220.22-M standard',
      ipAddress: '192.168.1.100',
      userAgent: 'VIPER Desktop Client v2.1.0',
      status: 'success'
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:25:12',
      action: 'Certificate Generated',
      type: 'certificate_created',
      user: 'Jane Smith',
      deviceId: 'HD-045',
      details: 'Generated compliance certificate CERT-2024-002 for 3 devices',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'success'
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:20:45',
      action: 'Login Attempt Failed',
      type: 'auth_failed',
      user: 'unknown@example.com',
      deviceId: null,
      details: 'Failed login attempt with invalid credentials',
      ipAddress: '203.0.113.42',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'warning'
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:15:33',
      action: 'Proof Upload',
      type: 'proof_uploaded',
      user: 'Mike Johnson',
      deviceId: 'LT-023',
      details: 'Uploaded cryptographic proof for Lenovo ThinkPad X1',
      ipAddress: '192.168.1.102',
      userAgent: 'VIPER Web Client v1.5.2',
      status: 'success'
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:10:18',
      action: 'Data Wipe Failed',
      type: 'wipe_failed',
      user: 'System',
      deviceId: 'SR-012',
      details: 'Wipe operation failed due to hardware error on Dell PowerEdge R740',
      ipAddress: '192.168.1.50',
      userAgent: 'VIPER Server Agent v3.0.1',
      status: 'error'
    },
    {
      id: 6,
      timestamp: '2024-01-15 14:05:07',
      action: 'User Settings Updated',
      type: 'settings_changed',
      user: 'Admin User',
      deviceId: null,
      details: 'Updated notification preferences and security settings',
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'info'
    },
    {
      id: 7,
      timestamp: '2024-01-15 14:00:52',
      action: 'Audit Report Generated',
      type: 'report_generated',
      user: 'Jane Smith',
      deviceId: null,
      details: 'Generated monthly audit report for January 2024',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'success'
    },
    {
      id: 8,
      timestamp: '2024-01-15 13:55:41',
      action: 'Device Registration',
      type: 'device_registered',
      user: 'John Doe',
      deviceId: 'MB-089',
      details: 'Registered new mobile device Samsung Galaxy S23 for wiping',
      ipAddress: '192.168.1.100',
      userAgent: 'VIPER Mobile App v1.2.0',
      status: 'success'
    }
  ]

  const getActionIcon = (type) => {
    switch (type) {
      case 'wipe_success': return CheckCircle
      case 'wipe_failed': return AlertTriangle
      case 'certificate_created': return FileText
      case 'proof_uploaded': return Shield
      case 'auth_failed': return AlertTriangle
      case 'settings_changed': return User
      case 'report_generated': return FileText
      case 'device_registered': return Activity
      default: return Activity
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-500'
      case 'error': return 'text-red-500'
      case 'warning': return 'text-yellow-500'
      case 'info': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case 'success': return 'bg-green-50 dark:bg-green-900/20'
      case 'error': return 'bg-red-50 dark:bg-red-900/20'
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20'
      case 'info': return 'bg-blue-50 dark:bg-blue-900/20'
      default: return 'bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.deviceId && log.deviceId.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || log.type === filterType
    const matchesUser = filterUser === 'all' || log.user === filterUser
    return matchesSearch && matchesType && matchesUser
  })

  const uniqueUsers = [...new Set(auditLogs.map(log => log.user))]

  const exportLogs = () => {
    // Export functionality
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Timestamp,Action,User,Device ID,Details,IP Address,Status\n" +
      filteredLogs.map(log => 
        `"${log.timestamp}","${log.action}","${log.user}","${log.deviceId || ''}","${log.details}","${log.ipAddress}","${log.status}"`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Audit Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and track all system activities and user actions
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="btn-outline flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportLogs}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: '2,847', icon: Activity, color: 'bg-blue-500' },
          { label: 'Success', value: '2,654', icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Warnings', value: '156', icon: AlertTriangle, color: 'bg-yellow-500' },
          { label: 'Errors', value: '37', icon: AlertTriangle, color: 'bg-red-500' }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Action Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Actions</option>
            <option value="wipe_success">Wipe Success</option>
            <option value="wipe_failed">Wipe Failed</option>
            <option value="certificate_created">Certificate Created</option>
            <option value="proof_uploaded">Proof Uploaded</option>
            <option value="auth_failed">Auth Failed</option>
            <option value="settings_changed">Settings Changed</option>
          </select>

          {/* User Filter */}
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => {
                const ActionIcon = getActionIcon(log.type)
                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getStatusBg(log.status)}`}>
                          <ActionIcon className={`w-4 h-4 ${getStatusColor(log.status)}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {log.user.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {log.user}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.deviceId || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {log.details}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          IP: {log.ipAddress}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBg(log.status)} ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">8</span> of{' '}
                  <span className="font-medium">{filteredLogs.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Previous
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuditLogs
