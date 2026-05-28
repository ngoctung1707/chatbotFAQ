import React from 'react'

import FooterWrap from '@/modules/cyber-clinic/layout/FooterWrap'
import Video from '@/modules/cyber-clinic/views/sections/Video'
import News from '../../sections/News'
import Header from '@/modules/cyber-clinic/layout/Header'

export default function About() {
  return (
    <div>
      <Header />
      <Video />    
      <News />
      <FooterWrap />
    </div>
  )
}
