import React from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  Leaf, 
  Users, 
  TrendingUp, 
  Award, 
  Globe,
  BarChart3,
  Target
} from 'lucide-react'

const ImpactSection = () => {
  const impacts = [
    {
      category: "Economic Impact",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      benefits: [
        {
          title: "Asset Recovery",
          description: "Unlock ₹50,000 crore worth of hoarded IT assets",
          metric: "₹50K Cr",
          icon: TrendingUp
        },
        {
          title: "Cost Reduction",
          description: "Reduce disposal costs by 60% through proper recycling",
          metric: "60% Savings",
          icon: BarChart3
        },
        {
          title: "Compliance Savings",
          description: "Avoid regulatory fines and legal complications",
          metric: "100% Compliant",
          icon: Award
        }
      ]
    },
    {
      category: "Environmental Impact",
      icon: Leaf,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      benefits: [
        {
          title: "E-waste Reduction",
          description: "Proper handling of 1.75M tonnes of annual e-waste",
          metric: "1.75M Tonnes",
          icon: Leaf
        },
        {
          title: "Carbon Footprint",
          description: "Reduce carbon emissions through efficient recycling",
          metric: "30% Reduction",
          icon: Globe
        },
        {
          title: "Resource Conservation",
          description: "Recover precious metals and rare earth elements",
          metric: "95% Recovery",
          icon: Target
        }
      ]
    },
    {
      category: "Social Impact",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      benefits: [
        {
          title: "Job Creation",
          description: "Create employment in the green technology sector",
          metric: "10K+ Jobs",
          icon: Users
        },
        {
          title: "Data Security",
          description: "Protect sensitive information from data breaches",
          metric: "99.9% Secure",
          icon: Award
        },
        {
          title: "Digital Trust",
          description: "Build confidence in digital asset management",
          metric: "500+ Enterprises",
          icon: TrendingUp
        }
      ]
    }
  ]

  const stats = [
    { label: "Data Wiped Securely", value: "10TB+", icon: Award },
    { label: "Enterprises Served", value: "500+", icon: Users },
    { label: "Compliance Rate", value: "100%", icon: Target },
    { label: "Cost Savings", value: "₹1000Cr+", icon: DollarSign }
  ]

  return (
    <section id="impact" className="section-padding bg-white dark:bg-gray-900">
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
            Impact & Benefits
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            VIPER creates positive impact across economic, environmental, and social dimensions, 
            driving sustainable growth in the IT asset recycling ecosystem.
          </p>
        </motion.div>

        {/* Impact Categories */}
        <div className="space-y-12 mb-16">
          {impacts.map((impact, categoryIndex) => {
            const CategoryIcon = impact.icon
            return (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
                viewport={{ once: true }}
                className={`card p-8 border-l-4 ${impact.borderColor}`}
              >
                {/* Category Header */}
                <div className="flex items-center space-x-4 mb-8">
                  <div className={`p-3 rounded-lg ${impact.bgColor}`}>
                    <CategoryIcon className={`w-8 h-8 ${impact.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {impact.category}
                  </h3>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {impact.benefits.map((benefit, benefitIndex) => {
                    const BenefitIcon = benefit.icon
                    return (
                      <motion.div
                        key={benefitIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: benefitIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <BenefitIcon className={`w-6 h-6 ${impact.color} group-hover:scale-110 transition-transform`} />
                          <span className={`text-2xl font-bold ${impact.color}`}>
                            {benefit.metric}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {benefit.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {benefit.description}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 text-white mb-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Our Track Record
            </h3>
            <p className="text-primary-100 max-w-2xl mx-auto">
              Real numbers that demonstrate the effectiveness and impact of VIPER 
              in transforming IT asset management across enterprises.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const StatIcon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <StatIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-primary-100 text-sm">
                    {stat.label}
                  </div>
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
          className="text-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Make an Impact?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Join hundreds of enterprises already using VIPER to securely manage their IT assets 
            while contributing to a sustainable future.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => document.getElementById('tutorials').scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary px-8 py-3"
            >
              Get Started Today
            </button>
            <button
              onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              className="btn-outline px-8 py-3"
            >
              Contact Sales
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ImpactSection
