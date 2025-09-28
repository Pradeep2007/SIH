import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ExternalLink, 
  FileText, 
  Award, 
  Shield, 
  Globe,
  BookOpen,
  Download
} from 'lucide-react'

const ResearchSection = () => {
  const [openCard, setOpenCard] = useState(null)

  const standards = [
    {
      id: 'nist',
      title: 'NIST Guidelines',
      organization: 'National Institute of Standards and Technology',
      description: 'Comprehensive guidelines for media sanitization and data destruction',
      icon: Shield,
      color: 'bg-blue-500',
      details: {
        standard: 'NIST SP 800-88 Rev. 1',
        scope: 'Media Sanitization Guidelines',
        keyPoints: [
          'Clear, Purge, and Destroy sanitization methods',
          'Risk-based approach to data sanitization',
          'Verification and validation requirements',
          'Documentation and audit trail standards'
        ],
        compliance: 'Federal agencies and contractors',
        link: 'https://csrc.nist.gov/publications/detail/sp/800-88/rev-1/final'
      }
    },
    {
      id: 'dod',
      title: 'DoD Standards',
      organization: 'U.S. Department of Defense',
      description: 'Military-grade data wiping standards for classified information',
      icon: Award,
      color: 'bg-green-500',
      details: {
        standard: 'DoD 5220.22-M',
        scope: 'Data Sanitization and Media Destruction',
        keyPoints: [
          '3-pass overwrite method for magnetic media',
          'Physical destruction requirements',
          'Chain of custody documentation',
          'Security clearance requirements'
        ],
        compliance: 'Defense contractors and military',
        link: 'https://www.dss.mil/documents/odaa/nispom2006-5220.pdf'
      }
    },
    {
      id: 'iso',
      title: 'ISO Compliance',
      organization: 'International Organization for Standardization',
      description: 'International standards for information security management',
      icon: Globe,
      color: 'bg-purple-500',
      details: {
        standard: 'ISO/IEC 27001:2013',
        scope: 'Information Security Management Systems',
        keyPoints: [
          'Risk management framework',
          'Secure disposal of information',
          'Asset management requirements',
          'Continuous improvement processes'
        ],
        compliance: 'Global enterprises and organizations',
        link: 'https://www.iso.org/isoiec-27001-information-security.html'
      }
    },
    {
      id: 'it-act',
      title: 'IT Act 2000',
      organization: 'Government of India',
      description: 'Indian legislation for electronic governance and data protection',
      icon: BookOpen,
      color: 'bg-orange-500',
      details: {
        standard: 'Information Technology Act, 2000',
        scope: 'Electronic Records and Digital Signatures',
        keyPoints: [
          'Legal framework for electronic transactions',
          'Data protection and privacy requirements',
          'Penalties for data breaches',
          'Digital signature authentication'
        ],
        compliance: 'Indian enterprises and government',
        link: 'https://www.meity.gov.in/content/information-technology-act-2000'
      }
    }
  ]

  const researchPapers = [
    {
      title: 'Secure Data Destruction in Cloud Environments',
      authors: 'Kumar, S., Patel, R., Singh, A.',
      journal: 'IEEE Transactions on Cloud Computing',
      year: '2023',
      abstract: 'This paper presents novel approaches to secure data destruction in distributed cloud environments...',
      link: '#'
    },
    {
      title: 'E-waste Management and Data Security: A Comprehensive Study',
      authors: 'Sharma, M., Gupta, V., Reddy, K.',
      journal: 'Journal of Environmental Management',
      year: '2023',
      abstract: 'An analysis of current e-waste management practices and their impact on data security...',
      link: '#'
    },
    {
      title: 'Cryptographic Verification of Data Wiping Processes',
      authors: 'Chen, L., Williams, J., Brown, D.',
      journal: 'ACM Computing Surveys',
      year: '2022',
      abstract: 'A survey of cryptographic methods for verifying complete data destruction...',
      link: '#'
    }
  ]

  return (
    <section id="research" className="section-padding bg-white dark:bg-gray-900">
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
            Research & Standards
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            VIPER is built on solid foundations of international standards and cutting-edge research 
            in data security and electronic waste management.
          </p>
        </motion.div>

        {/* Standards Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {standards.map((standard, index) => {
            const Icon = standard.icon
            const isOpen = openCard === standard.id
            
            return (
              <motion.div
                key={standard.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card overflow-hidden"
              >
                {/* Card Header */}
                <button
                  onClick={() => setOpenCard(isOpen ? null : standard.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${standard.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {standard.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {standard.organization}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                      isOpen ? 'transform rotate-180' : ''
                    }`} />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-3">
                    {standard.description}
                  </p>
                </button>

                {/* Expandable Content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                              Standard Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Standard:</span>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">{standard.details.standard}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Scope:</span>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">{standard.details.scope}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Compliance:</span>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">{standard.details.compliance}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                              Key Points
                            </h4>
                            <ul className="space-y-2">
                              {standard.details.keyPoints.map((point, pointIndex) => (
                                <li key={pointIndex} className="flex items-start space-x-2 text-sm">
                                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-600 dark:text-gray-400">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <a
                            href={standard.details.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                          >
                            <span>Read Full Standard</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Research Papers */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Latest Research Papers
          </h3>
          <div className="space-y-6">
            {researchPapers.map((paper, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-lg p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {paper.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {paper.authors} • {paper.journal} • {paper.year}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {paper.abstract}
                    </p>
                    <a
                      href={paper.link}
                      className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Read Paper</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <button className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Stay Updated with Latest Research
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Subscribe to our research newsletter to receive updates on the latest developments 
            in data security and e-waste management.
          </p>
          <button className="btn-primary px-8 py-3">
            Subscribe to Newsletter
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default ResearchSection
