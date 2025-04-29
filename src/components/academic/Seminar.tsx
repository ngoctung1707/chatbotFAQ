import { getPayload } from 'payload'
import config from '@payload-config'
import { getUserLocale } from '@/i18n/localeService'
import SeminarSlider from './SeminarSlider'

export default async function Seminar() {
  const payload = await getPayload({ config })
  const lang = await getUserLocale()
  const { docs: seminars } = await payload.find({
    collection: 'news',
    draft: false,
    limit: 3,
    pagination: false,
    sort: ['-publishedAt'],
    where: {
      tag: {
        in: ['seminar', 'workshop'],
      },
      lang: {
        equals: lang,
      },
    },
  })

  const { docs: upcomingEvents } = await payload.find({
    collection: 'upcoming-events',
    draft: false,
    sort: ['-time'],
    where: {
      time: { greater_than: new Date() },
    },
  })

  return (
    <section
      className="services__area-three services__bg-three"
      data-background="/assets/img/bg/h3_services_bg.jpg"
      id="training"
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="section-title white-title text-center mb-50 tg-heading-subheading animation-style3">
              <h2 className="title tg-element-title">Seminar & Workshop</h2>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <SeminarSlider seminars={seminars} />
        </div>
        {/* Upcoming Events */}
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="section-title white-title text-center mb-50 tg-heading-subheading animation-style3">
              <h2 className="title tg-element-title">Upcoming Events</h2>
            </div>
          </div>
          <div className="row justify-content-center gutter-24">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="col-xl-4 col-lg-6 col-md-10">
                <div className="blog-post-item shine-animate-item">
                  <div className="blog-post-content">
                    <h2 className="title">{event.title}</h2>
                  </div>
                  <div className="blog-post-meta">
                    <ul className="list-wrap">
                      <li>
                        <i className="fas fa-calendar-alt" />
                        {new Date(event.time).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
