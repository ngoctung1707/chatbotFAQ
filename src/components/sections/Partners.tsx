import Link from 'next/link'
export default function Partners() {
  return (
    <>
      <section id="partners" className="about-area pt-120 pb-120">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="about-img-wrap">
                <div className="mask-img-wrap">
                  <img src="/assets/img/partners/rikkei.jpeg" alt="" />
                </div>
                <div className="shape">
                  <img src="/assets/img/images/about_shape01.png" alt="" />
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-content">
                <div className="section-title mb-35 tg-heading-subheading animation-style3">
                  <h2 className="title tg-element-title">Partners</h2>
                </div>
                <div className="about-list">
                  <ul className="list-wrap">
                    <li>
                      <img src="/assets/img/partners/rikkei-logo.png" alt="" />
                    </li>
                  </ul>
                </div>
                <p>
                  Founded in 2012, Rikkeisoft is a leading, award-winning technology company in
                  Vietnam. Providing customized technology products and solutions to businesses for
                  over 10 years, we have built lasting and meaningful relationships with small and
                  medium-sized businesses around the world.
                </p>
                <div className="about-bottom">
                  <Link href="/about" className="btn btn-two">
                    Detail
                  </Link>
                </div>
                <div className="about-shape-wrap">
                  <img src="/assets/img/images/about_shape03.png" alt="" />
                  <img src="/assets/img/images/about_shape04.png" alt="" className="ribbonRotate" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="about-left-shape">
          <img src="/assets/img/images/about_shape02.png" alt="" />
        </div>
      </section>
    </>
  )
}
