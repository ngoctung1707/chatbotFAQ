import React from 'react'

export default function QuoteAbout() {
  return (
    <div
      style={{
        width: '100%',
        padding: 'var(--cc-space-20) 0',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'var(--cc-bg-page)',
        position: 'relative',
      }}
    >
      <div className="cc-about-section-rail-left" />
      <div className="cc-about-section-rail-right" />

      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 'var(--cc-about-box-max)',
            margin: '0 auto',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 'calc(50% - 50dvw)',
              width: '100dvw',
              borderTop: '1px solid var(--cc-border-medium)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          <div
            className="cc-about-quote-card"
            style={{
              width: '100%',
              background: 'var(--cc-bg-card)',
              border: '1px solid var(--cc-border-medium)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--cc-space-6)',
              boxSizing: 'border-box',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <h3
              style={{
                color: 'var(--cc-fg-heading)',
                fontStyle: 'italic',
                textAlign: 'center',
                margin: 0,
                maxWidth: '1000px',
              }}
            >
              “An ninh mạng – Hành trang quan trọng trên hành trình chuyển đổi số và phát triển doanh
              nghiệp”.
            </h3>

            <p
              className="lead"
              style={{
                margin: 0,
                textAlign: 'center',
                maxWidth: '900px',
              }}
            >
              Sự chuẩn bị bài bản về năng lực an ninh mạng hôm nay chính là bước đệm cho sự tăng trưởng an toàn, bền
              vững và vươn xa của các doanh nghiệp do phụ nữ làm chủ trong tương lai.
            </p>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 'calc(50% - 50dvw)',
              width: '100dvw',
              borderTop: '1px solid var(--cc-border-medium)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </div>
      </div>
    </div>
  )
}