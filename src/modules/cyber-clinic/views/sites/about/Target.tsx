import Icon from '@/modules/cyber-clinic/components/Icon'
import SplitText from '@/modules/cyber-clinic/components/SplitText'
import AutoIcon from '@/modules/cyber-clinic/icons/AutoIcon'
import BookRibbonIcon from '@/modules/cyber-clinic/icons/BookRibbonIcon'
import NetworkIntelligenceIcon from '@/modules/cyber-clinic/icons/NetworkIntelligenceIcon'
import React from 'react'

const items = [
  {
    icon: <NetworkIntelligenceIcon />,
    title: 'Nâng cao năng lực thích ứng',
    content:
      'Cung cấp thông tin, nâng cao nhận thức cho các nữ lãnh đạo doanh nghiệp về ứng dụng hiệu quả công nghệ số để nâng cao năng lực cạnh tranh.',
  },
  {
    icon: <BookRibbonIcon />,
    title: 'Trang bị kĩ năng số và an ninh mạng',
    content:
      'Giúp doanh nhân nữ tự tin vận hành doanh nghiệp trước các mối đe dọa trên không gian mạng.',
  },
  {
    icon: <AutoIcon />,
    title: 'Góp phần hiện thực hóa mục tiêu quốc gia',
    content:
      'Thực hiện có hiệu quả các chủ trương của Đảng và Nhà nước trong phát triển kinh tế - xã hội, xây dựng đội ngũ doanh nhân nữ vững mạnh, có khả năng thích ứng linh hoạt trong kỷ nguyên số.',
  },
]

export default function Target() {
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
        borderTop: '1px solid var(--cc-border-medium)',
      }}
    >
      <div className="container cc-roadmap-layout">
        <div className="cc-roadmap-left" style={{ borderRight: '1px solid var(--cc-primary)' }}>
          {/* Section label */}
          <div style={{ marginBottom: '32px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                background: 'var(--cc-border-medium)',
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: '8px',
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

          {/* Heading */}
          <SplitText tag="h3" text="Mục tiêu của dự án" textAlign="left" />
          <p data-aos="fade-up" data-aos-delay="200" style={{ marginTop: '24px' }}>
            Với sự đồng hành của Quỹ Châu Á tại Việt Nam (TAF), Hội đồng Doanh nhân nữ Việt Nam
            (VWEC) triển khai Dự án hỗ trợ các doanh nghiệp do phụ nữ làm chủ nâng cao năng lực
            chuyển đổi số và bảo đảm an toàn thông tin, an ninh mạng với các mục tiêu trọng tâm:
          </p>
        </div>
        <div className="cc-roadmap-right">
          {items.map((i, index) => (
            <div
              data-aos="fade-left"
              data-aos-delay={index * 200}
              className="box-state"
              key={index}
              style={{
                padding: '32px',
                borderLeft: '1px solid var(--cc-border-medium)',
                borderRight: '1px solid var(--cc-border-medium)',
                borderBottom:
                  index === items.length - 1 ? 'none' : '1px solid var(--cc-border-medium)',
              }}
            >
              <Icon>{i.icon}</Icon>
              <h4 style={{ margin: '40px 0 20px 0', color: 'var(--cc-fg-primary)' }}>{i.title}</h4>
              <p>{i.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
