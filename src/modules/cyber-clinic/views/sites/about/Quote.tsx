import SplitText from '@/modules/cyber-clinic/components/SplitText'
import React from 'react'

export default function Quote() {
  return (
    <div style={{ backgroundColor: 'var(--cc-bg-page)' }}>
      <div className="container">
        <div
          className="cc-padding-card"
          style={{
            textAlign: 'center',
            backgroundColor: 'var(--cc-bg-card)',
            borderLeft: '1px solid var(--cc-border-medium)',
            borderRight: '1px solid var(--cc-border-medium)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <SplitText
            tag="h3"
            text="“An ninh mạng – Hành trang quan trọng trên hành trình chuyển đổi số và phát triển doanh nghiệp”."
            textAlign="center"
            style={{ fontStyle: 'italic' }}
          />
          <p
            style={{ paddingTop: '24px', maxWidth: '850px', margin: '0 auto' }}
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Sự chuẩn bị bài bản về năng lực an ninh mạng hôm nay chính là bước đệm cho sự tăng
            trưởng an toàn, bền vững và vươn xa của các doanh nghiệp do phụ nữ làm chủ trong tương
            lai.
          </p>
        </div>
      </div>
    </div>
  )
}
