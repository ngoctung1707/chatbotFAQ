'use client'
import React, { useEffect } from 'react'
import Image from 'next/image'
import Header from '@/modules/cyber-clinic/layout/Header'
import Aos from 'aos'

type RoleShellProps = {
  userKey: string
  children: React.ReactNode
  backgroundImage?: string
  backgroundSize?: string
  imageAlt?: string
}

export default function RoleShell({
  userKey,
  children,
  backgroundImage,
  backgroundSize,
  imageAlt,
}: Readonly<RoleShellProps>) {
  useEffect(() => {
    Aos.init({ duration: 1000 })
  }, [])
  const objectFit = backgroundSize === 'cover' ? 'cover' : 'contain'
  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#190301',
        width: '100%',
        height: '100svh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '700px',
          alignSelf: 'stretch',
          background: 'linear-gradient(0deg, rgba(251, 57, 21, 0.00) 0%, #DD2604 100%)',
          backgroundSize: 'contain',
          backgroundPosition: 'center top',
          backdropFilter: `${userKey === 'student' ? 'none' : 'blur(2px)'}`,
          zIndex: 1,
        }}
      />
      {userKey != 'student' && (
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
      )}
      {backgroundImage && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <Image
            src={backgroundImage}
            alt={imageAlt || 'Cyber Clinic hero'}
            fill
            priority={true}
            sizes="100vw"
            style={{ objectFit, objectPosition: 'center bottom' }}
          />
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 2, overflow: 'hidden' }}>
        <Header />
        {children}
      </div>
    </div>
  )
}
