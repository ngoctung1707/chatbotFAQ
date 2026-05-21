import React from 'react'
import BookIcon from '../../icons/BookIcon'
import PartnerIcon from '../../icons/PartnerIcon'
import BusinessIcon from '../../icons/BusinessIcon'
import AutoIcon from '../../icons/AutoIcon'
import TrendingIcon from '../../icons/TrendingIcon'
import SplitText from '../../components/SplitText'
import Card from '../../components/Card'
import Icon from '../../components/Icon'

const PROGRAM_FEATURES = [
  { icon: <BookIcon />, text: 'Sinh viên được đào tạo bài bản' },
  { icon: <PartnerIcon />, text: 'Được làm việc với mentor và chuyên gia' },
  { icon: <BusinessIcon />, text: 'Được tham gia hỗ trợ doanh nghiệp thật' },
]

const PILLARS = [
  {
    icon: <BookIcon />,
    title: 'Học tập',
    items: [
      'An toàn thông tin & quản trị rủi ro',
      'Nhận diện và xử lý tình huống',
      'Case study từ thực tế',
    ],
  },
  {
    icon: <AutoIcon />,
    title: 'Trải nghiệm',
    items: [
      'Tham gia dự án hỗ trợ doanh nghiệp',
      'Làm việc với mentor',
      'Phân tích và đưa ra giải pháp',
    ],
  },
  {
    icon: <TrendingIcon />,
    title: 'Phát triển',
    items: ['Giao tiếp & teamwork', 'Tư duy phản biện', 'Làm việc chuyên nghiệp'],
  },
]

export default function ProgramInfo() {
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
        padding: '80px 0',
      }}
    >
      <div className="container">
        {/* Section label */}
        <div style={{ marginBottom: '16px' }}>
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
              textTransform: 'uppercase',
            }}
          >
            về chương trình
          </span>
        </div>

        {/* Heading */}
        <SplitText
          tag="h3"
          text={
            'Chương trình xây dựng mô hình Cyber Clinic\nVườn ươm an toàn thông tin tại Đại học Bách khoa Hà Nội'
          }
          textAlign="left"
          style={{ marginBottom: '40px' }}
        />

        {/* Feature overview card */}
        <Card>
          <p style={{ fontSize: '18px', color: 'var(--cc-fg-primary)', marginBottom: '32px' }}>
            Một không gian nơi:
          </p>
          <div className="cc-program-features">
            {PROGRAM_FEATURES.map((item, index) => (
              <div key={index} className="cc-program-features__item">
                <Icon>{item.icon}</Icon>
                <h5 style={{ marginTop: '16px', marginBottom: 0, color: 'var(--cc-fg-primary)' }}>
                  {item.text}
                </h5>
              </div>
            ))}
          </div>
        </Card>

        {/* Pillars grid */}
        <div className="cc-program-pillars">
          {PILLARS.map((pillar, index) => (
            <Card key={index} style={{ height: '100%' }}>
              <Icon>{pillar.icon}</Icon>
              <h5 style={{ marginTop: '24px', marginBottom: '8px', color: 'var(--cc-fg-primary)' }}>
                {pillar.title}
              </h5>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {pillar.items.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: '18px',
                      color: 'var(--cc-fg-secondary)',
                      lineHeight: '1.5',
                      marginBottom: '0px',
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
