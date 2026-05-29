import FooterWrap from '@/modules/cyber-clinic/layout/FooterWrap'
import Header from '@/modules/cyber-clinic/layout/Header'
import React from 'react'
import LearningDocs from './LearningDocs'

export default function index() {
  return (
    <div>
      <div style={{ paddingBottom: '20px', backgroundColor: 'var(--cc-bg-page)' }}>
        <Header />
      </div>
      <LearningDocs />
      <FooterWrap />
    </div>
  )
}
