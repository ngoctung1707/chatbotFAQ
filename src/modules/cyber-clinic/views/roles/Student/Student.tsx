import React from 'react'
import Hero from '../../sections/Hero'
import SliderStudent from './SliderStudent'
import Roadmap from '../../sections/Roadmap'
import Register from '../../sections/Register'
import News from '../../sections/News'
import Faq from '../../sections/Faq'
import FooterWrap from '@/modules/cyber-clinic/layout/FooterWrap'
import RegisterStudent from './RegisterStudent'
import Partners from '../../sections/Partners'
import EmptyDiv from '@/modules/cyber-clinic/components/EmptyDiv'
import LearningMaterials from '../../sections/LearningMaterials'

export default function Student() {
  return (
    <div>
      <Hero userKey="student" />
      <SliderStudent />
      <Roadmap />
      <RegisterStudent />
      <EmptyDiv />
      <LearningMaterials />
      <Faq userKey="student" />
      {/* <Partners /> */}
      <FooterWrap />
    </div>
  )
}
