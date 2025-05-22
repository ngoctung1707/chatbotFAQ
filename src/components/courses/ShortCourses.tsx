import React from 'react'
import CourseCard from './CourseCard'
import { Course } from '@/payload-types'
import { useTranslations } from 'next-intl'

export default function ShortCourses({
  shortCourses,
  page,
}: {
  shortCourses: Course[]
  page: 'training' | 'courses'
}) {
  const t = useTranslations('Education.sections.courses.course')
  return (
    <div>
      <div className="row justify-content-center">
        <div className="col-lg-6">
          {page == 'courses' ? (
            <div className="section-title text-center mb-30 tg-heading-subheading animation-style3">
              <h2 className="title tg-element-title">{t('title')}</h2>
            </div>
          ) : (
            <div className="section-title white-title text-center mb-50 tg-heading-subheading animation-style3">
              <h2 className="title tg-element-title">{t('title')}</h2>
            </div>
          )}
        </div>
      </div>
      <div className="row justify-content-center gutter-24">
        {shortCourses.map((course) => (
          <CourseCard doc={course} key={course.id} />
        ))}
      </div>
    </div>
  )
}
