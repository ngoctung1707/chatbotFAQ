import Image from 'next/image'
import React from 'react'
import bkfintech from '../imgs/logos/BKFintech.png'
import theasiafoundation from '../imgs/logos/TheAsiaFoundation.png'
import vwec from '../imgs/logos/VWEC.png'

export default function Partners() {
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
        paddingTop: '80px',
        paddingBottom: '80px',
      }}
    >
      <div className="container">
        <div className="cc-context-items">
          <div
            style={{
              minHeight: '150px',
              borderRadius: '24px',
              border: '2px solid #F6E4E2',
              background: 'var(--cc-bg-card)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src={bkfintech.src}
              alt="bkfintech"
              width={350}
              height={90}
              style={{ width: '350px', height: 'auto' }}
            />
          </div>
          <div
            style={{
              minHeight: '150px',
              borderRadius: '24px',
              border: '2px solid #F6E4E2',
              background: 'var(--cc-bg-card)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src={theasiafoundation.src}
              alt="theasiafoundation"
              width={350}
              height={90}
              style={{ width: '350px', height: 'auto' }}
            />
          </div>
          <div
            style={{
              minHeight: '150px',
              borderRadius: '24px',
              border: '2px solid #F6E4E2',
              background: 'var(--cc-bg-card)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src={vwec.src}
              alt="vwec"
              width={120}
              height={120}
              style={{ width: '120px', height: 'auto' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
