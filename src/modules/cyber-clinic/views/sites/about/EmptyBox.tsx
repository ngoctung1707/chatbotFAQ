import React from 'react'

export default function EmptyBox({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={className}
      style={{
        height: '80px',
        backgroundColor: 'var(--cc-bg-page)',
        borderTop: '1px solid var(--cc-border-medium)',
        borderBottom: '1px solid var(--cc-border-medium)',
        ...style,
      }}
    >
      <div className="container" style={{ height: '100%' }}>
        <div
          style={{
            height: '100%',
            borderLeft: '1px solid var(--cc-border-medium)',
            borderRight: '1px solid var(--cc-border-medium)',
          }}
        />
      </div>
    </div>
  )
}
