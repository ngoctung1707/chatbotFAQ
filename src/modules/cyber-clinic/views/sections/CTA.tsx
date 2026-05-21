import React from 'react'
import SplitText from '../../components/SplitText'
import ButtonGradient from '../../components/ButtonGradient'

export default function CTA() {
  return (
    <div>
      <div className="container">
        <div
          style={{
            background:
              'linear-gradient(180deg, #F4BEBE 0%, #F9ECEC 50%, rgba(255, 255, 255, 0) 100%)',
            padding: '120px 0 80px 0',
            borderRadius: '32px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <SplitText
            tag="h2"
            text="Bắt đầu hành trình của bạn trong lĩnh vực An toàn Thông tin ngay hôm nay!"
            textAlign="center"
            style={{ maxWidth: '750px', marginBottom: '40px', lineHeight: '1.1' }}
          />
          <ButtonGradient variant="primary" text="Đăng ký ngay" />
        </div>
      </div>
    </div>
  )
}
