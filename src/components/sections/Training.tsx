import Link from 'next/link'

export default function Training() {
  return (
    <>
      <section
        className="services__area-three services__bg-three"
        data-background="/assets/img/bg/h3_services_bg.jpg"
        id="training"
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="section-title white-title text-center mb-50 tg-heading-subheading animation-style3">
                <h2 className="title tg-element-title">Short-term courses</h2>
              </div>
            </div>
          </div>
          <div className="row justify-content-center gutter-24">
            <div className="col-xl-4 col-lg-6 col-md-10">
              <div className="blog-post-item shine-animate-item">
                <div className="blog-post-thumb">
                  <Link href="/blog-details" className="shine-animate">
                    <img src="/assets/img/training/da.png" alt="" />
                  </Link>
                  <Link href="/blog" className="post-tag">
                    4 modules
                  </Link>
                </div>
                <div className="blog-post-content">
                  <h2 className="title">
                    <Link href="/blog-details">DATA ANALYSIS</Link>
                  </h2>
                  <div className="blog-avatar">
                    <div className="avatar-content">
                      <p>
                        The course is designed to help students master data analysis using today's
                        most popular tools such as SQL, Power BI, Python and AI.
                        <br />
                        <br />
                      </p>
                    </div>
                  </div>
                  <div className="blog-post-meta">
                    <ul className="list-wrap">
                      <li>
                        <i className="fas fa-calendar-alt" />
                        72 hours training + 8 hours workshop
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-6 col-md-10">
              <div className="blog-post-item shine-animate-item">
                <div className="blog-post-thumb">
                  <Link href="/blog-details" className="shine-animate">
                    <img src="/assets/img/training/ai.jpeg" alt="" />
                  </Link>
                  <Link href="/blog" className="post-tag">
                    2 modules
                  </Link>
                </div>
                <div className="blog-post-content">
                  <h2 className="title">
                    <Link href="/#">AI FOR BEGINNERS</Link>
                  </h2>
                  <div className="blog-avatar">
                    <div className="avatar-content">
                      <p>
                        The course provides a basic knowledge base of artificial intelligence (AI),
                        AI tools and programming for beginners. <br />
                        <br />
                        <br />
                      </p>
                    </div>
                  </div>
                  <div className="blog-post-meta">
                    <ul className="list-wrap">
                      <li>
                        <i className="fas fa-calendar-alt" />
                        40 hours training + 4 hours workshop
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-6 col-md-10">
              <div className="blog-post-item shine-animate-item">
                <div className="blog-post-thumb">
                  <Link href="/blog-details" className="shine-animate">
                    <img src="/assets/img/training/ab.png" alt="" />
                  </Link>
                  <Link href="/blog" className="post-tag">
                    1 Module
                  </Link>
                </div>
                <div className="blog-post-content">
                  <h2 className="title">
                    <Link href="/blog-details">AI, BLOCKCHAIN & FINTECH FOR BEGINNERS</Link>
                  </h2>
                  <div className="blog-avatar">
                    <div className="avatar-content">
                      <p>
                        The course provides knowledge about AI, Blockchain, Fintech for students and
                        researchers, opening up future career opportunities.
                      </p>
                    </div>
                  </div>
                  <div className="blog-post-meta">
                    <ul className="list-wrap">
                      <li>
                        <i className="fas fa-calendar-alt" />
                        Free Course - 16 Hours Training
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
