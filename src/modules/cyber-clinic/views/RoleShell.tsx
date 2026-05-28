'use client'
import React, { useEffect } from 'react'
import Header from '@/modules/cyber-clinic/layout/Header'
import Aos from 'aos'

type RoleShellProps = {
  userKey: string
  children: React.ReactNode
  backgroundColor?: string
  backgroundImage?: string
  backgroundSize?: string
  height?: string
}

export default function RoleShell({
  userKey,
  children,
  backgroundImage,
  backgroundSize,
  height,
}: Readonly<RoleShellProps>) {
  useEffect(() => {
    Aos.init({ duration: 1000 })
  }, [])
  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#190301',
        width: '100%',
        height: height || 'calc(100svh + 300px)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '830px',
          alignSelf: 'stretch',
          background: 'linear-gradient(0deg, rgba(251, 57, 21, 0.00) 0%, #DD2604 100%)',
          backgroundSize: 'contain',
          backgroundPosition: 'center top',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '160px',
          alignSelf: 'stretch',
          background: 'linear-gradient(180deg, rgba(232, 113, 44, 0.00) 0%, #FB3915 100%)',
          backgroundSize: 'contain',
          backgroundPosition: 'center bottom',
          backdropFilter: 'blur(1px)',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: backgroundSize || 'contain',
          backgroundPosition: 'center bottom',
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
