import ButtonGradient from '@/modules/cyber-clinic/components/ButtonGradient'
import SplitText from '@/modules/cyber-clinic/components/SplitText'
import React from 'react'

const ROADMAP_ITEMS = [
  {
    badge: '01',
    title: 'Mở đăng ký tham gia chương trình',
    description:
      'Doanh nghiệp gửi thông tin đăng ký đến chương trình Vườn ươm Nhân lực An toàn Thông tin',
  },
  {
    badge: '02',
    title: 'Trao đổi & khảo sát',
    description:
      'Doanh nghiệp tham gia khảo sát nhằm xác định nhu cầu thực tế và nội dung hỗ trợ phù hợp.',
  },
  {
    badge: '03',
    title: 'Kết nối sinh viên & doanh nghiệp',
    description:
      'Doanh nghiệp tham gia các buổi kết nối cùng giảng viên và sinh viên để trao đổi nhu cầu, phạm vi hỗ trợ và hình thức triển khai.',
  },
  {
    badge: '04',
    title: 'Đồng hành hỗ trợ thực tế',
    description:
      'Sinh viên, dưới sự hướng dẫn của giảng viên và mentor, sẽ trực tiếp hoặc trực tuyến đồng hành cùng doanh nghiệp trong các hoạt động hỗ trợ về an toàn thông tin, bảo mật dữ liệu và quản lý số.',
  },
]

export default function Roadmap() {
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
        borderTop: '1px solid var(--cc-border-medium)',
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
              lộ trình
            </span>
          </div>

          {/* Heading */}
          <SplitText tag="h3" text="Lộ trình đồng hành và phát triển" textAlign="left" />
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
                  backgroundColor: '#FFFFFF80',
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
                      marginBottom: '8px',
                      color: 'var(--cc-fg-primary)',
                    }}
                  >
                    {item.title}
                  </h4>
                  <p
                    style={{
                      color: 'var(--cc-fg-secondary)',
                      lineHeight: '1.5',
                    }}
                  >
                    {item.description}
                  </p>
                  {index == 0 && (
                    <div style={{ marginTop: '24px' }}>
                      <ButtonGradient text="Gửi đăng ký" variant="primary" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
