import ButtonGradient from '@/modules/cyber-clinic/components/ButtonGradient'
import CardCustom from '@/modules/cyber-clinic/components/CardCustom'
import EmptyDiv from '@/modules/cyber-clinic/components/EmptyDiv'
import SplitText from '@/modules/cyber-clinic/components/SplitText'
import CheckListIcon from '@/modules/cyber-clinic/icons/CheckListIcon'
import DoneIcon from '@/modules/cyber-clinic/icons/DoneIcon'
import React from 'react'

const items = [
  {
    icon: <CheckListIcon />,
    title: 'Điều kiện tham gia:',
    description: [
      'Có kiến thức nền tảng về công nghệ thông tin',
      'Sẵn sàng tham gia các khóa đào tạo của dự án',
      'Đạt yêu cầu đánh giá đầu vào hoặc phỏng vấn',
    ],
  },
  {
    icon: <DoneIcon />,
    title: 'Quyền lợi học viên:',
    description: [
      'Tham gia đào tạo miễn phí',
      'Được cấp chứng nhận hoàn thành',
      'Có cơ hội hỗ trợ doanh nghiệp trong dự án',
      'Được hỗ trợ kinh phí khi tham gia hoạt động hỗ trợ doanh nghiệp',
    ],
  },
]

export default function RegisterStudent() {
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
      }}
    >
      <EmptyDiv />
      <div
        style={{
          borderTop: '1px solid var(--cc-border-medium)',
          borderBottom: '1px solid var(--cc-border-medium)',
        }}
      >
        <div className="container cc-register-student-header">
          <div
            style={{
              height: '100%',
              background: 'var(--cc-gradient-header)',
              borderRight: '1px solid var(--cc-primary)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <SplitText
              tag="h3"
              text="80 - 100 học viên được đào tạo"
              textAlign="left"
              style={{ maxWidth: '500px', padding: '40px 0 40px 0' }}
            />
          </div>
          <div className="cc-register-student-content">
            <div data-aos="fade-left">
              <h6 style={{ fontWeight: 400, color: 'var(--cc-fg-primary)', marginBottom: '24px' }}>
                Sinh viên, học viên đang theo học tại các trường đại học, học viện và cơ sở đào tạo
                thuộc phạm vi dự án; ưu tiên các ngành Công nghệ thông tin, An toàn thông tin, Phân
                tích dữ liệu, Khoa học – Kỹ thuật – Công nghệ và các ngành liên quan.
              </h6>
              <ButtonGradient text="Đăng ký ngay" variant="primary" />
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          borderBottom: '1px solid var(--cc-border-medium)',
        }}
      >
        <div className="container cc-register-student-header">
          <div className="cc-register-student-card-left" data-aos="fade-right">
            <CardCustom
              style={{ width: '100%', height: '100%' }}
              icon={items[0].icon}
              title={items[0].title}
              description={
                <>
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    {items[0].description.map((desc, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: '18px',
                          color: 'var(--cc-fg-secondary)',
                          lineHeight: '1.5',
                          marginBottom: '0px',
                        }}
                      >
                        {desc}
                      </li>
                    ))}
                  </ul>
                </>
              }
            />
          </div>
          <div className="cc-register-student-card-right">
            <div data-aos="fade-left">
              <CardCustom
                style={{ width: '100%', height: '100%' }}
                icon={items[1].icon}
                title={items[1].title}
                description={
                  <>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                      {items[1].description.map((desc, i) => (
                        <li
                          key={i}
                          style={{
                            fontSize: '18px',
                            color: 'var(--cc-fg-secondary)',
                            lineHeight: '1.5',
                            marginBottom: '0px',
                          }}
                        >
                          {desc}
                        </li>
                      ))}
                    </ul>
                  </>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
