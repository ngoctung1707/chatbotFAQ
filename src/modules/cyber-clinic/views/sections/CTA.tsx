import React from 'react'
import SplitText from '../../components/SplitText'
import ButtonGradient from '../../components/ButtonGradient'
import Image from 'next/image'
import ctaBg from '../../imgs/decors/cta_bg.png'
import { LINK_FORM_STUDENT } from '../../constants'

export default function CTA() {
  return (
    <div style={{ position: 'relative' }}>
      <Image
        src={ctaBg.src}
        alt="cta_bg"
        width={1920}
        height={1080}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: 0.6,
        }}
      />
      <Image
        src={ctaBg.src}
        alt="cta_bg"
        width={1920}
        height={1080}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: 0.6,
          transform: 'scaleY(-1)',
        }}
      />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="cc-cta-content">
          <SplitText
            tag="h2"
            text="Bắt đầu hành trình của bạn trong lĩnh vực An toàn Thông tin ngay hôm nay!"
            textAlign="center"
            style={{
              maxWidth: '750px',
              marginBottom: '40px',
              lineHeight: '1.1',
              color: 'var(--cc-primary)',
            }}
          />
          <ButtonGradient variant="primary" text="Đăng ký ngay" linkTo={LINK_FORM_STUDENT} />
        </div>
      </div>
    </div>
  )
}
