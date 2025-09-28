import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  Shield,
  Award,
  Activity,
  Clock
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts'

const Statistics = () => {
  const [timeRange, setTimeRange] = useState('30')
  const [chartType, setChartType] = useState('area')

  // Sample data for charts
  const wipingTrends = [
    { name: 'Jan', devices: 65, success: 62, failed: 3 },
    { name: 'Feb', devices: 78, success: 76, failed: 2 },
    { name: 'Mar', devices: 90, success: 88, failed: 2 },
    { name: 'Apr', devices: 81, success: 79, failed: 2 },
    { name: 'May', devices: 95, success: 94, failed: 1 },
    { name: 'Jun', devices: 110, success: 108, failed: 2 }
  ]

  const deviceTypes = [
    { name: 'Laptops', value: 45, color: '#3B82F6' },
    { name: 'Desktops', value: 30, color: '#10B981' },
    { name: 'Servers', value: 15, color: '#F59E0B' },
    { name: 'Mobile', value: 10, color: '#EF4444' }
  ]

  const wipingMethods = [
    { name: 'DoD 5220.22-M', count: 156, percentage: 45 },
    { name: 'NIST SP 800-88', count: 124, percentage: 36 },
    { name: 'Secure Erase', count: 45, percentage: 13 },
    { name: 'Gutmann', count: 21, percentage: 6 }
  ]

  const performanceData = [
    { name: 'Week 1', avgTime: 45, throughput: 12 },
    { name: 'Week 2', avgTime: 42, throughput: 15 },
    { name: 'Week 3', avgTime: 38, throughput: 18 },
    { name: 'Week 4', avgTime: 35, throughput: 22 }
  ]

  const complianceData = [
    { name: 'NIST', value: 95, fill: '#10B981' },
    { name: 'DoD', value: 88, fill: '#3B82F6' },
    { name: 'ISO', value: 92, fill: '#F59E0B' },
    { name: 'GDPR', value: 97, fill: '#8B5CF6' }
  ]

  const stats = [
    {
      title: 'Total Devices Processed',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive',
      icon: Shield,
      color: 'bg-blue-500'
    },
    {
      title: 'Success Rate',
      value: '99.2%',
      change: '+0.3%',
      changeType: 'positive',
      icon: Award,
      color: 'bg-green-500'
    },
    {
      title: 'Avg. Processing Time',
      value: '35 min',
      change: '-8.2%',
      changeType: 'positive',
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      title: 'Active Users',
      value: '156',
      change: '+5.1%',
      changeType: 'positive',
      icon: Activity,
      color: 'bg-purple-500'
    }
  ]

  const exportData = () => {
    // Export functionality
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Month,Devices,Success,Failed\n" +
      wipingTrends.map(row => 
        `${row.name},${row.devices},${row.success},${row.failed}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `statistics_${new Date().toISOString().split('T')[0]}.csv`)
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
            Statistics & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into your data wiping operations
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={exportData}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
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
                    {stat.change} from last period
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

      {/* Main Charts */}
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
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="area">Area Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'area' && (
              <AreaChart data={wipingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="success" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="failed" 
                  stackId="1" 
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.8}
                />
              </AreaChart>
            )}
            {chartType === 'bar' && (
              <BarChart data={wipingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="success" fill="#10B981" />
                <Bar dataKey="failed" fill="#EF4444" />
              </BarChart>
            )}
            {chartType === 'line' && (
              <LineChart data={wipingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="success" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Device Types Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Device Types Distribution
          </h3>
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wiping Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Wiping Methods Usage
          </h3>
          <div className="space-y-4">
            {wipingMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {method.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {method.count} ({method.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-primary-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${method.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Performance Metrics
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="avgTime" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Avg Time (min)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="throughput" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Throughput (devices/hour)"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Compliance Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Compliance Standards Adherence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={complianceData}>
                <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            {complianceData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Summary Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Summary Report
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              2,847
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Devices Processed
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              99.2%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Overall Success Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              35 min
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Average Processing Time
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Key Insights:</strong> Your data wiping operations are performing exceptionally well with a 99.2% success rate. 
            The average processing time has improved by 8.2% this month, indicating enhanced efficiency. 
            DoD 5220.22-M remains the most popular wiping method, accounting for 45% of all operations.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Statistics
