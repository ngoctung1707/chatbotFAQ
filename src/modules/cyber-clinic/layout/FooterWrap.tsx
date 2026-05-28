import React from 'react'
import Footer from '@/modules/cyber-clinic/layout/Footer'
import footerBg from '@/modules/cyber-clinic/imgs/banners/footer.png'
import CTA from '../views/sections/CTA'
import Partners from '../views/sections/Partners'

export default function FooterWrap() {
  return (
    <div>
      <CTA />
      <div id="contact">
        <Footer />
      </div>
    </div>
  )
}
