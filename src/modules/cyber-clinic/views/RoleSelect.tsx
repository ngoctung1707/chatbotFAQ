import React from 'react'
import Link from 'next/link'
import HeroBg from '../imgs/banners/hero-student.png'
import studentImg from '../imgs/banners/student.png'
import teacherImg from '../imgs/banners/teacher.png'
import businessImg from '../imgs/banners/business.png'
import Image from 'next/image'
import ButtonGradient from '../components/ButtonGradient'

const ROLE_ITEMS = [
  {
    key: 'student',
    label: 'Học viên',
    description:
      'Khám phá lộ trình học tập, trải nghiệm và cơ hội phát triển nghề nghiệp trong lĩnh vực an toàn thông tin và chuyển đổi số.',
    img: studentImg,
  },
  {
    key: 'teacher',
    label: 'Giảng viên',
    description:
      'Tham gia chương trình Train-the-Trainer (ToT), khai thác học liệu số và đồng hành hỗ trợ doanh nghiệp về an toàn thông tin và chuyển đổi số.',
    img: teacherImg,
  },
  {
    key: 'business',
    label: 'Doanh nghiệp',
    description:
      'Tiếp cận các chương trình hỗ trợ, tư vấn và kết nối nguồn nhân lực trong lĩnh vực an toàn thông tin và chuyển đổi số.',
    img: businessImg,
  },
]

export default function RoleSelect() {
  return (
    <div
      className="cc-hero-bg"
      style={{
        backgroundColor: 'var(--cc-bg-light)',
        minHeight: '100svh',
        backgroundImage: `url(${HeroBg.src})`,
        backgroundPosition: 'right bottom',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF66',
          backdropFilter: 'blur(60px)',
          width: '100%',
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="container">
          <div
            style={{
              padding: '80px 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '24px',
            }}
          >
            {ROLE_ITEMS.map((role) => (
              <div
                key={role.key}
                className="cc-role-card"
                style={{
                  backgroundColor: 'white',
                  borderRadius: '32px',
                  padding: '8px',
                  height: '100%',
                }}
              >
                <Image
                  src={role.img.src}
                  alt={role.label}
                  width={400}
                  height={300}
                  style={{ width: '100%', height: 'auto', borderRadius: '24px' }}
                />
                <div style={{ padding: '24px 16px 16px' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', color: 'var(--cc-fg-heading)' }}>
                    {role.label}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      color: 'var(--cc-fg-secondary)',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textAlign: 'justify',
                    }}
                  >
                    {role.description}
                  </p>
                  <ButtonGradient
                    linkTo={`?user=${role.key}`}
                    target="_self"
                    variant="secondary"
                    text="Khám phá thêm"
                    style={{ marginTop: '16px', width: '100%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
