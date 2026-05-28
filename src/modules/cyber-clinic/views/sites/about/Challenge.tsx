import Icon from '@/modules/cyber-clinic/components/Icon'
import SplitText from '@/modules/cyber-clinic/components/SplitText'
import PublishedWithChangesIcon from '@/modules/cyber-clinic/icons/PublishedWithChangesIcon'
import SecurityIcon from '@/modules/cyber-clinic/icons/SecurityIcon'
import React from 'react'

const items = [
  {
    icon: <PublishedWithChangesIcon />,
    title: 'Áp lực chuyển đổi số',
    content:
      'Yêu cầu ngày càng cao về kiến thức, kỹ năng công nghệ trong bối cảnh nền kinh tế số phát triển nhanh chóng.',
  },
  {
    icon: <SecurityIcon />,
    title: 'Rủi ro an ninh mạng',
    content:
      'Nhiều doanh nghiệp do phụ nữ làm chủ còn hạn chế nguồn nhân lực công nghệ, kỹ năng bảo mật thông tin và năng lực bảo vệ tài sản số trong môi trường trực tuyến.',
  },
]

export default function Challenge() {
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
        borderBottom: '1px solid var(--cc-border-medium)',
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
              Thách thức
            </span>
          </div>

          {/* Heading */}
          <SplitText tag="h3" text="Thách thức kép trong kỷ nguyên số" textAlign="left" />
          <p data-aos="fade-up" data-aos-delay="200" style={{ marginTop: '24px' }}>
            Bên cạnh những khó khăn, thách thức truyền thống, các doanh nghiệp do phụ nữ làm chủ còn
            phải đối mặt với nhiều thách thức mới trong kỷ nguyên số:
          </p>
        </div>
        <div className="cc-roadmap-right">
          {items.map((i, index) => (
            <div
              data-aos="fade-left"
              data-aos-delay={index * 200}
              key={index}
              className="box-state"
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
