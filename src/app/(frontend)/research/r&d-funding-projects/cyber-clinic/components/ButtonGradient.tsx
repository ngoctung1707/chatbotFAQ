import React from 'react'
import ArrowIcon from '../icons/ArrowIcon'
import Link from 'next/link'

export default function ButtonGradient({
  variant,
  text,
  linkTo,
}: {
  variant: 'primary' | 'gradient'
  text: string
  linkTo?: string
}) {
  return (
    <Link href={linkTo || '#'} target="_blank">
      <div
        style={{
          textTransform: 'uppercase',
          background: `${variant == 'primary' ? 'var(--cc-secondary)' : 'var(--cc-gradient-btn)'}`,
          borderRadius: 'var(--cc-radius-lg)',
          width: 'fit-content',
          color: `${variant == 'primary' ? 'var(--cc-primary)' : 'white'}`,
          fontWeight: 600,
          fontSize: 'var(--cc-text-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px',
          paddingLeft: '24px',
          cursor: 'pointer',
        }}
      >
        {text}
        <div
          style={{
            background: 'white',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowIcon />
        </div>
      </div>
    </Link>
  )
}
