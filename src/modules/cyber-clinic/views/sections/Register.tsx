import React from 'react'
import CardCustom from '../../components/CardCustom'
import CheckListIcon from '../../icons/CheckListIcon'
import DoneIcon from '../../icons/DoneIcon'
import { Role } from '../../constants'
import ButtonGradient from '../../components/ButtonGradient'
import SplitText from '../../components/SplitText'

const RoleInfo: {
  [key in Role]: {
    title: string
    description: string
    items: {
      icon: React.ReactNode
      title: string
      description: string[]
      subDescription: string
    }[]
  }
} = {
  student: {
    title: '80 - 100 học viên được đào tạo',
    description:
      'Sinh viên, học viên đang theo học tại các trường đại học, học viện và cơ sở đào tạo thuộc phạm vi dự án; ưu tiên các ngành Công nghệ thông tin, An toàn thông tin, Phân tích dữ liệu, Khoa học – Kỹ thuật – Công nghệ và các ngành liên quan.',
    items: [
      {
        icon: <CheckListIcon />,
        title: 'Điều kiện tham gia:',
        description: [
          'Có kiến thức nền tảng về công nghệ thông tin',
          'Sẵn sàng tham gia các khóa đào tạo của dự án',
          'Đạt yêu cầu đánh giá đầu vào hoặc phỏng vấn',
        ],
        subDescription: '',
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
        subDescription: '',
      },
    ],
  },
  teacher: {
    title: '10 - 15 giảng viên được đào tạo',
    description: '',
    items: [
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
    ],
  },
  business: {
    title: 'Các hoạt động hỗ trợ doanh nghiệp',
    description: '',
    items: [
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
        subDescription: '',
      },
    ],
  },
}

export default function Register({ userKey }: { userKey: Role }) {
  const roleInfo = RoleInfo[userKey ?? 'student']
  const { title, description, items } = roleInfo
  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
        paddingTop: '80px',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #FAFAFA 0%, #E6E6E6 100%)',
          borderRadius: '60px 60px 0 0',
          padding: '160px 0 80px',
        }}
      >
        <div className="container cc-roadmap-layout">
          <div className="cc-roadmap-left">
            <SplitText
              tag="h3"
              text={<>{title}</>}
              textAlign="left"
              style={{ maxWidth: '500px', marginBottom: '24px' }}
            />
            <p data-aos="fade-up" style={{ maxWidth: '610px', marginBottom: '40px' }}>
              {description}
            </p>
            <div data-aos="fade-up" data-aos-delay="200">
              <ButtonGradient text="đăng ký ngay" variant="primary" />
            </div>
          </div>
          <div
            className="cc-roadmap-right"
            style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '16px' }}
          >
            {items.map((item, index) => (
              <div key={index} data-aos="fade-left" style={{ width: '100%' }}>
                <CardCustom
                  style={{ width: '100%' }}
                  icon={item.icon}
                  title={item.title}
                  description={
                    <>
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {item.description.map((desc, i) => (
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
                      <p style={{ lineHeight: '1.5', marginTop: '16px' }}>{item.subDescription}</p>
                    </>
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
