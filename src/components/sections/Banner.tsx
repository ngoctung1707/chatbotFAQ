import Link from 'next/link'
import VideoPopup from '../elements/PopupVideo'
import { useTranslations } from 'next-intl'

export default function Banner() {
  const t = useTranslations('HomePage')
  return (
    <>
      <section
        className="banner-area banner-bg"
        id="banner"
        data-background="/assets/img/banner/banner.gif"
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="banner-content">
                <h2 className="title" data-aos="fade-up" data-aos-delay={200}>
                  BKFintech
                </h2>
                <p data-aos="fade-up" data-aos-delay={400}>
                  {t('description')}
                </p>
                <VideoPopup />
              </div>
              <div className="banner-shape">
                <img src="/assets/img/banner/banner_shape01.png" alt="" className="rightToLeft" />
                <img src="/assets/img/banner/banner_shape02.png" alt="" className="ribbonRotate" />
              </div>
            </div>
          </div>

          <div className="banner-scroll">
            <Link href="#news">
              Scroll Down{' '}
              <span>
                <i className="fas fa-arrow-right" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
