import React from 'react'

export default function Icon({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        background: '#1C1B1F0D',
        border: '2.73px solid #1C1B1F0D',
        width: '60px',
        height: '60px',
        minWidth: '60px',
        minHeight: '60px',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '16px',
        backdropFilter: 'blur(25px)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '16px',
          height: '16px',
          fill: '#1C1B1F',
          filter: 'blur(10px)',
          left: '10%',
          bottom: '10%',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
        >
          <g filter="url(#filter0_f_13_22815)">
            <circle cx="10.9091" cy="10.9091" r="8.18182" fill="#1C1B1F" />
          </g>
          <defs>
            <filter
              id="filter0_f_13_22815"
              x="-8.34465e-06"
              y="2.21729e-05"
              width="21.8182"
              height="21.8182"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="1.36364" result="effect1_foregroundBlur_13_22815" />
            </filter>
          </defs>
        </svg>
      </div>
      {children}
    </div>
  )
}
