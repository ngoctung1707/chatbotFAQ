import ButtonGradient from '@/modules/cyber-clinic/components/ButtonGradient'
import CardCustom from '@/modules/cyber-clinic/components/CardCustom'
import EmptyDiv from '@/modules/cyber-clinic/components/EmptyDiv'
import SplitText from '@/modules/cyber-clinic/components/SplitText'
import { LINK_FORM_BUSINESS } from '@/modules/cyber-clinic/constants'
import CheckListIcon from '@/modules/cyber-clinic/icons/CheckListIcon'
import React from 'react'

const items = [
  {
    icon: <CheckListIcon />,
    title:
      'Doanh nghiệp tham gia chương trình có thể được hỗ trợ thông qua hoạt động tư vấn, đào tạo và đồng hành triển khai theo nhu cầu thực tế.',
    description: [
      'Đánh giá nhu cầu và hiện trạng cơ bản',
      'Tư vấn về an toàn thông tin và bảo mật dữ liệu',
      'Hướng dẫn quản lý và vận hành số',
      'Chia sẻ kiến thức và nâng cao nhận thức',
      'Kết nối hỗ trợ cùng giảng viên và sinh viên',
    ],
  },
]

export default function RegisterBusiness() {
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
        <div className="container cc-register-business-layout">
          <div className="cc-register-business-left">
            <SplitText
              tag="h3"
              text="Các hoạt động hỗ trợ doanh nghiệp"
              textAlign="left"
              style={{ maxWidth: '500px', marginBottom: '40px' }}
            />
            <ButtonGradient text="Đăng ký ngay" variant="primary" linkTo={LINK_FORM_BUSINESS} />
          </div>
          <div className="cc-register-business-right">
            <div data-aos="fade-left">
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
          </div>
        </div>
      </div>
    </div>
  )
}
