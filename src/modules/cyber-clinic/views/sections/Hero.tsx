'use client'

import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import bgStudent from '../../imgs/banners/hero-student.png'
import bgTeacher from '../../imgs/banners/hero-teacher.png'
import bgBusiness from '../../imgs/banners/hero-business.png'
import SplitText from '../../components/SplitText'
import ButtonGradient from '../../components/ButtonGradient'
import { LINK_FORM_BUSINESS, LINK_FORM_STUDENT, LINK_FORM_TEACHER, Role } from '../../constants'
import TabCustom from '../../components/TabCustom'

type HeroProps = {
  userKey: Role
}

const RoleInfo: {
  [key in Role]: {
    title: string
    caption: string
    description: string
    img: string
    bgColor: string
    link: string
  }
} = {
  student: {
    title: 'Học viên',
    caption: 'Phát triển kỹ năng an toàn thông tin từ học tập đến thực tế',
    description: '',
    img: bgStudent.src,
    bgColor: 'var(--cc-bg-light)',
    link: LINK_FORM_STUDENT,
  },
  teacher: {
    title: 'Giảng viên',
    caption: 'Đồng hành đào tạo và phát triển năng lực an toàn thông tin cho cộng đồng',
    description:
      'Vườn ươm Nhân lực An toàn Thông tin tại Đại học Bách khoa Hà Nội hướng tới mạng lưới giảng viên và chuyên gia đồng hành trong đào tạo, mentoring và phát triển năng lực an toàn thông tin cho sinh viên và doanh nghiệp.',
    img: bgTeacher.src,
    bgColor: '#F2F7F8',
    link: LINK_FORM_TEACHER,
  },
  business: {
    title: 'Doanh nghiệp',
    caption: 'Hỗ trợ chuyển đổi số an toàn cho doanh nghiệp',
    description:
      'Chương trình đồng hành cùng doanh nghiệp nhỏ và siêu nhỏ, hộ kinh doanh và doanh nghiệp xã hội trong nâng cao năng lực an toàn thông tin, bảo mật dữ liệu và quản lý số.',
    img: bgBusiness.src,
    bgColor: '#F2F7F8',
    link: LINK_FORM_BUSINESS,
  },
}

export default function Hero({ userKey }: HeroProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const roleInfo = RoleInfo[userKey] ?? RoleInfo.student
  const { title, description, img, caption, bgColor } = roleInfo

  const handleTabChange = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('user', key)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div
      className="cc-hero-bg"
      style={{
        // height: `${userKey != 'student' ? 'calc(100svh - 100px)' : 'calc(100svh + 200px)'}`,
        height: 'calc(100svh - 100px)',
      }}
    >
      <div className="container" style={{ paddingTop: '80px' }}>
        <div className="cc-hero-tabs">
          <TabCustom
            tabs={[
              { key: 'student', label: 'Học viên' },
              { key: 'teacher', label: 'Giảng viên' },
              { key: 'business', label: 'Doanh nghiệp' },
            ]}
            activeKey={userKey}
            onChange={handleTabChange}
          />
        </div>
        <div
          className="cc-hero-content"
          style={{
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div>
            <SplitText
              tag="h1"
              text={'Dành cho ' + title}
              textAlign="left"
              style={{
                maxWidth: '750px',
                marginBottom: '16px',
                color: 'white',
                textAlign: 'center',
              }}
            />
            <h6 data-aos="fade-up" style={{ color: 'white', fontWeight: 400 }}>
              {caption}
            </h6>
            <h6
              data-aos="fade-up"
              style={{
                marginTop: '24px',
                maxWidth: '700px',
                color: 'white',
                fontWeight: 400,
              }}
            >
              {description}
            </h6>
          </div>
          <div data-aos="fade-up">
            <ButtonGradient variant="secondary" text="Đăng ký ngay" linkTo={roleInfo.link} />
          </div>
        </div>
      </div>
    </div>
  )
}
