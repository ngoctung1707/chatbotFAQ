import React from 'react'
import Icon from '../../../components/Icon'
import NetworkIntelligenceIcon from '@/modules/cyber-clinic/icons/NetworkIntelligenceIcon'
import PublishedWithChangesIcon from '@/modules/cyber-clinic/icons/PublishedWithChangesIcon'
import AutoIcon from '@/modules/cyber-clinic/icons/AutoIcon'
import SecurityIcon from '@/modules/cyber-clinic/icons/SecurityIcon'
import BookRibbonIcon from '@/modules/cyber-clinic/icons/BookRibbonIcon'

export default function ChallengeTarget() {
  const rightColumnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: 'var(--cc-about-rail-offset)',
    maxWidth: '100%',
    height: 'fit-content',
    borderLeft: '1px solid var(--cc-border-medium)',
    padding: 0,
  }

  const challengeCardStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    background: 'var(--cc-bg-card)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--cc-border-medium)',
    boxSizing: 'border-box',
  }

  const targetCardStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    background: 'var(--cc-bg-card)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--cc-border-medium)',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        backgroundColor: 'var(--cc-bg-page)',
        position: 'relative',
      }}
    >
      <div className="cc-about-section-rail-right" />

      <div
        className="cc-about-split-section"
        style={{
          width: '100%',
          paddingBottom: '0',
          borderTopLeftRadius: '60px',
          borderTopRightRadius: '60px',
          backgroundColor: 'var(--cc-bg-page)',
          position: 'relative',
        }}
      >
        <div
          style={{
            borderTop: '1px solid var(--cc-border-medium)',
            borderBottom: '1px solid var(--cc-border-medium)',
          }}
        >
          <div className="container cc-register-student-header" style={{ alignItems: 'start' }}>
            <div
              className="cc-about-split-panel"
              style={{
                background: 'var(--cc-gradient-header)',
                borderRight: '1px solid var(--cc-primary)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '24px',
                }}
              >
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    background: 'var(--cc-border-medium)',
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
              <h2
                style={{
                  color: 'var(--cc-fg-heading)',
                  marginBottom: '24px',
                  textAlign: 'left',
                }}
              >
                Thách thức kép <br /> trong kỷ nguyên số
              </h2>
              <p
                style={{
                  color: 'var(--cc-fg-secondary)',
                  fontSize: '18px',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                Bên cạnh những khó khăn, thách thức truyền thống, các doanh nghiệp do phụ nữ làm chủ còn phải đối mặt
                với nhiều thách thức mới trong kỷ nguyên số:
              </p>
            </div>

            <div className="cc-register-student-content cc-challenge-right-column" style={rightColumnStyle}>
              <div className="cc-challenge-card cc-about-split-card" style={challengeCardStyle}>
                <Icon>
                  <PublishedWithChangesIcon />
                </Icon>
                <h4 style={{ margin: 0, color: 'var(--cc-fg-primary)' }}>Áp lực chuyển đổi số</h4>
                <p style={{ margin: 0, color: 'var(--cc-fg-secondary)', lineHeight: '1.6', fontSize: '18px' }}>
                  Yêu cầu ngày càng cao về kiến thức, kỹ năng công nghệ trong bối cảnh nền kinh tế số phát triển nhanh
                  chóng.
                </p>
              </div>

              <div className="cc-challenge-card cc-about-split-card" style={challengeCardStyle}>
                <Icon>
                  <SecurityIcon />
                </Icon>
                <h4 style={{ margin: 0, color: 'var(--cc-fg-primary)' }}>Rủi ro an ninh mạng</h4>
                <p style={{ margin: 0, color: 'var(--cc-fg-secondary)', lineHeight: '1.6', fontSize: '18px' }}>
                  Nhiều doanh nghiệp do phụ nữ làm chủ còn hạn chế nguồn nhân lực công nghệ, kỹ năng bảo mật thông tin và
                  năng lực bảo vệ tài sản số trong môi trường trực tuyến.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="cc-about-split-gap"
        style={{
          position: 'relative',
          width: '100%',
          backgroundColor: 'var(--cc-bg-page)',
        }}
      >
        <div className="cc-about-center-divider" />
      </div>

      <div
        style={{
          width: '100%',
          paddingTop: '0',
          paddingBottom: '0',
          backgroundColor: 'var(--cc-bg-page)',
          position: 'relative',
        }}
      >
        <div
          style={{
            borderTop: '1px solid var(--cc-border-medium)',
            borderBottom: '1px solid var(--cc-border-medium)',
          }}
        >
          <div className="container cc-register-student-header" style={{ alignItems: 'start' }}>
            <div
              className="cc-about-split-panel"
              style={{
                background: 'var(--cc-gradient-header)',
                borderRight: '1px solid var(--cc-primary)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '24px',
                }}
              >
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    background: 'var(--cc-border-medium)',
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
                  Mục tiêu
                </span>
              </div>
              <h2
                style={{
                  color: 'var(--cc-fg-heading)',
                  marginBottom: '24px',
                  textAlign: 'left',
                }}
              >
                Mục tiêu của dự án
              </h2>
              <p
                style={{
                  color: 'var(--cc-fg-secondary)',
                  fontSize: '18px',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                Với sự đồng hành của Quỹ Châu Á tại Việt Nam (TAF), Hội đồng Doanh nhân nữ Việt Nam (VWEC) triển khai Dự
                án hỗ trợ các doanh nghiệp do phụ nữ làm chủ nâng cao năng lực chuyển đổi số và bảo đảm an toàn thông tin,
                an ninh mạng với các mục tiêu trọng tâm:
              </p>
            </div>

            <div className="cc-register-student-content cc-target-right-column" style={rightColumnStyle}>
              <div className="cc-target-card cc-about-split-card" style={targetCardStyle}>
                <Icon>
                  <NetworkIntelligenceIcon />
                </Icon>
                <h4 style={{ margin: 0, color: 'var(--cc-fg-primary)' }}>Nâng cao năng lực thích ứng</h4>
                <p style={{ margin: 0, color: 'var(--cc-fg-secondary)', lineHeight: '1.6', fontSize: '18px' }}>
                  Cung cấp thông tin, nâng cao nhận thức cho các nữ lãnh đạo doanh nghiệp về ứng dụng hiệu quả công nghệ
                  số để nâng cao năng lực cạnh tranh.
                </p>
              </div>

              <div className="cc-target-card cc-about-split-card" style={targetCardStyle}>
                <Icon>
                  <BookRibbonIcon/>
                </Icon>
                <h4 style={{ margin: 0, color: 'var(--cc-fg-primary)' }}>Trang bị kĩ năng số và an ninh mạng</h4>
                <p style={{ margin: 0, color: 'var(--cc-fg-secondary)', lineHeight: '1.6', fontSize: '18px' }}>
                  Giúp doanh nhân nữ tự tin vận hành doanh nghiệp trước các mối đe dọa trên không gian mạng.
                </p>
              </div>

              <div className="cc-target-card cc-about-split-card" style={targetCardStyle}>
                <Icon>
                  <AutoIcon />
                </Icon>
                <h4 style={{ margin: 0, color: 'var(--cc-fg-primary)' }}>Góp phần hiện thực hóa mục tiêu quốc gia</h4>
                <p style={{ margin: 0, color: 'var(--cc-fg-secondary)', lineHeight: '1.6', fontSize: '18px' }}>
                  Thực hiện có hiệu quả các chủ trương của Đảng và Nhà nước trong phát triển kinh tế - xã hội, xây dựng đội
                  ngũ doanh nhân nữ vững mạnh, có khả năng thích ứng linh hoạt trong kỷ nguyên số.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
