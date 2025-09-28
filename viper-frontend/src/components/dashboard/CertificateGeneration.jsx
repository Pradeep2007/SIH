import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Award, 
  Download, 
  Eye, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  FileText,
  Shield,
  CheckCircle,
  Clock,
  User,
  Building,
  Hash
} from 'lucide-react'
import toast from 'react-hot-toast'

const CertificateGeneration = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedCertificates, setSelectedCertificates] = useState([])
  const [generateData, setGenerateData] = useState({
    deviceIds: '',
    certificateType: '',
    standard: '',
    validityPeriod: '1',
    includeDetails: true
  })

  // Sample certificate data
  const certificates = [
    {
      id: 1,
      certificateId: 'CERT-2024-001',
      deviceIds: ['DL-001', 'DL-002'],
      deviceCount: 2,
      certificateType: 'Compliance Certificate',
      standard: 'NIST SP 800-88',
      issueDate: '2024-01-15',
      expiryDate: '2025-01-15',
      status: 'active',
      issuedBy: 'John Doe',
      company: 'TechCorp Inc.',
      fileSize: '1.2 MB',
      downloadCount: 5
    },
    {
      id: 2,
      certificateId: 'CERT-2024-002',
      deviceIds: ['HD-045', 'HD-046', 'HD-047'],
      deviceCount: 3,
      certificateType: 'Destruction Certificate',
      standard: 'DoD 5220.22-M',
      issueDate: '2024-01-14',
      expiryDate: '2025-01-14',
      status: 'active',
      issuedBy: 'Jane Smith',
      company: 'SecureIT Ltd.',
      fileSize: '1.8 MB',
      downloadCount: 12
    },
    {
      id: 3,
      certificateId: 'CERT-2024-003',
      deviceIds: ['LT-023'],
      deviceCount: 1,
      certificateType: 'Audit Certificate',
      standard: 'ISO 27001',
      issueDate: '2024-01-13',
      expiryDate: '2025-01-13',
      status: 'expired',
      issuedBy: 'Mike Johnson',
      company: 'DataSafe Corp.',
      fileSize: '0.9 MB',
      downloadCount: 3
    },
    {
      id: 4,
      certificateId: 'CERT-2024-004',
      deviceIds: ['SR-012', 'SR-013'],
      deviceCount: 2,
      certificateType: 'Compliance Certificate',
      standard: 'NIST SP 800-88',
      issueDate: '2024-01-12',
      expiryDate: '2025-01-12',
      status: 'pending',
      issuedBy: 'System Admin',
      company: 'Enterprise Solutions',
      fileSize: '2.1 MB',
      downloadCount: 0
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-50 dark:bg-green-900/20'
      case 'expired': return 'text-red-500 bg-red-50 dark:bg-red-900/20'
      case 'pending': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'expired': return FileText
      case 'pending': return Clock
      default: return FileText
    }
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.issuedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || cert.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleGenerate = (e) => {
    e.preventDefault()
    // Handle certificate generation logic here
    toast.success('Certificate generated successfully!')
    setShowGenerateModal(false)
    setGenerateData({
      deviceIds: '',
      certificateType: '',
      standard: '',
      validityPeriod: '1',
      includeDetails: true
    })
  }

  const handleBulkDownload = () => {
    if (selectedCertificates.length === 0) {
      toast.error('Please select certificates to download')
      return
    }
    toast.success(`Downloading ${selectedCertificates.length} certificates`)
    setSelectedCertificates([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Certificate Generation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and manage compliance certificates
          </p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Certificate</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Certificates', value: '156', icon: Award, color: 'bg-blue-500' },
          { label: 'Active', value: '142', icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Pending', value: '8', icon: Clock, color: 'bg-yellow-500' },
          { label: 'Expired', value: '6', icon: FileText, color: 'bg-red-500' }
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

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedCertificates.length > 0 && (
            <button
              onClick={handleBulkDownload}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Selected ({selectedCertificates.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCertificates.map((certificate) => {
          const StatusIcon = getStatusIcon(certificate.status)
          return (
            <motion.div
              key={certificate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 hover:shadow-lg transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedCertificates.includes(certificate.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCertificates([...selectedCertificates, certificate.id])
                      } else {
                        setSelectedCertificates(selectedCertificates.filter(id => id !== certificate.id))
                      }
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                    <Award className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {certificate.certificateId}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {certificate.certificateType}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(certificate.status)}`}>
                  <StatusIcon className="w-3 h-3" />
                  <span className="capitalize">{certificate.status}</span>
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Devices:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {certificate.deviceCount} devices
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Standard:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {certificate.standard}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Issue Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {certificate.issueDate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Expires:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {certificate.expiryDate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Company:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {certificate.company}
                  </span>
                </div>
              </div>

              {/* Device IDs */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Device IDs:</p>
                <div className="flex flex-wrap gap-1">
                  {certificate.deviceIds.map((deviceId, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      {deviceId}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{certificate.fileSize}</span>
                  <span>•</span>
                  <span>{certificate.downloadCount} downloads</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Generate Certificate Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generate Certificate
                </h3>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Device IDs
                  </label>
                  <textarea
                    value={generateData.deviceIds}
                    onChange={(e) => setGenerateData({...generateData, deviceIds: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter device IDs (comma-separated)"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Certificate Type
                  </label>
                  <select
                    value={generateData.certificateType}
                    onChange={(e) => setGenerateData({...generateData, certificateType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select certificate type</option>
                    <option value="compliance">Compliance Certificate</option>
                    <option value="destruction">Destruction Certificate</option>
                    <option value="audit">Audit Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Standard
                  </label>
                  <select
                    value={generateData.standard}
                    onChange={(e) => setGenerateData({...generateData, standard: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select standard</option>
                    <option value="NIST SP 800-88">NIST SP 800-88</option>
                    <option value="DoD 5220.22-M">DoD 5220.22-M</option>
                    <option value="ISO 27001">ISO 27001</option>
                    <option value="GDPR">GDPR Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Validity Period (Years)
                  </label>
                  <select
                    value={generateData.validityPeriod}
                    onChange={(e) => setGenerateData({...generateData, validityPeriod: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                    <option value="5">5 Years</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="includeDetails"
                    type="checkbox"
                    checked={generateData.includeDetails}
                    onChange={(e) => setGenerateData({...generateData, includeDetails: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="includeDetails" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Include detailed wiping information
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Generate
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CertificateGeneration
