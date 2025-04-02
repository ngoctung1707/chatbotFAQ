import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'
import NewsCard from '@/components/news/NewsCard'
import { getUserLocale } from '@/i18n/localeService'

export default async function News() {
  const t = await getTranslations()
  const payload = await getPayload({ config })
  const lang = await getUserLocale()
  const { docs } = await payload.find({
    collection: 'news',
    limit: 3,
    pagination: false,
    sort: ['-publishedAt'],
    where: { lang: { equals: lang } },
  })
  return (
    <>
      <section
        className="services__area-four services__bg-four"
        data-background="/assets/img/bg/inner_services_bg.jpg"
        id="news"
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6">
              <div className="section-title text-center mb-40 tg-heading-subheading animation-style3">
                <h2 className="title tg-element-title">{t('HomePage.sections.news.title')}</h2>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            {docs.map((doc) => (
              <NewsCard doc={doc} key={doc.id} />
            ))}
          </div>
          <div className="row justify-content-center">
            <div className="col-xl-6">
              <div className="section-title text-center mb-40 tg-heading-subheading animation-style3">
                <Link href="/news" className="btn">
                  {t('HomePage.sections.news.seeAll')}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="blog-shape-wrap">
          <img
            src="/assets/img/images/blog_shape01.png"
            alt=""
            data-aos="fade-right"
            data-aos-delay={400}
          />
          <img
            src="/assets/img/images/blog_shape02.png"
            alt=""
            data-aos="fade-left"
            data-aos-delay={400}
          />
        </div>
      </section>
    </>
  )
}
