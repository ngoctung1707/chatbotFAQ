import Hero from '@/modules/cyber-clinic/views/sections/Hero'
import CTA from '@/modules/cyber-clinic/views/sections/CTA'
import Context from '@/modules/cyber-clinic/views/sections/Context'
import News from '@/modules/cyber-clinic/views/sections/News'
import Partners from '@/modules/cyber-clinic/views/sections/Partners'
import ProgramInfo from '@/modules/cyber-clinic/views/sections/ProgramInfo'
import Roadmap from '@/modules/cyber-clinic/views/sections/Roadmap'
import Users from '@/modules/cyber-clinic/views/sections/Users'
import React from 'react'

export default function DefaultContent() {
  return (
    <div>
      <Hero userKey="student" />
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
