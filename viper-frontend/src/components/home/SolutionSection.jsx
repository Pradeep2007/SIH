import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Unlock, 
  Zap, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  HardDrive,
  Wifi,
  Award
} from 'lucide-react'

const SolutionSection = () => {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      id: 0,
      icon: Search,
      title: "Detect Hardware",
      description: "Advanced scanning technology identifies all storage devices and hidden partitions",
      details: [
        "Automatic hardware detection",
        "Hidden partition discovery",
        "Device health assessment",
        "Compatibility verification"
      ],
      color: "bg-blue-500",
      image: "/api/placeholder/400/300"
    },
    {
      id: 1,
      icon: Unlock,
      title: "Unlock Hidden Sectors",
      description: "Proprietary algorithms access and map all data storage areas including hidden sectors",
      details: [
        "Hidden sector mapping",
        "Encrypted partition access",
        "System area detection",
        "Complete data inventory"
      ],
      color: "bg-purple-500",
      image: "/api/placeholder/400/300"
    },
    {
      id: 2,
      icon: Zap,
      title: "Smart Wiping",
      description: "Intelligent wiping algorithms optimized for different storage types (HDD/SSD)",
      details: [
        "HDD multi-pass overwriting",
        "SSD secure erase commands",
        "Adaptive wiping patterns",
        "Performance optimization"
      ],
      color: "bg-yellow-500",
      image: "/api/placeholder/400/300"
    },
    {
      id: 3,
      icon: Shield,
      title: "Air-gap Isolation",
      description: "Complete network isolation ensures no data leakage during the wiping process",
      details: [
        "Network disconnection",
        "Isolated environment",
        "Secure processing",
        "Zero data transmission"
      ],
      color: "bg-green-500",
      image: "/api/placeholder/400/300"
    },
    {
      id: 4,
      icon: CheckCircle,
      title: "Verification & Certificate",
      description: "Cryptographic verification and compliance certificate generation",
      details: [
        "Data destruction verification",
        "Compliance certification",
        "Audit trail generation",
        "Legal documentation"
      ],
      color: "bg-red-500",
      image: "/api/placeholder/400/300"
    }
  ]

  const features = [
    {
      icon: HardDrive,
      title: "Multi-Device Support",
      description: "Works with HDDs, SSDs, USB drives, and mobile devices"
    },
    {
      icon: Wifi,
      title: "Offline Operation",
      description: "Complete air-gap isolation for maximum security"
    },
    {
      icon: Award,
      title: "Compliance Ready",
      description: "Meets NIST, DoD, and international standards"
    }
  ]

  return (
    <section id="solution" className="section-padding bg-gray-50 dark:bg-gray-800">
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
            Our Solution: VIPER
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A comprehensive 5-step process that ensures complete data destruction 
            while maintaining compliance with international security standards.
          </p>
        </motion.div>

        {/* Interactive Step Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Steps Navigation */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`card p-6 cursor-pointer transition-all duration-300 ${
                    activeStep === index 
                      ? 'ring-2 ring-primary-500 shadow-xl' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Step {index + 1}: {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {step.description}
                      </p>
                    </div>
                    <ArrowRight className={`w-5 h-5 transition-transform ${
                      activeStep === index ? 'text-primary-500 transform rotate-90' : 'text-gray-400'
                    }`} />
                  </div>
                  
                  <AnimatePresence>
                    {activeStep === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                      >
                        <ul className="space-y-2">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {/* Visual Representation */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="card p-8 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={`w-24 h-24 ${steps[activeStep].color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    {React.createElement(steps[activeStep].icon, { className: "w-12 h-12 text-white" })}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {steps[activeStep].description}
                  </p>
                  
                  {/* Animated Progress */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <motion.div
                      className="bg-primary-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Step {activeStep + 1} of {steps.length}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card p-6 text-center group hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button
            onClick={() => document.getElementById('tutorials').scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary text-lg px-8 py-4 mr-4"
          >
            See Tutorials
          </button>
          <button
            onClick={() => document.getElementById('impact').scrollIntoView({ behavior: 'smooth' })}
            className="btn-outline text-lg px-8 py-4"
          >
            View Impact
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default SolutionSection
