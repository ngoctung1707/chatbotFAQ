import React from 'react'
import SplitText from '../../../components/SplitText'
import Icon from '../../../components/Icon'
import SyncCompleteIcon from '@/modules/cyber-clinic/icons/SyncCompleteIcon'
import CheckeredShieldIcon from '@/modules/cyber-clinic/icons/CheckeredShieldIcon'

export default function Challenge() {
    return (
    <div
      style={{
        width: '100%',
        paddingTop: '160px',
        paddingBottom: '80px',
        borderTopLeftRadius: '60px',
        borderTopRightRadius: '60px',
        background: 'linear-gradient(180deg, #FAFAFA 0%, #E6E6E6 100%)',
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
          gap: '60px',
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                background: 'var(--Schemes-Outline-Variant, #CCCCCC)',
                borderRadius: '50%',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontWeight: 400,
                fontSize: '18px',
                color: 'var(--cc-fg-primary)',
              }}
            >
              Thách thức
            </span>
          </div>
          <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SplitText
              tag="h2"
              text={
                <>
                  Thách thức kép <br /> trong kỷ nguyên số
                </>
              }
              textAlign="center"
              style={{ color: '#151357' }}
            />
            <p
              style={{
                color: 'var(--cc-fg-secondary)',
                fontSize: '18px',
                lineHeight: '1.6',
                margin: 0,
              }}
            >
              Bên cạnh những khó khăn, thách thức truyền thống, các doanh nghiệp do phụ nữ làm chủ
              còn phải đối mặt với nhiều thách thức mới trong kỷ nguyên số:
            </p>
          </div>
        </div>

        {/* Khối 2 ô thách thức */}
        <div
          style={{
            width: '100%',
            maxWidth: '1280px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF80',
              backdropFilter: 'blur(20px)',
              borderRadius: '32px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <Icon>
              <SyncCompleteIcon />
            </Icon>
            <h4 style={{ margin: 0, color: 'var(--cc-fg-primary)' }}>Áp lực chuyển đổi số</h4>
            <div
              style={{
                width: '100%',
                height: '1px',
                background:
                  'repeating-linear-gradient(to right, #d0d0d0 0 6px, transparent 6px 12px)',
              }}
            />
            <p style={{ margin: 0, color: 'var(--cc-fg-secondary)', lineHeight: '1.6', fontSize: '18px' }}>
              Yêu cầu ngày càng cao về kiến thức, kỹ năng công nghệ trong bối cảnh nền kinh tế số
              phát triển nhanh chóng.
            </p>
          </div>

          {/* Ô 2 */}
          <div
            style={{
              background: '#FFFFFF80',
              backdropFilter: 'blur(20px)',
              borderRadius: '32px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <Icon>
              <CheckeredShieldIcon />
            </Icon>
            <h4 style={{ margin: 0, color: 'var(--cc-fg-primary)' }}>Rủi ro an ninh mạng</h4>
            <div
              style={{
                width: '100%',
                height: '1px',
                background:
                  'repeating-linear-gradient(to right, #d0d0d0 0 6px, transparent 6px 12px)',
              }}
            />
            <p style={{ margin: 0, color: 'var(--cc-fg-secondary)', lineHeight: '1.6', fontSize: '18px' }}>
              Nhiều doanh nghiệp do phụ nữ làm chủ còn hạn chế nguồn nhân lực công nghệ, kỹ năng
              bảo mật thông tin và năng lực bảo vệ tài sản số trong môi trường trực tuyến.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}