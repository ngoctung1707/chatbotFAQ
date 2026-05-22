import React from 'react'
import SplitText from '../../../components/SplitText'


export default function HeroAbout() {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '600px',
        paddingTop: 'calc(var(--cc-space-20) * 2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '60px',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px',
          padding: '0 var(--cc-space-20) var(--cc-space-20) var(--cc-space-20)',
        }}
      >
        {/* Khung chữ */}
        <div
          style={{
            maxWidth: '1280px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <SplitText
            tag="h3"
            text="Về chương trình"
            textAlign="center"
            style={{
              color: 'var(--cc-fg-heading)',
            }}
          />
          <p
            className="lead"
            style={{
              maxWidth: '900px',
            }}
          >
            Kinh tế số phát triển nhanh chóng đã và đang mở ra nhiều cơ hội tăng trưởng, đổi mới
            mô hình kinh doanh và mở rộng thị trường cho các doanh nghiệp, nhưng đồng thời các
            doanh nghiệp phải đối mặt với không ít thách thức, đặc biệt là các rủi ro liên quan đến
            an toàn, an ninh mạng.
          </p>
        </div>

        {/* Đường dọc nét đứt */}
        <div
          data-aos="fade-in"
          data-aos-delay="300"
          style={{
            width: '1px',
            height: '126px',
            borderLeft: '1.5px dashed var(--cc-border-medium)',
            marginTop: 'var(--cc-space-10)',
          }}
        />
      </div>
    </div>
  )
}