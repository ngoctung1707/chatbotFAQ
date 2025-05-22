import { getPayload } from 'payload'
import config from '@payload-config'
import CourseCard from '../courses/CourseCard'
import { getUserLocale } from '@/i18n/localeService'

export default async function Courses() {
  const lang = await getUserLocale()
  const payload = await getPayload({ config })

  const { docs: shortCourses } = await payload.find({
    collection: 'courses',
    sort: ['-publishedAt'],
    draft: false,
    where: {
      tag: {
        like: 'short-course',
      },
      lang: {
        equals: lang,
      },
    },
  })

  const { docs: publicLectures } = await payload.find({
    collection: 'courses',
    sort: ['-publishedAt'],
    draft: false,
    where: {
      tag: {
        like: 'public-lecture',
      },
      lang: {
        equals: lang,
      },
    },
  })

  return (
    <>
      <section className="services__bg-three" id="courses" style={{ position: 'relative' }}>
        <div className="container">
          <div>
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="section-title text-center mb-30 tg-heading-subheading animation-style3">
                  <h2 className="title tg-element-title">Short-term Courses</h2>
                </div>
              </div>
            </div>
            <div className="row justify-content-center gutter-24">
              {shortCourses.map((course) => (
                <CourseCard doc={course} key={course.id} />
              ))}
            </div>
          </div>
          <div style={{ marginTop: '50px' }}>
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="section-title text-center mb-30 tg-heading-subheading animation-style3">
                  <h2 className="title tg-element-title">Public Lectures</h2>
                </div>
              </div>
            </div>
            <div className="row justify-content-center gutter-24">
              {publicLectures.map((course) => (
                <CourseCard doc={course} key={course.id} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0, zIndex: -1 }}>
          <img src="/assets/img/project/h2_project_shape.png" alt="" />
        </div>
        <div style={{ position: 'absolute', top: '10%', right: '5%', zIndex: -1 }}>
          <img src="/assets/img/project/project_shape02.png" alt="" style={{ opacity: 0.8 }} />
        </div>
        <div style={{ position: 'absolute', bottom: '30%', left: 0, zIndex: -1 }}>
          <img src="/assets/img/project/project_shape01.png" alt="" />
        </div>
      </section>
    </>
  )
}
