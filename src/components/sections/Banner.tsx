import Link from 'next/link'
import VideoPopup from '../elements/PopupVideo'

export default function Banner() {
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
                {/* <span className="sub-title" data-aos="fade-up" data-aos-delay={0}>We Are Expert In This Field</span> */}
                <h2 className="title" data-aos="fade-up" data-aos-delay={200}>
                  BKFintech
                </h2>
                <p data-aos="fade-up" data-aos-delay={400}>
                  Institute for Digital Technology and Economy (BK Fintech) was founded to connect
                  interdisciplinary research and development cooperation, including information and
                  communication technology, mathematics, and economics. Institute aims to conducts
                  research and creates innovative products to address challenges in the real world.
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
