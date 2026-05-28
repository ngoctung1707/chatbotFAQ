import React from 'react'

export default function EmptyDiv() {
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
      }}
    >
      <div></div>
      <div style={{ height: '80px', borderLeft: '1px solid var(--cc-border-medium)' }} />
    </div>
  )
}
