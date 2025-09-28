import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Download, 
  Smartphone, 
  Monitor, 
  Users, 
  CheckCircle,
  ExternalLink,
  FileText
} from 'lucide-react'

const TutorialsSection = () => {
  const [activeTab, setActiveTab] = useState('individuals')
  const [openAccordion, setOpenAccordion] = useState(0)

  const tabs = [
    {
      id: 'individuals',
      title: 'For Individuals',
      icon: Smartphone,
      description: 'Personal device data wiping'
    },
    {
      id: 'enterprises',
      title: 'For Enterprises',
      icon: Monitor,
      description: 'Enterprise dashboard & bulk operations'
    },
    {
      id: 'auditors',
      title: 'For Auditors',
      icon: Users,
      description: 'Compliance verification & reporting'
    }
  ]

  const tutorials = {
    individuals: [
      {
        title: "Getting Started with VIPER Web App",
        duration: "5 min",
        steps: [
          "Visit the VIPER web application",
          "Connect your device via USB",
          "Select data wiping method",
          "Start the secure wiping process",
          "Download your completion certificate"
        ],
        videoUrl: "#",
        downloadUrl: "#",
        difficulty: "Beginner"
      },
      {
        title: "Using VIPER Android App",
        duration: "3 min",
        steps: [
          "Download VIPER app from Play Store",
          "Grant necessary permissions",
          "Select files/folders to wipe",
          "Choose wiping standard (DoD/NIST)",
          "Verify completion and get certificate"
        ],
        videoUrl: "#",
        downloadUrl: "#",
        difficulty: "Beginner"
      },
      {
        title: "Advanced Security Settings",
        duration: "8 min",
        steps: [
          "Access advanced settings menu",
          "Configure custom wiping patterns",
          "Set up scheduled wiping",
          "Enable audit logging",
          "Export security reports"
        ],
        videoUrl: "#",
        downloadUrl: "#",
        difficulty: "Intermediate"
      }
    ],
    enterprises: [
      {
        title: "Enterprise Dashboard Setup",
        duration: "10 min",
        steps: [
          "Create enterprise account",
          "Configure organization settings",
          "Set up user roles and permissions",
          "Connect to existing IT infrastructure",
          "Configure compliance policies"
        ],
        videoUrl: "#",
        downloadUrl: "#",
        difficulty: "Intermediate"
      },
      {
        title: "Bulk Device Management",
        duration: "15 min",
        steps: [
          "Import device inventory",
          "Create wiping campaigns",
          "Deploy bootable USB drives",
          "Monitor progress in real-time",
          "Generate compliance reports"
        ],
        videoUrl: "#",
        downloadUrl: "#",
        difficulty: "Advanced"
      },
      {
        title: "Creating Bootable USB Drives",
        duration: "12 min",
        steps: [
          "Download VIPER bootable image",
          "Prepare USB drives (minimum 8GB)",
          "Use VIPER USB Creator tool",
          "Configure wiping parameters",
          "Deploy to target devices"
        ],
        videoUrl: "#",
        downloadUrl: "#",
        difficulty: "Intermediate"
      }
    ],
    auditors: [
      {
        title: "Compliance Verification Process",
        duration: "20 min",
        steps: [
          "Access audit dashboard",
          "Review wiping certificates",
          "Verify cryptographic proofs",
          "Check compliance standards",
          "Generate audit reports"
        ],
        videoUrl: "#",
        downloadUrl: "#",
        difficulty: "Advanced"
      },
      {
        title: "Audit Trail Analysis",
        duration: "18 min",
        steps: [
          "Navigate audit logs",
          "Filter by date/device/user",
          "Analyze wiping patterns",
          "Identify compliance gaps",
          "Export detailed reports"
        ],
        videoUrl: "#",
        downloadUrl: "#",
        difficulty: "Advanced"
      }
    ]
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'Advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  return (
    <section id="tutorials" className="section-padding bg-gray-50 dark:bg-gray-800">
      <div className="container-max">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How to Use VIPER
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Step-by-step tutorials to help you get the most out of VIPER's secure data wiping capabilities. 
            Choose your user type to see relevant tutorials.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-center mb-12"
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg p-2 shadow-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setOpenAccordion(0)
                  }}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{tab.title}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Tutorial Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {tutorials[activeTab].map((tutorial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card overflow-hidden"
              >
                {/* Tutorial Header */}
                <button
                  onClick={() => setOpenAccordion(openAccordion === index ? -1 : index)}
                  className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {tutorial.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                          {tutorial.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Play className="w-4 h-4" />
                          <span>{tutorial.duration}</span>
                        </span>
                        <span>{tutorial.steps.length} steps</span>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                      openAccordion === index ? 'transform rotate-180' : ''
                    }`} />
                  </div>
                </button>

                {/* Tutorial Content */}
                <AnimatePresence>
                  {openAccordion === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Steps */}
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                              Step-by-step Guide:
                            </h4>
                            <ol className="space-y-3">
                              {tutorial.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start space-x-3">
                                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                                    {stepIndex + 1}
                                  </div>
                                  <span className="text-gray-600 dark:text-gray-400">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Actions */}
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                              Resources:
                            </h4>
                            <div className="space-y-3">
                              <a
                                href={tutorial.videoUrl}
                                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                              >
                                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                                  <Play className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    Watch Video Tutorial
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {tutorial.duration} • HD Quality
                                  </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                              </a>

                              <a
                                href={tutorial.downloadUrl}
                                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                              >
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    Download PDF Guide
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Detailed written instructions
                                  </div>
                                </div>
                                <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-white dark:bg-gray-900 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Need Additional Help?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Our support team is here to help you get the most out of VIPER. 
            Access our knowledge base or contact us directly for personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="btn-primary px-6 py-3">
              Contact Support
            </button>
            <button className="btn-outline px-6 py-3">
              Browse Knowledge Base
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default TutorialsSection
