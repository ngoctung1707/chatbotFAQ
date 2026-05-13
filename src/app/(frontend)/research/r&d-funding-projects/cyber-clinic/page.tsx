import CTA from './modules/CTA'
import Context from './modules/Context'
import Hero from './modules/Hero'
import News from './modules/News'
import Partners from './modules/Partners'
import ProgramInfo from './modules/ProgramInfo'
import Roadmap from './modules/Roadmap'
import Users from './modules/Users'
import React from 'react'

export default function CyberClinicPage() {
  return (
    <div>
      <Hero />
      <Context />
      <div id="program-info">
        <ProgramInfo />
      </div>
      <div id="users">
        <Users />
      </div>
      <div id="roadmap">
        <Roadmap />
      </div>
      <div id="news">
        <News />
      </div>
      <Partners />
      <CTA />
    </div>
  )
}
