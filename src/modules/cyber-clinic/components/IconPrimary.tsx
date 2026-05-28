import React from 'react'

export default function IconPrimary({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        background: '#BC13230D',
        border: '3.64px solid #BC13230D',
        width: '80px',
        height: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '21px',
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
          fill: '#BC1323',
          filter: 'blur(15px)',
          left: '10%',
          bottom: '10%',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
        >
          <g filter="url(#filter0_f_625_1896)">
            <circle cx="14.5458" cy="14.5456" r="10.9091" fill="#BC1323" />
          </g>
          <defs>
            <filter
              id="filter0_f_625_1896"
              x="0.000355005"
              y="0.000110865"
              width="29.0911"
              height="29.0908"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="1.81818" result="effect1_foregroundBlur_625_1896" />
            </filter>
          </defs>
        </svg>
      </div>
      {children}
    </div>
  )
}
