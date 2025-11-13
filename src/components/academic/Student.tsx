'use client'
import React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const studentLifeImages = {
  facility: '/assets/img/student-life/hust.jpg',
  activity: '/assets/img/student-life/activities.jpg',
  community: '/assets/img/student-life/communities.jpg',
} as const

export default function Student() {
  const t = useTranslations('Education.sections.student')
  const studentLifeData = [
    {
      key: 'facility',
      title: t('items.facility.title'),
      img: studentLifeImages.facility,
      desc: t('items.facility.desc'),
      link: '/academic/facility',
    },
    {
      key: 'activity',
      title: t('items.activity.title'),
      img: studentLifeImages.activity,
      desc: t('items.activity.desc'),
      link: '/academic/activity',
    },
    {
      key: 'community',
      title: t('items.community.title'),
      img: studentLifeImages.community,
      desc: t('items.community.desc'),
      link: '/academic/community',
    },
  ] as const
  return (
    <section className="project__area-two" id="student" style={{ position: 'relative' }}>
      <div className="container" data-aos="fade-up">
        <div className="row justify-content-center mb-4">
          <div className="section-title text-center">
            <h2 className="title">{t('title')}</h2>
          </div>
          <p style={{ margin: '16px', textAlign: 'center' }}>{t('description')}</p>
        </div>
        <div className="row justify-content-center">
          {studentLifeData.map((item) => (
            <div className="col-md-4 d-flex flex-column align-items-center mb-4" key={item.key}>
              <Link href={item.link} key={item.key}>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                  }}
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    style={{ width: '100%', height: 220, objectFit: 'cover' }}
                  />
                </div>
                <h4
                  className="text-center"
                  style={{ fontWeight: 700, color: '#2B2B6A', marginTop: 24, marginBottom: 12 }}
                >
                  {item.title}
                </h4>
                <p style={{ textAlign: 'justify', fontSize: 15, maxWidth: 400 }}>{item.desc}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, right: 0, zIndex: -1 }}>
        <img src="/assets/img/project/h2_project_shape.png" alt="" />
      </div>
    </section>
  )
}
