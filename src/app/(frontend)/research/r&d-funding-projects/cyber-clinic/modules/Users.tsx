import React from 'react'
import BusinessIcon from '../icons/BusinessIcon'
import Card from '../components/Card'
import Icon from '../components/Icon'
import StudentIcon from '../icons/StudentIcon'
import TeacherIcon from '../icons/TeacherIcon'
import Girl from '../imgs/decors/girl.png'
import Avatar from '../components/Avatar'
import SplitText from '../components/SplitText'

const AUDIENCE_CARDS = [
  {
    title: 'Sinh viên',
    caption:
      '(Các ngành CNTT, phân tích dữ liệu, khoa học - kỹ thuật - công nghệ, hệ thống thông tin quản lý, hoặc ngành gần.)',
    desc: [
      'Nâng cao kiến thức và kỹ năng về an toàn thông tin',
      'Học về bảo mật dữ liệu trong nền kinh tế số',
      'Phát triển kỹ năng giải quyết tình huống thực tế',
    ],
    stat: '80 – 100 sinh viên',
    statDesc: 'được đào tạo',
    icon: <StudentIcon />,
  },
  {
    title: 'Giảng viên & Chuyên gia đào tạo',
    desc: [
      'Nâng cao kiến thức chuyên sâu về an toàn thông tin',
      'Tham gia mạng lưới chuyên gia trong ngành',
      'Tiếp cận học liệu và phương pháp đào tạo hiện đại',
    ],
    stat: '10 – 15 giảng viên',
    statDesc: 'được tập huấn',
    icon: <TeacherIcon />,
  },
  {
    title: 'Doanh nghiệp nhỏ và siêu nhỏ (MSMEs)',
    desc: [
      'Nâng cao nhận thức về rủi ro an ninh mạng',
      'Tăng cường kỹ năng bảo mật cho doanh nghiệp',
      'Tiếp cận dịch vụ hỗ trợ từ vườn ươm',
    ],
    stat: '200 – 300 doanh nghiệp',
    statDesc: 'được hỗ trợ',
    icon: <BusinessIcon />,
  },
]

export default function Users() {
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
        paddingTop: '80px',
        paddingBottom: '80px',
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
            đối tượng
          </span>
        </div>

        {/* Heading */}
        <SplitText
          tag="h3"
          text="Chương trình được triển khai nhằm mang lại lợi ích cho"
          textAlign="left"
          style={{ marginBottom: '40px', maxWidth: '700px' }}
        />

        <div className="cc-context-items">
          {AUDIENCE_CARDS.map((card, index) => (
            <Card
              key={index}
              style={{
                minHeight: '520px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <Icon>{card.icon}</Icon>
                <div style={{ margin: '24px 0 16px 0' }}>
                  <h5 style={{ color: 'var(--cc-fg-primary)' }}>{card.title}</h5>
                  {card.caption && (
                    <p
                      style={{
                        fontSize: '14px',
                        color: 'var(--cc-fg-secondary)',
                      }}
                    >
                      {card.caption}
                    </p>
                  )}
                </div>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  {card.desc.map((item, i) => (
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
              </div>
              <div
                style={{
                  borderTop: '1px solid var(--cc-border-light)',
                  paddingTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex' }}>
                  <Avatar src={Girl.src} />
                  <Avatar src={Girl.src} style={{ marginLeft: '-8px' }} />
                  <Avatar src={Girl.src} style={{ marginLeft: '-8px' }} />
                </div>
                <div>
                  <p style={{ color: 'var(--cc-fg-primary)', fontWeight: 600 }}>{card.stat}</p>
                  <p style={{ fontSize: '14px' }}>{card.statDesc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
