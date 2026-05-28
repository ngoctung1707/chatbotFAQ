import React from 'react'
import SplitText from '../../components/SplitText'


export default async function Video() {
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
      }}
    >
      <div
        style={{
          borderTop: '1px solid var(--cc-border-medium)',
          borderBottom: '1px solid var(--cc-border-medium)',
        }}
      >
        <div className="container cc-register-student-header">
          <div
            style={{
              height: '100%',
              padding: '80px 0 40px',
              background: 'var(--cc-gradient-header)',
              borderRight: '1px solid var(--cc-primary)',
            }}
          >
            <SplitText tag="h3" text="Video" textAlign="left" />
          </div>
          <div
            className="cc-register-student-content"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
          </div>
        </div>
      </div>
    </div>
  )
}
