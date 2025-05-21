import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getUserLocale } from '@/i18n/localeService'
import { getTranslations } from 'next-intl/server'
import { Media } from '@/payload-types'

export default async function Solutions() {
  const t = await getTranslations()
  const payload = await getPayload({ config })
  const lang = await getUserLocale()
  const { docs: solutions } = await payload.find({
    collection: 'solutions',
    draft: false,
    limit: 4,
    pagination: false,
    sort: ['-createdAt'],
    where: { lang: { equals: lang } },
  })
  return (
    <>
      <section className="project__area-two" id="solutions">
        <div className="container">
          <div className="row">
            <div className="col-xl-5 col-lg-6">
              <div className="section-title mb-50 tg-heading-subheading animation-style3">
                <span className="sub-title">{t('HomePage.sections.projects.subtitle')}</span>
                <h2 className="title tg-element-title">{t('HomePage.sections.projects.title')}</h2>
              </div>
            </div>
          </div>
          <div className="row gutter-24">
            {solutions.map((solution) => (
              <div className="col-md-6" key={solution.id}>
                <div className="project__item-two">
                  <div className="project__thumb-two">
                    <img
                      src={(solution.backgroundImage as Media)?.url}
                      alt={(solution.backgroundImage as Media)?.caption}
                    />
                  </div>
                  <div className="project__content-two">
                    <h2 className="title">{solution.title}</h2>
                    <span>{solution.shortDescription}</span>
                    <div className="link-arrow link-arrow-two">
                      <Link href={`/solutions/${solution.title}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 15" fill="none">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M17.6293 3.27956C17.7117 2.80339 17.4427 2.34761 17.0096 2.17811C16.9477 2.15384 16.8824 2.13551 16.8144 2.12375L6.96087 0.419136C6.4166 0.325033 5.89918 0.689841 5.80497 1.23409C5.71085 1.77828 6.0757 2.29576 6.61988 2.38991L14.0947 3.68293L1.3658 12.6573C0.914426 12.9756 0.806485 13.5994 1.12473 14.0508C1.44298 14.5022 2.06688 14.6101 2.51825 14.2919L15.2471 5.31752L13.954 12.7923C13.8599 13.3365 14.2248 13.854 14.7689 13.9481C15.3132 14.0422 15.8306 13.6774 15.9248 13.1332L17.6293 3.27956Z"
                            fill="currentcolor"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M17.6293 3.27956C17.7117 2.80339 17.4427 2.34761 17.0096 2.17811C16.9477 2.15384 16.8824 2.13551 16.8144 2.12375L6.96087 0.419136C6.4166 0.325033 5.89918 0.689841 5.80497 1.23409C5.71085 1.77828 6.0757 2.29576 6.61988 2.38991L14.0947 3.68293L1.3658 12.6573C0.914426 12.9756 0.806485 13.5994 1.12473 14.0508C1.44298 14.5022 2.06688 14.6101 2.51825 14.2919L15.2471 5.31752L13.954 12.7923C13.8599 13.3365 14.2248 13.854 14.7689 13.9481C15.3132 14.0422 15.8306 13.6774 15.9248 13.1332L17.6293 3.27956Z"
                            fill="currentcolor"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="project__shape-wrap-two">
          <img
            src="/assets/img/project/h2_project_shape.png"
            alt=""
            data-aos="fade-left"
            data-aos-delay={400}
          />
        </div>
      </section>
    </>
  )
}
