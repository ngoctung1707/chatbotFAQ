import React from 'react'
import SplitText from '../../../components/SplitText'

export default function ContextAbout() {
  const boxRailWrapStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 'var(--cc-about-box-max)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0',
    boxSizing: 'border-box',
  }

  const boxStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 'clamp(360px, 52vw, 484px)',
    display: 'flex',
    boxSizing: 'border-box',
    overflow: 'hidden',
  }

  const contentStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    background: 'var(--cc-bg-card)',
    borderLeft: '1px solid var(--cc-border-medium)',
    borderRight: '1px solid var(--cc-border-medium)',
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
      }}
    >
      <div className="container">
        <div className="cc-about-context-box" style={boxRailWrapStyle}>
          <div style={boxStyle}>
            <div className="cc-about-context-content" style={contentStyle}>
              <SplitText
                tag="h3"
                text="An ninh mạng – nền tảng vững chắc để tăng trưởng trong nền kinh tế số"
                textAlign="center"
                style={{
                  color: 'var(--cc-fg-heading)',
                  marginBottom: 'var(--cc-space-4)',
                }}
              />
              <p className="lead" data-aos="fade-up" data-aos-delay="200">
                Trong bối cảnh Việt Nam thúc đẩy tăng trưởng kinh tế bền vững gắn với chuyển đổi số,
                việc triển khai hiệu quả Nghị quyết số 57-NQ/TW ngày 22/12/2024 của Bộ Chính trị về
                đột phá phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số quốc gia
                đã đặt ra yêu cầu cấp thiết về nâng cao năng lực an ninh mạng cho doanh nghiệp. Nhận
                thức rõ điều này, các hoạt động trong khuôn khổ dự án được triển khai nhằm hỗ trợ
                doanh nhân nữ chủ động nắm bắt cơ hội từ nền kinh tế số, đồng thời nâng cao năng lực
                nhận diện và ứng phó hiệu quả với những thách thức trên môi trường số.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
