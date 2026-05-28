import SplitText from '@/modules/cyber-clinic/components/SplitText'
import React from 'react'

export default function Context2() {
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
                text="Khẳng định vị thế và quyền năng kinh tế của phụ nữ Việt Nam"
                textAlign="center"
                style={{
                  color: 'var(--cc-fg-heading)',
                  marginBottom: 'var(--cc-space-4)',
                }}
              />
              <p className="lead" data-aos="fade-up" data-aos-delay="200">
                Hiện nay doanh nghiệp do phụ nữ làm chủ chiếm khoảng 24% tổng số doanh nghiệp của
                Việt Nam. Các doanh nghiệp do phụ nữ làm chủ không chỉ đóng góp đáng kể vào tăng
                trưởng kinh tế và tạo việc làm, mà còn thể hiện vai trò tiên phong trong chăm lo đời
                sống người lao động, tham gia các hoạt động cộng đồng và thúc đẩy bình đẳng giới
                trong kinh doanh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
