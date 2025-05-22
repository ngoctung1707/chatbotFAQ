import { getPayload } from 'payload'
import config from '@payload-config'
import { getUserLocale } from '@/i18n/localeService'
import ShortCourses from '../courses/ShortCourses'
import PublicLectures from '../courses/PublicLectures'

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
          {shortCourses.length > 0 && <ShortCourses shortCourses={shortCourses} page="courses" />}
          {publicLectures.length > 0 && (
            <div style={{ marginTop: '50px' }}>
              <PublicLectures publicLectures={publicLectures} page="courses" />
            </div>
          )}
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
