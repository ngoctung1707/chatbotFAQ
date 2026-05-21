'use client'
import React, { useEffect } from 'react'
import Header from '@/modules/cyber-clinic/layout/Header'
import Footer from '@/modules/cyber-clinic/layout/Footer'
import Image from 'next/image'
import footerBg from '@/modules/cyber-clinic/imgs/banners/footer.png'
import Aos from 'aos'

type RoleShellProps = {
  children: React.ReactNode
  backgroundColor?: string
  backgroundImage?: string
  backgroundSize?: string
}

export default function RoleShell({
  children,
  backgroundColor = '#F3F7F8',
  backgroundImage,
}: Readonly<RoleShellProps>) {
  useEffect(() => {
    Aos.init({ duration: 1000 })
  }, [])
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor,
          width: '100%',
          height: 'calc(100svh + 80px)',
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'contain',
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Header />
        {children}
      </div>
    </div>
  )
}
