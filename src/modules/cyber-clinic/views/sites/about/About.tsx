import React from 'react'

import FooterWrap from '@/modules/cyber-clinic/layout/FooterWrap'
import News from '../../sections/News'
import Header from '@/modules/cyber-clinic/layout/Header'
import HeroAbout from './HeroAbout'
import ContextAbout from './ContextAbout'
import ChallengeTarget from './ChallengeTarget'
import QuoteAbout from './Quote'

export default function About() {
  return (
    <div>
      <Header />
      <HeroAbout />
      <ContextAbout />
      <ChallengeTarget />
      <QuoteAbout />
      <News />
      <FooterWrap />
    </div>
  )
}
