import React from 'react'
import ButtonGradient from '../components/ButtonGradient'
import SplitText from '../components/SplitText'
import HeroBg from '../imgs/banners/hero.png'

export default function Hero() {
  return (
    <div
      className="cc-hero-bg"
      style={{
        backgroundColor: 'var(--cc-bg-light)',
        height: 'calc(100svh - 80px)',
        backgroundImage: `url(${HeroBg.src})`,
        backgroundPosition: 'right bottom',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div className="container cc-hero-content">
        <SplitText
          tag="h1"
          text={'Vườn ươm Nhân lực\nAn toàn Thông tin cho nền kinh tế số Việt Nam'}
          textAlign="left"
          style={{ maxWidth: '750px', marginBottom: '16px' }}
        />
        <h6 style={{ color: 'var(--cc-fg-secondary)', fontWeight: 400, marginBottom: '40px' }}>
          Đào tạo – Thực hành – Kết nối nhân lực an toàn thông tin cho nền kinh tế số
        </h6>
        <ButtonGradient variant="gradient" text="Đăng ký ngay" />
      </div>
    </div>
  )
}
