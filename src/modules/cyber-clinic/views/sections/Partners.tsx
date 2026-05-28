import Image from 'next/image'
import React from 'react'
import bkfintech from '../../imgs/logos/BKFintech.png'
import theasiafoundation from '../../imgs/logos/TheAsiaFoundation.png'
import vwec from '../../imgs/logos/VWEC.png'
import EmptyDiv from '../../components/EmptyDiv'

export default function Partners() {
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
      }}
    >
      <EmptyDiv />
      <div
        style={{
          borderTop: '1px solid var(--cc-border-medium)',
          borderBottom: '1px solid var(--cc-border-medium)',
        }}
      >
        <div className="container">
          <div className="cc-context-items">
            <div className="cc-partner-item-1" data-aos="fade-right">
              <Image
                src={bkfintech.src}
                alt="bkfintech"
                width={350}
                height={90}
                style={{ width: '350px', height: 'auto' }}
              />
            </div>
            <div data-aos="fade-right" data-aos-delay="200" className="cc-partner-item-2">
              <Image
                src={theasiafoundation.src}
                alt="theasiafoundation"
                width={350}
                height={90}
                style={{ width: '350px', height: 'auto' }}
              />
            </div>
            <div data-aos="fade-right" data-aos-delay="400" className="cc-partner-item-3">
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
      <EmptyDiv />
    </div>
  )
}
