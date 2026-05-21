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
]

export default function Roadmap() {
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
        padding: '80px 0',
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
          <SplitText
            tag="h3"
            text="Hành trình của bạn sẽ bắt đầu như thế nào?"
            textAlign="left"
            style={{ maxWidth: '500px' }}
          />
        </div>
        <div className="cc-roadmap-right">
          <div
            style={{ paddingLeft: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {ROADMAP_ITEMS.map((item, index) => (
              <div key={index} style={{ position: 'relative' }}>
                {/* Timeline Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-40px',
                    top: '0px',
                    height: 'calc(100% + 16px)',
                    borderLeft: '1px dashed var(--cc-border-medium)',
                    zIndex: 1,
                  }}
                />
                {/* Timeline Dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-40px',
                    top: '80px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cc-primary)',
                    transform: 'translate(-50%, 0%)',
                    zIndex: 2,
                    border: '2px solid var(--cc-border-medium)',
                  }}
                />

                {/* Card */}
                <div
                  data-aos="fade-up"
                  className="box-state"
                  style={{
                    borderRadius: 'var(--cc-radius-xl)',
                    padding: '32px',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      border: '2px solid var(--cc-border-medium)',
                      borderRadius: 'var(--cc-radius-full)',
                      color: 'var(--cc-fg-primary)',
                      fontSize: 'var(--cc-text-base)',
                      marginBottom: '16px',
                    }}
                  >
                    {item.badge}
                  </div>
                  <h5
                    style={{
                      margin: 0,
                      color: 'var(--cc-fg-primary)',
                    }}
                  >
                    {item.title}
                  </h5>
                </div>
              </div>
            ))}
          </div>
          <div
            data-aos="fade-up"
            style={{
              marginTop: '16px',
              backgroundColor: '#FFFFFFCC',
              borderRadius: 'var(--cc-radius-xl)',
              padding: '32px',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                border: '2px solid var(--cc-border-medium)',
                borderRadius: 'var(--cc-radius-full)',
                color: 'var(--cc-fg-primary)',
                fontSize: 'var(--cc-text-base)',
                marginBottom: '16px',
              }}
            >
              Đặc biệt
            </div>
            <h5
              style={{
                margin: 0,
                color: 'var(--cc-fg-primary)',
              }}
            >
              Một nhóm sinh viên xuất sắc sẽ được lựa chọn để tham gia các buổi thảo luận chuyên đề
              và huấn luyện nâng cao cùng chuyên gia
            </h5>
          </div>
        </div>
      </div>
    </div>
  )
}
