import Link from 'next/link'
import VideoPopup from '../elements/PopupVideo'
import { useTranslations } from 'next-intl'

export default function Banner() {
  const t = useTranslations('HomePage')
  return (
    <>
      <section className="banner-area banner-bg" id="banner" style={{ position: 'relative' }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.4,
          }}
        >
          <source src="/assets/img/banner/banner-video.mp4" type="video/mp4" />
        </video>
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
