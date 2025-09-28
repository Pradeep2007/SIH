import React from 'react'
import HeroSection from '../components/home/HeroSection'
import AboutSection from '../components/home/AboutSection'
import SolutionSection from '../components/home/SolutionSection'
import ImpactSection from '../components/home/ImpactSection'
import TutorialsSection from '../components/home/TutorialsSection'
import ResearchSection from '../components/home/ResearchSection'

const HomePage = () => {
  return (
    <div className="pt-16">
      <HeroSection />
      <AboutSection />
      <SolutionSection />
      <ImpactSection />
      <TutorialsSection />
      <ResearchSection />
    </div>
  )
}

export default HomePage
