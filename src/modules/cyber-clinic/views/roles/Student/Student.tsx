import React from 'react'
import Hero from '../../sections/Hero'
import SliderStudent from './SliderStudent'
import Roadmap from '../../sections/Roadmap'
import Register from '../../sections/Register'
import News from '../../sections/News'
import Faq from '../../sections/Faq'
import FooterWrap from '@/modules/cyber-clinic/layout/FooterWrap'

export default function Student() {
  return (
    <div>
      <Hero userKey="student" />
      <SliderStudent />
      <Roadmap />
      <Register userKey="student" />
      <News />
      <Faq userKey="student" />
      <FooterWrap />
    </div>
  )
}
