import { useTranslations } from 'next-intl'

export default function AcademicBanner() {
  const t = useTranslations('Education.sections.banner')
  return (
    <>
      <section
        className="request-area request-bg"
        data-background="/assets/img/academic/banner.jpeg"
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div className="request-content text-center tg-heading-subheading animation-style3">
                <h2 className="title tg-element-title">{t('title')}</h2>
                <div className="content">
                  <span style={{ color: 'white' }}>{t('description')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="request-shape">
          <img
            src="/assets/img/images/request_shape01.png"
            alt=""
            data-aos="fade-right"
            data-aos-delay={400}
          />
          <img
            src="/assets/img/images/request_shape02.png"
            alt=""
            data-aos="fade-left"
            data-aos-delay={400}
          />
        </div>
      </section>
    </>
  )
}
