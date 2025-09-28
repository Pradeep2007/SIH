import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FileText,
  Shield,
  Calendar,
  User,
  HardDrive
} from 'lucide-react'
import toast from 'react-hot-toast'

const ProofManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedProofs, setSelectedProofs] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({
    deviceId: '',
    deviceType: '',
    wipingMethod: '',
    file: null
  })

  // Sample proof data
  const proofs = [
    {
      id: 1,
      deviceId: 'DL-001',
      deviceType: 'Laptop',
      deviceModel: 'Dell Latitude 7420',
      wipingMethod: 'DoD 5220.22-M',
      status: 'verified',
      uploadDate: '2024-01-15',
      verificationDate: '2024-01-16',
      fileSize: '2.4 MB',
      hash: 'a1b2c3d4e5f6...',
      uploadedBy: 'John Doe'
    },
    {
      id: 2,
      deviceId: 'HD-045',
      deviceType: 'Desktop',
      deviceModel: 'HP EliteDesk 800',
      wipingMethod: 'NIST SP 800-88',
      status: 'pending',
      uploadDate: '2024-01-14',
      verificationDate: null,
      fileSize: '1.8 MB',
      hash: 'b2c3d4e5f6g7...',
      uploadedBy: 'Jane Smith'
    },
    {
      id: 3,
      deviceId: 'LT-023',
      deviceType: 'Laptop',
      deviceModel: 'Lenovo ThinkPad X1',
      wipingMethod: 'Secure Erase',
      status: 'failed',
      uploadDate: '2024-01-13',
      verificationDate: '2024-01-14',
      fileSize: '3.1 MB',
      hash: 'c3d4e5f6g7h8...',
      uploadedBy: 'Mike Johnson'
    },
    {
      id: 4,
      deviceId: 'SR-012',
      deviceType: 'Server',
      deviceModel: 'Dell PowerEdge R740',
      wipingMethod: 'DoD 5220.22-M',
      status: 'verified',
      uploadDate: '2024-01-12',
      verificationDate: '2024-01-13',
      fileSize: '5.2 MB',
      hash: 'd4e5f6g7h8i9...',
      uploadedBy: 'System Admin'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return CheckCircle
      case 'pending': return Clock
      case 'failed': return AlertCircle
      default: return FileText
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-500 bg-green-50 dark:bg-green-900/20'
      case 'pending': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'failed': return 'text-red-500 bg-red-50 dark:bg-red-900/20'
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const filteredProofs = proofs.filter(proof => {
    const matchesSearch = proof.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proof.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proof.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || proof.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleUpload = (e) => {
    e.preventDefault()
    // Handle file upload logic here
    toast.success('Proof uploaded successfully!')
    setShowUploadModal(false)
    setUploadData({ deviceId: '', deviceType: '', wipingMethod: '', file: null })
  }

  const handleBulkAction = (action) => {
    if (selectedProofs.length === 0) {
      toast.error('Please select proofs to perform bulk action')
      return
    }
    
    switch (action) {
      case 'verify':
        toast.success(`${selectedProofs.length} proofs marked for verification`)
        break
      case 'download':
        toast.success(`Downloading ${selectedProofs.length} proofs`)
        break
      case 'delete':
        toast.success(`${selectedProofs.length} proofs deleted`)
        break
    }
    setSelectedProofs([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Proof Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload and manage cryptographic proofs of data wiping
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Proof</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Proofs', value: '1,247', icon: FileText, color: 'bg-blue-500' },
          { label: 'Verified', value: '1,198', icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Pending', value: '26', icon: Clock, color: 'bg-yellow-500' },
          { label: 'Failed', value: '23', icon: AlertCircle, color: 'bg-red-500' }
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
                placeholder="Search proofs..."
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
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedProofs.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('verify')}
                className="btn-outline px-3 py-2 text-sm"
              >
                Verify Selected
              </button>
              <button
                onClick={() => handleBulkAction('download')}
                className="btn-outline px-3 py-2 text-sm"
              >
                Download Selected
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Proofs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProofs(filteredProofs.map(p => p.id))
                      } else {
                        setSelectedProofs([])
                      }
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProofs.map((proof) => {
                const StatusIcon = getStatusIcon(proof.status)
                return (
                  <motion.tr
                    key={proof.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProofs.includes(proof.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProofs([...selectedProofs, proof.id])
                          } else {
                            setSelectedProofs(selectedProofs.filter(id => id !== proof.id))
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <HardDrive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {proof.deviceId}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {proof.deviceModel}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {proof.wipingMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proof.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="capitalize">{proof.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {proof.uploadDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {proof.uploadedBy}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
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
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upload Proof
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Device ID
                  </label>
                  <input
                    type="text"
                    value={uploadData.deviceId}
                    onChange={(e) => setUploadData({...uploadData, deviceId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter device ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Device Type
                  </label>
                  <select
                    value={uploadData.deviceType}
                    onChange={(e) => setUploadData({...uploadData, deviceType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select device type</option>
                    <option value="laptop">Laptop</option>
                    <option value="desktop">Desktop</option>
                    <option value="server">Server</option>
                    <option value="mobile">Mobile Device</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Wiping Method
                  </label>
                  <select
                    value={uploadData.wipingMethod}
                    onChange={(e) => setUploadData({...uploadData, wipingMethod: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select wiping method</option>
                    <option value="DoD 5220.22-M">DoD 5220.22-M</option>
                    <option value="NIST SP 800-88">NIST SP 800-88</option>
                    <option value="Secure Erase">Secure Erase</option>
                    <option value="Gutmann">Gutmann Method</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Proof File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    accept=".pdf,.txt,.log,.json"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Supported formats: PDF, TXT, LOG, JSON
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Upload
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

export default ProofManagement
