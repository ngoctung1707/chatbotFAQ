import React from 'react'

export default function Card({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-card)',
        borderRadius: 'var(--cc-radius-xl)',
        padding: 'var(--cc-space-8)',
        border: '2px solid var(--cc-border-light)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
