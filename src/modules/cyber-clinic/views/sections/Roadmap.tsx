import React from 'react'
import SplitText from '../../components/SplitText'

const ROADMAP_ITEMS = [
  {
    badge: 'Tháng 5',
    title: 'Mở đăng ký tham gia chương trình',
  },
  {
    badge: 'Tháng 6',
    title: 'Tổ chức buổi định hướng, giới thiệu nội dung và lộ trình đào tạo',
  },
  {
    badge: 'Tháng 7',
    title: 'Triển khai chương trình đào tạo với kiến thức nền tảng và các tình huống thực tế',
  },
  {
    badge: 'Tháng 8 - Tháng 10',
    title: 'Tham gia thực hành và làm việc trực tiếp với doanh nghiệp',
  },
  {
    badge: 'Đặc biệt',
    title:
      'Một nhóm sinh viên xuất sắc sẽ được lựa chọn để tham gia các buổi thảo luận chuyên đề và huấn luyện nâng cao cùng chuyên gia',
  },
]

export default function Roadmap() {
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
        borderTop: '1px solid var(--cc-border-medium)',
        borderBottom: '1px solid var(--cc-border-medium)',
      }}
    >
      <div className="container cc-roadmap-layout">
        <div className="cc-roadmap-left">
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
              lộ trình học
            </span>
          </div>

          {/* Heading */}
          <SplitText tag="h3" text="Hành trình của bạn sẽ bắt đầu như thế nào?" textAlign="left" />
        </div>
        <div className="cc-roadmap-right">
          <div
            style={{
              padding: '80px 0',
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid var(--cc-border-medium)',
              borderRight: '1px solid var(--cc-border-medium)',
            }}
          >
            {ROADMAP_ITEMS.map((item, index) => (
              <div
                data-aos="fade-up"
                key={index}
                style={{
                  position: 'relative',
                  borderTop: '1px solid var(--cc-border-medium)',
                  borderBottom: `${index === ROADMAP_ITEMS.length - 1 ? '1px solid var(--cc-border-medium)' : 'none'}`,
                }}
              >
                {/* Timeline Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '40px',
                    top: '0px',
                    height: '100%',
                    borderLeft: '1px dashed var(--cc-border-medium)',
                    zIndex: 1,
                  }}
                />
                {/* Timeline Dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '40px',
                    top: '50%',
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'var(--cc-primary)',
                    transform: 'translate(-50%, 0%)',
                    zIndex: 2,
                  }}
                />

                {/* Card */}
                <div
                  style={{
                    padding: '40px 40px 40px 80px',
                    borderLeft: `${index === ROADMAP_ITEMS.length - 1 ? '2px solid #DF3414' : 'none'}`,
                    background: `${index === ROADMAP_ITEMS.length - 1 ? 'linear-gradient(270deg, #FFE6E6 0%, #FFFFFF 100%)' : 'none'}`,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#23191914',
                      display: 'inline-block',
                      padding: '8px 16px',
                      color: 'var(--cc-fg-primary)',
                      fontSize: 'var(--cc-text-base)',
                      marginBottom: '24px',
                    }}
                  >
                    {item.badge}
                  </div>
                  <h4
                    style={{
                      margin: 0,
                      color: `${index === ROADMAP_ITEMS.length - 1 ? 'var(--cc-fg-heading)' : 'var(--cc-fg-primary)'}`,
                    }}
                  >
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
