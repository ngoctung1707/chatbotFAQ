import React from 'react'
import SplitText from '../../../components/SplitText'
import AboutHero from '@/modules/cyber-clinic/imgs/banners/about-hero.png'


export default function HeroAbout() {
  return (
    <div
      className="cc-about-hero-rails cc-about-hero-section"
      style={{
        width: '100%',
        paddingTop: 'calc(var(--cc-space-20) * 2)',
        paddingBottom: 'var(--cc-space-20)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'var(--cc-bg-page)',
        borderTop: '1px solid var(--cc-border-medium)',
        borderBottom: '1px solid var(--cc-border-medium)',
        position: 'relative',
      }}
    >
      <div
        className="container cc-about-hero-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0',
        }}
      >
        <div
          style={{
            width: '100dvw',
            marginLeft: 'calc(50% - 50dvw)',
            marginRight: 'calc(50% - 50dvw)',
            borderTop: '1px solid var(--cc-border-medium)',
          }}
        />

        {/* Khung chữ */}
        <div
          className="cc-about-hero-textbox"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box',
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
              maxWidth: '100%',
            }}
          >
            Kinh tế số phát triển nhanh chóng đã và đang mở ra nhiều cơ hội tăng trưởng, đổi mới mô 
            hình kinh doanh và mở rộng thị trường cho các doanh nghiệp, nhưng đồng thời các doanh
            nghiệp phải đối mặt với không ít thách thức, đặc biệt là các rủi ro liên quan đến an toàn, an
            ninh mạng.
          </p>
        </div>

        <div
          className="cc-about-hero-image"
          style={{
            width: '100%',
            display: 'flex',
            gap: '24px',
            opacity: 1,
            marginTop: '0',
          }}
        >
          <img
            src={AboutHero.src}
            alt="About hero"
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        <div
          style={{
            width: '100dvw',
            marginLeft: 'calc(50% - 50dvw)',
            marginRight: 'calc(50% - 50dvw)',
            borderTop: '1px solid var(--cc-border-medium)',
          }}
        />

      </div>
    </div>
  )
}