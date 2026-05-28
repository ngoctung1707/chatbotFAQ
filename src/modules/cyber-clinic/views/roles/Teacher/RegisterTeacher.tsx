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
    title: 'Dành cho giảng viên và cán bộ đào tạo đang công tác trong các lĩnh vực:',
    description: [
      'Công nghệ thông tin',
      'An toàn thông tin',
      'Hệ thống thông tin',
      'Khoa học dữ liệu và các ngành liên quan.',
    ],
    subDescription:
      'Ưu tiên các giảng viên quan tâm đến đào tạo thực hành, mentoring sinh viên và hoạt động hỗ trợ doanh nghiệp.',
  },
]

export default function RegisterTeacher() {
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
              text="10 - 15 giảng viên được đào tạo"
              textAlign="left"
              style={{ maxWidth: '500px', padding: '40px 0' }}
            />
          </div>
          <div className="cc-register-teacher-content">
            <ButtonGradient text="Đăng ký ngay" variant="primary" />
          </div>
        </div>
      </div>
      <div
        style={{
          borderBottom: '1px solid var(--cc-border-medium)',
        }}
      >
        <div className="container">
          <div style={{ padding: '40px 0' }} data-aos="fade-up">
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
                  <p style={{ lineHeight: '1.5', marginTop: '16px' }}>{items[0].subDescription}</p>
                </>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
