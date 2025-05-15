import { getPayload } from 'payload'
import config from '@payload-config'
import CourseCard from '../courses/CourseCard'

export default async function Training() {
  const payload = await getPayload({ config })

  const { docs: shortCourses } = await payload.find({
    collection: 'courses',
    draft: false,
    where: {
      tag: {
        like: 'short-course',
      },
    },
  })

  const { docs: publicLectures } = await payload.find({
    collection: 'courses',
    draft: false,
    where: {
      tag: {
        like: 'public-lecture',
      },
    },
  })

  return (
    <>
      <section
        className="services__area-three services__bg-three"
        data-background="/assets/img/bg/h3_services_bg.jpg"
        id="training"
      >
        <div className="container">
          <div>
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="section-title white-title text-center mb-50 tg-heading-subheading animation-style3">
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
                <div className="section-title white-title text-center mb-50 tg-heading-subheading animation-style3">
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
      </section>
    </>
  )
}
