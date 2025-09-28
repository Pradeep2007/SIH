import React from 'react'
import { motion } from 'framer-motion'
import { Trash2, DollarSign, AlertTriangle, TrendingUp, Recycle, Shield } from 'lucide-react'

const AboutSection = () => {
  const problems = [
    {
      icon: Trash2,
      title: "1.75M Tonnes E-waste",
      description: "India generates massive electronic waste annually, creating environmental hazards",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    {
      icon: DollarSign,
      title: "₹50,000 Crore Assets",
      description: "Hoarded IT assets worth thousands of crores remain unused in organizations",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      icon: AlertTriangle,
      title: "Data Security Risk",
      description: "Improper data wiping leads to sensitive information breaches and compliance issues",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
  ]

  const solutions = [
    {
      icon: Shield,
      title: "Secure Data Wiping",
      description: "Military-grade data destruction following international standards"
    },
    {
      icon: Recycle,
      title: "Asset Recovery",
      description: "Unlock value from hoarded IT assets through secure recycling"
    },
    {
      icon: TrendingUp,
      title: "Compliance Assurance",
      description: "Meet regulatory requirements with certified data destruction"
    }
  ]

  return (
    <section id="about" className="section-padding bg-white dark:bg-gray-900">
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
            The Problem We're Solving
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            India faces a critical challenge in IT asset management and e-waste handling. 
            VIPER provides the solution for secure, compliant, and profitable asset recycling.
          </p>
        </motion.div>

        {/* Interactive Infographic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Problems */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Current Challenges
            </h3>
            <div className="space-y-6">
              {problems.map((problem, index) => {
                const Icon = problem.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="card p-6 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${problem.bgColor} group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${problem.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {problem.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {problem.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Central Infographic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8 text-white text-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center"
                >
                  <Recycle className="w-12 h-12 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold mb-4">E-waste Crisis</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-2xl font-bold">1.75M</div>
                    <div className="opacity-90">Tonnes/Year</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-2xl font-bold">₹50K</div>
                    <div className="opacity-90">Crore Value</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Our Solution Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
            How VIPER Solves This
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => {
              const Icon = solution.icon
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
                    {solution.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {solution.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button
            onClick={() => document.getElementById('solution').scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary text-lg px-8 py-4"
          >
            Discover Our Solution
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutSection
