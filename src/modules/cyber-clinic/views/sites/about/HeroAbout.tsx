import React from 'react'
import SplitText from '../../../components/SplitText'
import AboutHero from '@/modules/cyber-clinic/imgs/banners/about-hero.png'

export default function HeroAbout() {
  return (
    <div
      className="cc-about-hero-section"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'var(--cc-bg-page)',
        position: 'relative',
      }}
    >
      <div className="container">
        <div
          className="cc-about-hero-textbox"
          style={{
            width: '100%',
            textAlign: 'center',
            borderLeft: '1px solid var(--cc-border-medium)',
            borderRight: '1px solid var(--cc-border-medium)',
          }}
        >
          <SplitText
            tag="h3"
            text="Về chương trình"
            textAlign="center"
            style={{
              color: 'var(--cc-fg-primary)',
            }}
          />
          <p
            data-aos="fade-up"
            style={{
              maxWidth: '100%',
            }}
          >
            Kinh tế số phát triển nhanh chóng đã và đang mở ra nhiều cơ hội tăng trưởng, đổi mới mô
            hình kinh doanh và mở rộng thị trường cho các doanh nghiệp, nhưng đồng thời các doanh
            nghiệp phải đối mặt với không ít thách thức, đặc biệt là các rủi ro liên quan đến an
            toàn, an ninh mạng.
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
      </div>
    </div>
  )
}
