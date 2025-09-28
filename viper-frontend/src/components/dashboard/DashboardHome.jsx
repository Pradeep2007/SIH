import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  Award, 
  FileText, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Download,
  Upload
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

const DashboardHome = () => {
  // Sample data for charts
  const wipingData = [
    { name: 'Jan', devices: 65, success: 62 },
    { name: 'Feb', devices: 78, success: 76 },
    { name: 'Mar', devices: 90, success: 88 },
    { name: 'Apr', devices: 81, success: 79 },
    { name: 'May', devices: 95, success: 94 },
    { name: 'Jun', devices: 110, success: 108 }
  ]

  const deviceTypes = [
    { name: 'Laptops', value: 45, color: '#3B82F6' },
    { name: 'Desktops', value: 30, color: '#10B981' },
    { name: 'Servers', value: 15, color: '#F59E0B' },
    { name: 'Mobile', value: 10, color: '#EF4444' }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'wipe_completed',
      device: 'Dell Laptop #DL-001',
      timestamp: '2 hours ago',
      status: 'success',
      user: 'John Doe'
    },
    {
      id: 2,
      type: 'certificate_generated',
      device: 'HP Desktop #HD-045',
      timestamp: '4 hours ago',
      status: 'success',
      user: 'Jane Smith'
    },
    {
      id: 3,
      type: 'wipe_failed',
      device: 'Lenovo ThinkPad #LT-023',
      timestamp: '6 hours ago',
      status: 'error',
      user: 'Mike Johnson'
    },
    {
      id: 4,
      type: 'audit_log',
      device: 'Server Rack #SR-012',
      timestamp: '8 hours ago',
      status: 'info',
      user: 'System'
    }
  ]

  const stats = [
    {
      title: 'Total Devices Wiped',
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: Shield,
      color: 'bg-blue-500'
    },
    {
      title: 'Certificates Generated',
      value: '1,198',
      change: '+8%',
      changeType: 'positive',
      icon: Award,
      color: 'bg-green-500'
    },
    {
      title: 'Success Rate',
      value: '99.2%',
      change: '+0.3%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'bg-emerald-500'
    },
    {
      title: 'Pending Audits',
      value: '23',
      change: '-5%',
      changeType: 'negative',
      icon: FileText,
      color: 'bg-orange-500'
    }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'wipe_completed': return CheckCircle
      case 'certificate_generated': return Award
      case 'wipe_failed': return AlertCircle
      case 'audit_log': return FileText
      default: return Activity
    }
  }

  const getActivityColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-500'
      case 'error': return 'text-red-500'
      case 'info': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
            <p className="text-primary-100">
              Here's what's happening with your data wiping operations today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wiping Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Wiping Trends
            </h3>
            <Link
              to="/dashboard/statistics"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
            >
              View Details
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={wipingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="devices" 
                stackId="1" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="success" 
                stackId="2" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Device Types */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Device Types
            </h3>
            <Link
              to="/dashboard/proofs"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
            >
              Manage Devices
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {deviceTypes.map((type, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {type.name}: {type.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="lg:col-span-2 card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <Link
              to="/dashboard/audit-logs"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
            >
              View All Logs
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`p-2 rounded-full bg-white dark:bg-gray-700 ${getActivityColor(activity.status)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.device}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.type.replace('_', ' ')} by {activity.user}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.timestamp}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/dashboard/proofs"
              className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors group"
            >
              <div className="p-2 bg-primary-500 rounded-lg">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Upload Proof
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add new wiping proof
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
            </Link>

            <Link
              to="/dashboard/certificates"
              className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
            >
              <div className="p-2 bg-green-500 rounded-lg">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Generate Certificate
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Create compliance cert
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
            </Link>

            <Link
              to="/dashboard/audit-logs"
              className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors group"
            >
              <div className="p-2 bg-orange-500 rounded-lg">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  View Audit Logs
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Check compliance
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
            </Link>

            <button className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Export Report
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardHome
