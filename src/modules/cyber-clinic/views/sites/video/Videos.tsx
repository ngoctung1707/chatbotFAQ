import React from 'react'

import FooterWrap from '@/modules/cyber-clinic/layout/FooterWrap'
import Video from '@/modules/cyber-clinic/views/sections/Video'
import News from '../../sections/News'
import Header from '@/modules/cyber-clinic/layout/Header'

export default function Videos() {
  return (
    <div>
      <div style={{ paddingBottom: '20px', backgroundColor: 'var(--cc-bg-page)' }}>
        <Header />
      </div>
      <Video />
      <News limit={7} />
      <FooterWrap />
    </div>
  )
}
