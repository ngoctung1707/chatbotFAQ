export default function AcademicBanner() {
  return (
    <>
      <section
        className="request-area request-bg"
        data-background="/assets/img/academic/banner.jpeg"
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="request-content text-center tg-heading-subheading animation-style3">
                <h2 className="title tg-element-title">Academic</h2>
                <div className="content-bottom">
                  {/*<div className="content-right">*/}
                  <div className="content">
                    <span style={{ color: 'white' }}>
                      The Institute of Technology and Digital Economy, Hanoi University of Science
                      and Technology (BK Fintech) aims to train students, university students, and
                      working people with the necessary knowledge and skills in the digital economy
                      era; and train businesses with a tendency towards digital transformation.
                    </span>
                  </div>
                  {/*</div>*/}
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
