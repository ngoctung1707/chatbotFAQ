import Image from 'next/image'
import React from 'react'

export default function Avatar({ src, style }: { src: string; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        ...style,
        width: '40px',
        height: '40px',
        borderRadius: 'var(--cc-radius-full)',
        background: 'var(--cc-bg-card)',
        overflow: 'hidden',
      }}
    >
      <Image src={src} alt="Avatar" width={40} height={40} />
    </div>
  )
}
