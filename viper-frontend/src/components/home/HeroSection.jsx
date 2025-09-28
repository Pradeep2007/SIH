import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Shield, ArrowRight, Play, Zap, Lock, Recycle } from 'lucide-react'

const HeroSection = () => {
  const floatingIcons = [
    { icon: Shield, delay: 0, x: 100, y: 50 },
    { icon: Lock, delay: 0.5, x: -80, y: 80 },
    { icon: Zap, delay: 1, x: 120, y: -60 },
    { icon: Recycle, delay: 1.5, x: -100, y: -40 },
  ]

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 dark:bg-primary-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 dark:bg-secondary-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-60 h-60 bg-success-200 dark:bg-success-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Floating Icons */}
      {floatingIcons.map((item, index) => {
        const Icon = item.icon
        return (
          <motion.div
            key={index}
            className="absolute text-primary-300 dark:text-primary-700"
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3], 
              x: [0, item.x, 0], 
              y: [0, item.y, 0] 
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              delay: item.delay,
              ease: "easeInOut" 
            }}
          >
            <Icon className="w-8 h-8" />
          </motion.div>
        )
      })}

      <div className="container-max relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Shield className="w-4 h-4" />
            <span>Trusted by 500+ Enterprises</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            <span className="gradient-text">VIPER</span>
            <br />
            <span className="text-3xl md:text-4xl lg:text-5xl text-gray-700 dark:text-gray-300">
              Secure Data Wiping
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            For Trustworthy IT Asset Recycling
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Professional-grade data destruction solutions ensuring complete data security 
            and compliance with international standards for enterprise IT asset recycling.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <button
              onClick={() => document.getElementById('solution').scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
            >
              <span>Learn How It Works</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <Link
              to="/login"
              className="btn-secondary flex items-center space-x-2 text-lg px-8 py-4"
            >
              <span>Login as Enterprise</span>
              <Shield className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Demo Video Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-12"
          >
            <button className="group flex items-center space-x-3 mx-auto text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
                <Play className="w-5 h-5 text-primary-600 ml-1" />
              </div>
              <span className="font-medium">Watch Demo Video</span>
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                1.75M+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Tonnes of E-waste Generated
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                ₹50K Cr
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Hoarded IT Assets Value
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                99.9%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Data Destruction Success Rate
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default HeroSection
