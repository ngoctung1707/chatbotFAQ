import React from 'react'
import Icon from './Icon'

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
        borderRadius: '32px',
        padding: '32px',
        ...style,
      }}
    >
      <Icon>{icon}</Icon>
      <h5
        style={{
          margin: '16px 0 24px',
          color: 'var(--cc-fg-primary)',
        }}
      >
        {title}
      </h5>
      <div
        style={{
          width: '100%',
          height: '1px',
          background: 'repeating-linear-gradient(to right, #d0d0d0 0 6px, transparent 6px 12px)',
          marginBottom: '40px',
        }}
      />
      {description}
    </div>
  )
}
