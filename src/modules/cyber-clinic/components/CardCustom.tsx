import React from 'react'
import IconPrimary from './IconPrimary'

export default function CardCustom({
  icon,
  title,
  description,
  style,
}: {
  icon: React.ReactNode
  title: string
  description: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      className="box-state"
      style={{
        padding: '40px',
        ...style,
      }}
    >
      <IconPrimary>{icon}</IconPrimary>
      <h5
        style={{
          margin: '40px 0 20px',
          color: 'var(--cc-fg-primary)',
        }}
      >
        {title}
      </h5>
      {description}
    </div>
  )
}
