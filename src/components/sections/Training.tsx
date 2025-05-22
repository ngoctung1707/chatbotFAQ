import { getPayload } from 'payload'
import config from '@payload-config'
import ShortCourses from '../courses/ShortCourses'
import PublicLectures from '../courses/PublicLectures'
import { getUserLocale } from '@/i18n/localeService'

export default async function Training() {
  const lang = await getUserLocale()
  const payload = await getPayload({ config })

  const { docs: shortCourses } = await payload.find({
    collection: 'courses',
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
      <section
        className="services__area-three services__bg-three"
        data-background="/assets/img/bg/h3_services_bg.jpg"
        id="training"
      >
        <div className="container">
          {shortCourses.length > 0 && <ShortCourses shortCourses={shortCourses} page="training" />}
          {publicLectures.length > 0 && (
            <div style={{ marginTop: '50px' }}>
              <PublicLectures publicLectures={publicLectures} page="training" />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
