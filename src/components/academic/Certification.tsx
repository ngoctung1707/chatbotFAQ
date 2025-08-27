import { useTranslations } from 'next-intl'

export default function Certification() {
  const t = useTranslations('Education.sections.certification')
  return (
    <section className="about__area-five">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="about__content-five">
              <div className="section-title mb-30 text-center">
                <h2 className="title">{t('title')}</h2>
              </div>
              <div className="row justify-content-center">
                <div className="col-lg-6 col-md-10 mb-40" data-aos="fade-right">
                  <img src="/assets/img/academic/cert1.png" alt="Outstanding" />
                  <div
                    className="team__content-four"
                    style={{
                      width: 'fit-content',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      background: 'var(--tg-theme-primary)',
                    }}
                  >
                    <h2 className="title">
                      <span style={{ color: 'white' }}>{t('items.completion.title')}</span>
                    </h2>
                    <span style={{ color: 'white' }}>{t('items.completion.issuer')}</span>
                  </div>
                </div>
                <div className="col-lg-6 col-md-10" data-aos="fade-left">
                  <img src="/assets/img/academic/cert2.png" alt="Outstanding" />
                  <div
                    className="team__content-four"
                    style={{
                      width: 'fit-content',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      background: 'var(--tg-theme-primary)',
                    }}
                  >
                    <h2 className="title">
                      <span style={{ color: 'white' }}>{t('items.participation.title')}</span>
                    </h2>
                    <span style={{ color: 'white' }}>{t('items.participation.issuer')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
