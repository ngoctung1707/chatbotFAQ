import React from 'react'
import Footer from '@/modules/cyber-clinic/layout/Footer'
import footerBg from '@/modules/cyber-clinic/imgs/banners/footer.png'
import CTA from '../views/sections/CTA'
import Partners from '../views/sections/Partners'

export default function FooterWrap() {
  return (
    <div style={{ backgroundColor: 'var(--cc-bg-page)' }}>
      <div
        style={{
          width: 'auto',
          height: '100%',
          backgroundImage: `url(${footerBg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: '60px 60px 0 0',
          padding: '80px 0 40px 0',
        }}
      >
        <CTA />
        <Partners />
        <div id="contact">
          <Footer />
        </div>
      </div>
    </div>
  )
}
